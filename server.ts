import "dotenv/config";
import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { INITIAL_SERIES_DATABASE, PROVIDERS } from "./server/seriesData";
import { fetchAISeasonIntelligence } from "./server/geminiService";
import { getAddonManifest, seriesToMetaItem, seriesToFullMeta, IMDB_MAPPING } from "./server/bingecatAddon";
import {
  TmdbError,
  TmdbMediaType,
  discoverTmdb,
  fetchTmdbTitle,
  resolveTmdbCredentials,
  searchTmdb,
  trendingTmdb,
} from "./shared/tmdbService";
import {
  cleanTmdbListId,
  completeTmdbWriteAuth,
  createTmdbList,
  removeItemsFromTmdbLists,
  startTmdbWriteAuth,
  syncItemsToTmdbLists,
  TmdbListSyncItem,
} from "./shared/tmdbListSync";
import { mirrorTmdbAccountWatchlist } from "./shared/tmdbAccountWatchlist";
import { searchTvmazeShows } from "./shared/tvmazeService";
import { Series, StreamingProviderId } from "./src/types";

let seriesDatabase: Series[] = INITIAL_SERIES_DATABASE.map(s => {
  const mapping = IMDB_MAPPING[s.id];
  return {
    ...s,
    imdbId: mapping?.imdbId,
    tmdbId: mapping?.tmdbId
  };
});
let currentServerWatchlist: string[] = ['severance', 'the-last-of-us', 'stranger-things', 'the-bear', 'house-of-the-dragon', 'shogun'];

// Titles imported from TMDB by the user, persisted best-effort so they survive a restart.
const CATALOG_FILE = path.join(process.cwd(), "data", "tmdb-catalog.json");

function loadImportedTitles(): Series[] {
  try {
    const raw = fs.readFileSync(CATALOG_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Series[]) : [];
  } catch {
    return [];
  }
}

function persistImportedTitles(titles: Series[]) {
  try {
    fs.mkdirSync(path.dirname(CATALOG_FILE), { recursive: true });
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(titles, null, 2));
  } catch (err) {
    console.warn("Could not persist imported TMDB catalog:", err);
  }
}

let importedTitles: Series[] = loadImportedTitles();
seriesDatabase = [...importedTitles, ...seriesDatabase];

function parseMediaType(value: unknown): TmdbMediaType | null {
  return value === "tv" || value === "movie" ? value : null;
}

function tmdbCredentialsFor(req: Request) {
  const headerToken = req.get("x-tmdb-token");
  const bodyToken = typeof req.body?.tmdbToken === "string" ? req.body.tmdbToken : undefined;
  return resolveTmdbCredentials(headerToken || bodyToken);
}

/** Fills in TMDB ids for the app's hand-curated series from the local IMDb/TMDB mapping. */
function withKnownTmdbIds(watchlistSeries: unknown): TmdbListSyncItem[] {
  return (Array.isArray(watchlistSeries) ? watchlistSeries : []).map((item: any) => ({
    id: item.id,
    title: item.title,
    mediaType: item.mediaType === "movie" ? "movie" : "tv",
    tmdbId: item.tmdbId || IMDB_MAPPING[item.id]?.tmdbId,
  }));
}

