import "dotenv/config";
import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { INITIAL_SERIES_DATABASE, PROVIDERS } from "./server/seriesData";
import { MOVIES_DATABASE } from "./server/moviesData";
import { fetchAISeasonIntelligence, fetchLiveTheatersRadar } from "./server/geminiService";
import { getAddonManifest, seriesToMetaItem, seriesToFullMeta, IMDB_MAPPING } from "./server/bingecatAddon";
import { searchTvmazeShows } from "./shared/tvmazeService";
import { searchWikipediaMedia } from "./shared/wikipediaService";
import { Series, StreamingProviderId } from "./src/types";

function deduplicateSeriesCatalog(items: Series[]): Series[] {
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const result: Series[] = [];
  for (const s of items) {
    if (!s || !s.id) continue;
    if (seenIds.has(s.id)) continue;
    const titleKey = `${s.title.toLowerCase().trim()}-${s.mediaType || 'series'}`;
    if (seenTitles.has(titleKey)) continue;
    seenIds.add(s.id);
    seenTitles.add(titleKey);
    result.push(s);
  }
  return result;
}

let seriesDatabase: Series[] = deduplicateSeriesCatalog([
  ...INITIAL_SERIES_DATABASE.map(s => {
    const mapping = IMDB_MAPPING[s.id];
    return {
      ...s,
      imdbId: s.imdbId || mapping?.imdbId
    };
  }),
  ...MOVIES_DATABASE
]);
let currentServerWatchlist: string[] = ['severance', 'the-last-of-us', 'stranger-things', 'the-bear', 'house-of-the-dragon', 'shogun'];

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
        filtered = filtered.filter(s => s.isNowPlaying || s.theaterStatus === 'now_in_theaters');
      } else if (category === 'movies') {
        filtered = filtered.filter(s => s.mediaType === 'movie');
      } else if (category === 'series') {
        filtered = filtered.filter(s => s.mediaType !== 'movie');
      } else if (category === 'upcoming') {
        filtered = filtered.filter(s => s.isUpcoming || s.theaterStatus === 'coming_to_theaters' || (s.nextSeasonDaysLeft !== undefined && s.nextSeasonDaysLeft > 0 && s.nextSeasonDaysLeft <= 180));
      } else if (category === 'new_seasons') {
        filtered = filtered.filter(s => s.hasNewSeasonAlert || ['season_upcoming', 'renewed', 'in_production', 'final_season_upcoming'].includes(s.renewalState));
      } else if (category === 'classics') {
        filtered = filtered.filter(s => s.isClassic || s.status === 'Ended' || s.firstAirYear < 2020);
      }
    }

    // Filter by Media Kind (mediaType)
    const mediaType = req.query.mediaType;
    if (mediaType && typeof mediaType === 'string' && mediaType !== 'all') {
      if (mediaType === 'theaters') {
        filtered = filtered.filter(s => s.theaterStatus === 'now_in_theaters' || s.providers.includes('theaters'));
      } else if (mediaType === 'movie' || mediaType === 'movies') {
        filtered = filtered.filter(s => s.mediaType === 'movie');
      } else if (mediaType === 'series' || mediaType === 'tv') {
        filtered = filtered.filter(s => s.mediaType !== 'movie');
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

  // Multi-source live search: queries local catalog, Wikipedia film/TV archives, and TVMaze
  app.get("/api/series/live-search", async (req: Request, res: Response) => {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!query) {
      res.json({ results: [], source: "none" });
      return;
    }

    try {
      const qLower = query.toLowerCase();
      const localMatches = seriesDatabase
        .filter(
          s =>
            s.title.toLowerCase().includes(qLower) ||
            s.synopsis.toLowerCase().includes(qLower) ||
            (s.director && s.director.toLowerCase().includes(qLower)) ||
            (s.creator && s.creator.toLowerCase().includes(qLower)) ||
            s.genres.some(g => g.toLowerCase().includes(qLower)) ||
            (s.cast && s.cast.some(c => c.name.toLowerCase().includes(qLower) || (c.role && c.role.toLowerCase().includes(qLower)))) ||
            (s.renewalBadgeText && s.renewalBadgeText.toLowerCase().includes(qLower))
        )
        .map(s => ({ ...s, source: s.source || ('catalog' as const) }));

      // Run Wikipedia and TVMaze search in parallel
      const [wikiResults, tvmazeResults] = await Promise.all([
        searchWikipediaMedia(query).catch(err => {
          console.warn("Wikipedia search warning:", err);
          return [] as Series[];
        }),
        searchTvmazeShows(query).catch(err => {
          console.warn("TVMaze search warning:", err);
          return [] as Series[];
        }),
      ]);

      const combined: Series[] = [...localMatches];
      const seenTitles = new Set(localMatches.map(s => s.title.toLowerCase().trim()));

      // Prioritize Wikipedia for movies and cinema classics
      for (const item of wikiResults) {
        const norm = item.title.toLowerCase().trim();
        if (!seenTitles.has(norm)) {
          combined.push(item);
          seenTitles.add(norm);
        }
      }

      // Append TVMaze results for TV broadcasts
      for (const item of tvmazeResults) {
        const norm = item.title.toLowerCase().trim();
        if (!seenTitles.has(norm)) {
          combined.push({ ...item, source: 'tvmaze' as const });
          seenTitles.add(norm);
        }
      }

      res.json({
        results: combined,
        source: "multi_source",
        sourcesUsed: ["catalog", "wikipedia", "tvmaze"]
      });
    } catch (err: any) {
      console.error("Multi-source live search error:", err);
      res.status(500).json({ error: "Failed to perform multi-source search" });
    }
  });

  // Live Cinema & In-Theaters Discovery feed (Curated Box Office + Gemini Live Radar)
  app.get("/api/theaters/live-radar", async (_req: Request, res: Response) => {
    try {
      const currentYear = new Date().getFullYear();
      const localTheaters = seriesDatabase.filter(
        s =>
          s.mediaType === 'movie' &&
          s.firstAirYear === currentYear &&
          s.isDomestic !== false &&
          (s.theaterStatus === 'now_in_theaters' ||
            (s.providers.includes('theaters') && s.theaterStatus !== 'coming_to_theaters' && !s.isUpcoming))
      );

      // Attempt AI live radar for latest theater box office additions
      const aiTheaters = await fetchLiveTheatersRadar().catch(() => []);
      const combined: Series[] = [...localTheaters];
      const seenTitles = new Set(localTheaters.map(s => s.title.toLowerCase().trim()));

      for (const item of aiTheaters as Series[]) {
        const norm = item.title.toLowerCase().trim();
        if (
          !seenTitles.has(norm) &&
          item.firstAirYear === currentYear &&
          item.isDomestic !== false
        ) {
          combined.push(item);
          seenTitles.add(norm);
        }
      }

      res.json({
        total: combined.length,
        titles: combined,
        source: aiTheaters.length > 0 ? "curated+gemini_radar" : "curated_box_office"
      });
    } catch (err: any) {
      console.error("Theaters live radar error:", err);
      res.status(500).json({ error: "Failed to fetch live theater radar" });
    }
  });

  // AI Season Intelligence Endpoint (Gemini)
  app.post("/api/series/ai-season-intel", async (req: Request, res: Response) => {
    try {
      const { title, context, series } = req.body;
      if (!title || typeof title !== 'string') {
        res.status(400).json({ error: "Show title is required" });
        return;
      }

      // If series was not passed, see if it exists in local database
      const matchedSeries = series || seriesDatabase.find(s => s.title.toLowerCase() === title.toLowerCase() || s.id === title);
      const intel = await fetchAISeasonIntelligence(title, context, matchedSeries);
      res.json(intel);
    } catch (error: any) {
      console.error("AI Season Intel route error:", error);
      res.status(500).json({ error: "Failed to process season intelligence" });
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
    const { watchlist, customSeries } = req.body;
    if (Array.isArray(watchlist)) {
      // Deduplicate watchlist strings
      currentServerWatchlist = Array.from(
        new Set(watchlist.filter((id): id is string => typeof id === "string" && !!id.trim()))
      );

      // If custom/searched series were passed, upsert into seriesDatabase so Stremio can catalog them
      if (Array.isArray(customSeries)) {
        for (const item of customSeries) {
          if (item && item.id) {
            const existingIdx = seriesDatabase.findIndex(
              (s) =>
                s.id === item.id ||
                (s.title.toLowerCase().trim() === item.title.toLowerCase().trim() &&
                  s.mediaType === item.mediaType)
            );
            if (existingIdx >= 0) {
              seriesDatabase[existingIdx] = { ...seriesDatabase[existingIdx], ...item };
            } else {
              seriesDatabase.push(item);
            }
          }
        }
      }

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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const { catalogId, type } = req.params;
    const queryWatchlist = req.query.watchlist as string;
    
    let activeWatchlist = currentServerWatchlist;
    if (queryWatchlist) {
      activeWatchlist = queryWatchlist.split(',').map(s => s.trim());
    }

    let items: Series[] = [];

    if (catalogId === 'streampulse_watchlist') {
      const activeSet = new Set(activeWatchlist.map(x => x.toLowerCase().trim()));
      items = seriesDatabase.filter(s => {
        if (activeSet.has(s.id.toLowerCase())) return true;
        if (s.imdbId && activeSet.has(s.imdbId.toLowerCase())) return true;
        const mapping = IMDB_MAPPING[s.id];
        if (mapping?.imdbId && activeSet.has(mapping.imdbId.toLowerCase())) return true;
        return false;
      });
      if (type === 'movie') {
        items = items.filter(s => s.mediaType === 'movie');
      } else if (type === 'series') {
        items = items.filter(s => s.mediaType !== 'movie');
      }
      // Deduplicate items in watchlist catalog
      const seen = new Set<string>();
      items = items.filter(s => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });
    } else if (catalogId === 'streampulse_upcoming') {
      items = seriesDatabase.filter(s => s.mediaType !== 'movie' && (s.isUpcoming || (s.nextSeasonDaysLeft !== undefined && s.nextSeasonDaysLeft > 0 && s.nextSeasonDaysLeft <= 180)));
    } else if (catalogId === 'streampulse_renewals') {
      items = seriesDatabase.filter(s => s.mediaType !== 'movie' && (s.hasNewSeasonAlert || ['season_upcoming', 'renewed', 'in_production', 'final_season_upcoming'].includes(s.renewalState)));
    } else if (catalogId === 'streampulse_movies') {
      items = seriesDatabase.filter(s => s.mediaType === 'movie');
    } else {
      // streampulse_trending
      items = seriesDatabase.filter(s => s.mediaType !== 'movie').sort((a, b) => b.rating - a.rating).slice(0, 20);
    }

    const metas = items.map(seriesToMetaItem);
    res.json({ metas });
  };

  app.get(["/catalog/:type/:catalogId.json", "/catalog/:type/:catalogId/:extra.json"], handleCatalog);
  app.get(["/stremio/catalog/:type/:catalogId.json", "/stremio/catalog/:type/:catalogId/:extra.json"], handleCatalog);
  app.get(["/bingecat/catalog/:type/:catalogId.json", "/bingecat/catalog/:type/:catalogId/:extra.json"], handleCatalog);

  // 3. Addon Meta Endpoint
  const handleMeta = (req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    const { id } = req.params;
    // Look up by IMDb ID, custom ID, or slug
    const found = seriesDatabase.find(s => {
      const mapping = IMDB_MAPPING[s.id];
      return (
        s.imdbId === id ||
        mapping?.imdbId === id ||
        `streampulse:${s.id}` === id ||
        s.id === id
      );
    });

    if (!found) {
      res.status(404).json({ error: "Metadata not found" });
      return;
    }

    res.json({ meta: seriesToFullMeta(found) });
  };

  app.get("/meta/:type/:id.json", handleMeta);
  app.get("/stremio/meta/:type/:id.json", handleMeta);
  app.get("/bingecat/meta/:type/:id.json", handleMeta);

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