function sendTmdbError(res: Response, err: unknown) {
  if (err instanceof TmdbError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error("TMDB request error:", err);
  res.status(500).json({ error: "Could not reach TMDB. Please try again." });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Universal CORS for Bingecat, Stremio, and web clients
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // --- API Endpoints ---
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", count: seriesDatabase.length });
  });

  // Providers list
  app.get("/api/providers", (_req: Request, res: Response) => {
    res.json(PROVIDERS);
  });

  // Series catalog with rich filtering
  app.get("/api/series", (req: Request, res: Response) => {
    const { category, provider, genre, decade, search, sortBy, statusFilter } = req.query;

    let filtered = [...seriesDatabase];

    // Filter by Category
    if (category && typeof category === 'string' && category !== 'all') {
      if (category === 'now_playing') {
        filtered = filtered.filter(s => s.isNowPlaying);
      } else if (category === 'upcoming') {
        filtered = filtered.filter(s => s.isUpcoming || (s.nextSeasonDaysLeft !== undefined && s.nextSeasonDaysLeft > 0 && s.nextSeasonDaysLeft <= 180));
      } else if (category === 'new_seasons') {
        filtered = filtered.filter(s => s.hasNewSeasonAlert || ['season_upcoming', 'renewed', 'in_production', 'final_season_upcoming'].includes(s.renewalState));
      } else if (category === 'classics') {
        filtered = filtered.filter(s => s.isClassic || s.status === 'Ended' || s.firstAirYear < 2020);
      }
    }

    // Filter by Provider
    if (provider && typeof provider === 'string' && provider !== 'all') {
      filtered = filtered.filter(s => s.providers.includes(provider as StreamingProviderId));
    }

    // Filter by Genre
    if (genre && typeof genre === 'string' && genre !== 'all') {
      filtered = filtered.filter(s => s.genres.some(g => g.toLowerCase().includes((genre as string).toLowerCase())));
    }

    // Filter by Decade
    if (decade && typeof decade === 'string' && decade !== 'all') {
      filtered = filtered.filter(s => s.decade === decade);
    }

    // Filter by Status
    if (statusFilter && typeof statusFilter === 'string' && statusFilter !== 'all') {
      if (statusFilter === 'renewed') {
        filtered = filtered.filter(s => s.renewalState === 'renewed' || s.renewalState === 'in_production');
      } else if (statusFilter === 'upcoming') {
        filtered = filtered.filter(s => s.renewalState === 'season_upcoming' || s.renewalState === 'final_season_upcoming' || s.isUpcoming);
      } else if (statusFilter === 'airing') {
        filtered = filtered.filter(s => s.isNowPlaying || s.renewalState === 'airing_now');
      } else if (statusFilter === 'concluded') {
        filtered = filtered.filter(s => s.status === 'Ended' || s.renewalState === 'concluded');
      }
    }

    // Search query
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(q) ||
        s.synopsis.toLowerCase().includes(q) ||
        s.genres.some(g => g.toLowerCase().includes(q)) ||
        s.cast.some(c => c.name.toLowerCase().includes(q)) ||
        s.renewalBadgeText.toLowerCase().includes(q) ||
        (s.network && s.network.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'countdown') {
      filtered.sort((a, b) => (a.nextSeasonDaysLeft ?? 9999) - (b.nextSeasonDaysLeft ?? 9999));
    } else if (sortBy === 'releaseDate') {
      filtered.sort((a, b) => b.firstAirYear - a.firstAirYear);
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Default: popularity / featured
      filtered.sort((a, b) => {
        if (a.hasNewSeasonAlert && !b.hasNewSeasonAlert) return -1;
        if (!a.hasNewSeasonAlert && b.hasNewSeasonAlert) return 1;
        return b.rating - a.rating;
      });
    }

    res.json({
      total: filtered.length,
      series: filtered
    });
  });

  // Series single item details
  app.get("/api/series/detail/:id", (req: Request, res: Response) => {
    const item = seriesDatabase.find(s => s.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: "Series not found" });
      return;
    }
    res.json(item);
  });

  // Live search across movies and shows: TMDB when a credential is available, TVMaze (shows only)
  // as the fallback so the finder still works without a key.
  app.get("/api/series/live-search", async (req: Request, res: Response) => {
    const query = req.query.q as string;
    if (!query || query.trim().length === 0) {
      res.json({ results: [], source: "none" });
      return;
    }

    const credentials = tmdbCredentialsFor(req);
    if (credentials) {
      const type = parseMediaType(req.query.type) ?? "multi";
      try {
        res.json({ results: await searchTmdb(credentials, query, type), source: "tmdb" });
        return;
      } catch (err) {
        console.warn("TMDB search failed, falling back to TVMaze:", err);
      }
    }

    try {
      res.json({ results: await searchTvmazeShows(query), source: "tvmaze" });
    } catch (err: any) {
      console.error("TVMaze proxy error:", err);
      res.status(500).json({ error: "Failed to fetch live show data" });
    }
  });

  // AI Season Intelligence Endpoint (Gemini)
  app.post("/api/series/ai-season-intel", async (req: Request, res: Response) => {
    try {
      const { title, context } = req.body;
      if (!title || typeof title !== 'string') {
        res.status(400).json({ error: "Show title is required" });
        return;
      }

      const intel = await fetchAISeasonIntelligence(title, context);
      res.json(intel);
    } catch (error: any) {
      console.error("AI Season Intel route error:", error);
      res.status(500).json({ error: "Failed to process season intelligence" });
    }
  });

  // ==========================================
  // --- TMDB DIRECT INTEGRATION ENDPOINTS ----
  // ==========================================

  // Whether the server has a TMDB key configured (so the UI can prompt for one if not)
  app.get("/api/tmdb/status", (_req: Request, res: Response) => {
    res.json({
      configured: Boolean(resolveTmdbCredentials()),
      importedCount: importedTitles.length,
    });
  });

  // Search TMDB for movies and shows to add to the catalog
  app.get("/api/tmdb/search", async (req: Request, res: Response) => {
    const credentials = tmdbCredentialsFor(req);
    if (!credentials) {
      res.status(400).json({ error: "No TMDB API key configured. Add TMDB_API_KEY or paste a TMDB token.", needsToken: true });
      return;
    }

    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!query) {
      res.json({ results: [] });
      return;
    }

    const type = req.query.type === "tv" || req.query.type === "movie" ? req.query.type : "multi";
    try {
      const results = await searchTmdb(credentials, query, type);
      res.json({ results });
    } catch (err) {
      sendTmdbError(res, err);
    }
  });

  // Trending TMDB titles, used as the default suggestions in the picker
  app.get("/api/tmdb/trending", async (req: Request, res: Response) => {
    const credentials = tmdbCredentialsFor(req);
    if (!credentials) {
      res.status(400).json({ error: "No TMDB API key configured. Add TMDB_API_KEY or paste a TMDB token.", needsToken: true });
      return;
    }

    const type = req.query.type === "tv" || req.query.type === "movie" ? req.query.type : "all";
    try {
      const results = await trendingTmdb(credentials, type);
      res.json({ results });
    } catch (err) {
      sendTmdbError(res, err);
    }
  });

  // Popularity-ordered TMDB pages backing the Series and Movies browse grids
  app.get("/api/tmdb/discover", async (req: Request, res: Response) => {
    const credentials = tmdbCredentialsFor(req);
    if (!credentials) {
      res.status(400).json({ error: "No TMDB API key configured. Add TMDB_API_KEY or paste a TMDB token.", needsToken: true });
      return;
    }

    const mediaType = parseMediaType(req.query.type);
    if (!mediaType) {
      res.status(400).json({ error: "A media type of tv or movie is required." });
      return;
    }

    try {
      res.json(await discoverTmdb(credentials, mediaType, Number(req.query.page) || 1));
    } catch (err) {
      sendTmdbError(res, err);
    }
  });

  // Full TMDB metadata for a single title (providers, cast, seasons)
  app.get("/api/tmdb/title/:mediaType/:tmdbId", async (req: Request, res: Response) => {
    const credentials = tmdbCredentialsFor(req);
    if (!credentials) {
      res.status(400).json({ error: "No TMDB API key configured. Add TMDB_API_KEY or paste a TMDB token.", needsToken: true });
      return;
    }

    const mediaType = parseMediaType(req.params.mediaType);
    const tmdbId = Number(req.params.tmdbId);
    if (!mediaType || !Number.isFinite(tmdbId)) {
      res.status(400).json({ error: "A valid media type (tv|movie) and numeric TMDB id are required." });
      return;
    }

    try {
      res.json(await fetchTmdbTitle(credentials, mediaType, tmdbId));
    } catch (err) {
      sendTmdbError(res, err);
    }
  });

  // Import a TMDB title into the StreamPulse catalog
  app.post("/api/catalog/tmdb", async (req: Request, res: Response) => {
    const credentials = tmdbCredentialsFor(req);
    if (!credentials) {
      res.status(400).json({ error: "No TMDB API key configured. Add TMDB_API_KEY or paste a TMDB token.", needsToken: true });
      return;
    }

    const mediaType = parseMediaType(req.body?.mediaType);
    const tmdbId = Number(req.body?.tmdbId);
    if (!mediaType || !Number.isFinite(tmdbId)) {
      res.status(400).json({ error: "A valid media type (tv|movie) and numeric TMDB id are required." });
      return;
    }

    try {
      const series = await fetchTmdbTitle(credentials, mediaType, tmdbId);
      const existing = seriesDatabase.findIndex(s => s.id === series.id || (s.tmdbId === series.tmdbId && s.mediaType === mediaType));
      if (existing >= 0) {
        seriesDatabase[existing] = { ...seriesDatabase[existing], ...series, id: seriesDatabase[existing].id };
        importedTitles = importedTitles.map(s => (s.id === series.id ? series : s));
        persistImportedTitles(importedTitles);
        res.json({ series: seriesDatabase[existing], alreadyInCatalog: true });
        return;
      }

      importedTitles = [series, ...importedTitles];
      seriesDatabase = [series, ...seriesDatabase];
      persistImportedTitles(importedTitles);
      res.json({ series, alreadyInCatalog: false });
    } catch (err) {
      sendTmdbError(res, err);
    }
  });

  // Remove a previously imported TMDB title
  app.delete("/api/catalog/tmdb/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    if (!importedTitles.some(s => s.id === id)) {
      res.status(404).json({ error: "That title was not imported from TMDB." });
      return;
    }

    importedTitles = importedTitles.filter(s => s.id !== id);
    seriesDatabase = seriesDatabase.filter(s => s.id !== id);
    currentServerWatchlist = currentServerWatchlist.filter(watchId => watchId !== id);
    persistImportedTitles(importedTitles);
    res.json({ success: true, importedCount: importedTitles.length });
  });

  // Step 1: Request TMDB write-permission token
  app.post("/api/tmdb/auth-start", async (req: Request, res: Response) => {
    try {
      const { readToken, redirectTo } = req.body;
      const { requestToken, authUrl } = await startTmdbWriteAuth(String(readToken ?? ""), redirectTo);
      res.json({ success: true, request_token: requestToken, authUrl });
    } catch (err) {
      sendTmdbError(res, err);
    }
  });

  // Step 2: Exchange approved request_token for Write Access Token & Sync
  app.post("/api/tmdb/auth-complete", async (req: Request, res: Response) => {
    try {
      const { readToken, requestToken, listId, movieListId, watchlistSeries, syncAccountWatchlist } = req.body;
      const { accessToken, accountId } = await completeTmdbWriteAuth(
        String(readToken ?? ""),
        String(requestToken ?? "")
      );
      const items = withKnownTmdbIds(watchlistSeries);
      const sync = await syncItemsToTmdbLists(listId, movieListId, accessToken, items);
      const mirror = await mirrorTmdbAccountWatchlist(syncAccountWatchlist, readToken, accessToken, items, true);
      res.json({ success: true, userAccessToken: accessToken, accountId, ...sync, ...mirror });
    } catch (err) {
      sendTmdbError(res, err);
    }
  });

  app.post("/api/tmdb/sync-to-list", async (req: Request, res: Response) => {
    try {
      const { listId, movieListId, apiKey, readToken, watchlistSeries, syncAccountWatchlist } = req.body;
      const items = withKnownTmdbIds(watchlistSeries);
      const sync = await syncItemsToTmdbLists(listId, movieListId, String(apiKey ?? ""), items);
      const mirror = await mirrorTmdbAccountWatchlist(syncAccountWatchlist, readToken, apiKey, items, true);
      res.json({ success: true, listId: cleanTmdbListId(listId), ...sync, ...mirror });
    } catch (err) {
      sendTmdbError(res, err);
    }
  });

  app.post("/api/tmdb/remove-from-list", async (req: Request, res: Response) => {
    try {
      const { listId, movieListId, apiKey, readToken, items, watchlistSeries, syncAccountWatchlist } = req.body;
      const syncItems = withKnownTmdbIds(items ?? watchlistSeries);
      const removal = await removeItemsFromTmdbLists(listId, movieListId, String(apiKey ?? ""), syncItems);
      const mirror = await mirrorTmdbAccountWatchlist(syncAccountWatchlist, readToken, apiKey, syncItems, false);
      res.json({ success: true, ...removal, ...mirror });
    } catch (err) {
      sendTmdbError(res, err);
    }
  });

  app.post("/api/tmdb/create-list", async (req: Request, res: Response) => {
    try {
      const { writeToken, name, description } = req.body;
      const listId = await createTmdbList(String(writeToken ?? ""), String(name ?? ""), description);
      res.json({ success: true, listId });
    } catch (err) {
      sendTmdbError(res, err);
    }
  });

  // ==========================================
  // --- BINGECAT & STREMIO ADDON ENDPOINTS ---
  // ==========================================

  // Watchlist Sync endpoint (keeps server in sync with user's frontend watchlist)
  app.get("/api/watchlist/sync", (_req: Request, res: Response) => {
    res.json({ watchlist: currentServerWatchlist });
  });

  app.post("/api/watchlist/sync", (req: Request, res: Response) => {
    const { watchlist } = req.body;
    if (Array.isArray(watchlist)) {
      currentServerWatchlist = watchlist;
      res.json({ success: true, count: currentServerWatchlist.length });
    } else {
      res.status(400).json({ error: "Invalid watchlist array" });
    }
  });

  // Bingecat-formatted JSON list export (for "My Lists" / "Collections")
  app.get("/api/bingecat/export.json", (_req: Request, res: Response) => {
    const watchlistedSeries = seriesDatabase.filter(s => currentServerWatchlist.includes(s.id));
    const exportData = {
      name: "StreamPulse Watchlist & Season Premieres",
      description: "Synchronized from StreamPulse series tracker",
      updatedAt: new Date().toISOString(),
      itemCount: watchlistedSeries.length,
      items: watchlistedSeries.map(s => {
        const mapping = IMDB_MAPPING[s.id];
        return {
          title: s.title,
          year: s.firstAirYear,
          imdbId: mapping?.imdbId || null,
          tmdbId: mapping?.tmdbId || null,
          provider: s.primaryProvider,
          network: s.network,
          rating: s.rating,
          status: s.status,
          renewalState: s.renewalState,
          renewalBadgeText: s.renewalBadgeText,
          nextSeasonReleaseDate: s.nextSeasonReleaseDate || null,
          genres: s.genres,
          overview: s.synopsis
        };
      })
    };
    res.setHeader("Content-Disposition", 'attachment; filename="streampulse-bingecat-watchlist.json"');
    res.json(exportData);
  });

  // 1. Addon Manifest
  const handleManifest = (req: Request, res: Response) => {
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    res.json(getAddonManifest(baseUrl));
  };

  app.get("/bingecat/manifest.json", handleManifest);
  app.get("/stremio/manifest.json", handleManifest);
  app.get("/addon/manifest.json", handleManifest);
  app.get("/manifest.json", handleManifest);

  // 2. Addon Catalog Endpoint
  const handleCatalog = (req: Request, res: Response) => {
    const { catalogId } = req.params;
    const queryWatchlist = req.query.watchlist as string;
    
    let activeWatchlist = currentServerWatchlist;
    if (queryWatchlist) {
      activeWatchlist = queryWatchlist.split(',').map(s => s.trim());
    }

    let items: Series[] = [];

    if (catalogId === 'streampulse_watchlist') {
      items = seriesDatabase.filter(s => activeWatchlist.includes(s.id));
      if (items.length === 0) {
        // Fallback to top featured if empty
        items = seriesDatabase.slice(0, 6);
      }
    } else if (catalogId === 'streampulse_upcoming') {
      items = seriesDatabase.filter(s => s.isUpcoming || (s.nextSeasonDaysLeft !== undefined && s.nextSeasonDaysLeft > 0 && s.nextSeasonDaysLeft <= 180));
    } else if (catalogId === 'streampulse_renewals') {
      items = seriesDatabase.filter(s => s.hasNewSeasonAlert || ['season_upcoming', 'renewed', 'in_production', 'final_season_upcoming'].includes(s.renewalState));
    } else {
      // streampulse_trending
      items = [...seriesDatabase].sort((a, b) => b.rating - a.rating).slice(0, 15);
    }

    const metas = items.map(seriesToMetaItem);
    res.json({ metas });
  };

  app.get("/bingecat/catalog/series/:catalogId.json", handleCatalog);
  app.get("/bingecat/catalog/series/:catalogId/:extra.json", handleCatalog);
  app.get("/stremio/catalog/series/:catalogId.json", handleCatalog);
  app.get("/stremio/catalog/series/:catalogId/:extra.json", handleCatalog);
  app.get("/catalog/series/:catalogId.json", handleCatalog);
  app.get("/catalog/series/:catalogId/:extra.json", handleCatalog);

  // 3. Addon Meta Endpoint
  const handleMeta = (req: Request, res: Response) => {
    const { id } = req.params;
    // Look up by IMDb ID or streampulse ID
    let found = seriesDatabase.find(s => {
      const mapping = IMDB_MAPPING[s.id];
      return mapping?.imdbId === id || `streampulse:${s.id}` === id || s.id === id;
    });

    if (!found) {
      res.status(404).json({ error: "Series metadata not found" });
      return;
    }

    res.json({ meta: seriesToFullMeta(found) });
  };

  app.get("/bingecat/meta/series/:id.json", handleMeta);
  app.get("/stremio/meta/series/:id.json", handleMeta);
  app.get("/meta/series/:id.json", handleMeta);

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StreamPulse Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
