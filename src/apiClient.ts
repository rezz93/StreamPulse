import { fetchTmdbTitle, resolveTmdbCredentials, searchTmdb, trendingTmdb, TmdbError, TmdbMediaType } from '../shared/tmdbService';
import {
  cleanTmdbListId,
  completeTmdbWriteAuth,
  createTmdbList,
  removeItemsFromTmdbLists,
  startTmdbWriteAuth,
  syncItemsToTmdbLists,
  TmdbListSyncItem,
} from '../shared/tmdbListSync';
import { mirrorTmdbAccountWatchlist } from '../shared/tmdbAccountWatchlist';
import { searchTvmazeShows } from '../shared/tvmazeService';
import { getStoredTmdbToken } from './tmdbToken';
import { Series } from './types';

/**
 * Static builds (GitHub Pages) ship without the Express backend: the catalog is baked
 * into JSON at build time and everything else talks to TMDB/TVMaze straight from the
 * browser using the visitor's own TMDB key.
 */
export const IS_STATIC_BUILD = import.meta.env.VITE_STATIC_BUILD === 'true';

const STATIC_CATALOG_KEY = 'streampulse_static_catalog';
const BASE_URL = import.meta.env.BASE_URL;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const unavailable = (feature: string) =>
  json({ error: `${feature} needs the StreamPulse server and is unavailable in the static build.` }, 501);

function readStaticCatalog(): Series[] {
  try {
    const raw = localStorage.getItem(STATIC_CATALOG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Series[]) : [];
  } catch {
    return [];
  }
}

function writeStaticCatalog(titles: Series[]) {
  try {
    localStorage.setItem(STATIC_CATALOG_KEY, JSON.stringify(titles));
  } catch (err) {
    console.warn('Could not persist imported titles locally:', err);
  }
}

function staticCredentials() {
  const credentials = resolveTmdbCredentials(getStoredTmdbToken());
  if (!credentials) {
    throw new TmdbError('Add your TMDB API key to search and import titles.', 401);
  }
  return credentials;
}

async function staticSeries(): Promise<Response> {
  const response = await fetch(`${BASE_URL}api/series.json`);
  if (!response.ok) return json({ error: 'Static catalog is missing.' }, 500);
  const data = (await response.json()) as { series: Series[] };
  const imported = readStaticCatalog();
  const seeded = (data.series ?? []).filter((s) => !imported.some((i) => i.id === s.id));
  const series = [...imported, ...seeded];
  return json({ total: series.length, series });
}

async function staticImport(mediaType: TmdbMediaType, tmdbId: number): Promise<Response> {
  const series = await fetchTmdbTitle(staticCredentials(), mediaType, tmdbId);
  const catalog = readStaticCatalog();
  const existing = catalog.findIndex((s) => s.id === series.id);
  const alreadyInCatalog = existing >= 0;
  if (alreadyInCatalog) catalog[existing] = series;
  else catalog.unshift(series);
  writeStaticCatalog(catalog);
  return json({ series, alreadyInCatalog });
}

async function handleStatically(url: URL, init?: RequestInit): Promise<Response> {
  const { pathname, searchParams } = url;
  const method = (init?.method ?? 'GET').toUpperCase();
  const body = typeof init?.body === 'string' ? JSON.parse(init.body) : {};
  const mediaType = (searchParams.get('type') ?? 'multi') as TmdbMediaType | 'multi' | 'all';

  if (pathname === '/api/providers') return fetch(`${BASE_URL}api/providers.json`);
  if (pathname === '/api/series') return staticSeries();
  if (pathname === '/api/watchlist/sync') return json({ success: true, static: true });

  if (pathname === '/api/series/live-search') {
    const query = searchParams.get('q') ?? '';
    if (!query.trim()) return json({ results: [] });
    return json({ results: await searchTvmazeShows(query) });
  }

  if (pathname === '/api/tmdb/status') {
    return json({ configured: false, importedCount: readStaticCatalog().length });
  }
  if (pathname === '/api/tmdb/search') {
    const query = searchParams.get('q') ?? '';
    const results = await searchTmdb(staticCredentials(), query, mediaType as TmdbMediaType | 'multi');
    return json({ results });
  }
  if (pathname === '/api/tmdb/trending') {
    const results = await trendingTmdb(staticCredentials(), mediaType as TmdbMediaType | 'all');
    return json({ results });
  }
  if (pathname.startsWith('/api/tmdb/title/')) {
    const [, , , , type, id] = pathname.split('/');
    return json(await fetchTmdbTitle(staticCredentials(), type as TmdbMediaType, Number(id)));
  }

  if (pathname === '/api/catalog/tmdb' && method === 'POST') {
    return staticImport(body.mediaType as TmdbMediaType, Number(body.tmdbId));
  }
  if (pathname.startsWith('/api/catalog/tmdb/') && method === 'DELETE') {
    const id = decodeURIComponent(pathname.slice('/api/catalog/tmdb/'.length));
    const remaining = readStaticCatalog().filter((s) => s.id !== id);
    writeStaticCatalog(remaining);
    return json({ success: true, importedCount: remaining.length });
  }

  // TMDB list writes go straight to api.themoviedb.org (CORS-enabled), so they work here too.
  if (pathname === '/api/tmdb/auth-start' && method === 'POST') {
    const { requestToken, authUrl } = await startTmdbWriteAuth(body.readToken, window.location.href);
    return json({ success: true, request_token: requestToken, authUrl });
  }
  if (pathname === '/api/tmdb/auth-complete' && method === 'POST') {
    const { accessToken, accountId } = await completeTmdbWriteAuth(body.readToken, body.requestToken);
    const items = (body.watchlistSeries ?? []) as TmdbListSyncItem[];
    const sync = await syncItemsToTmdbLists(body.listId, body.movieListId, accessToken, items);
    const mirror = await mirrorTmdbAccountWatchlist(
      body.syncAccountWatchlist,
      body.readToken,
      accessToken,
      items,
      true
    );
    return json({ success: true, userAccessToken: accessToken, accountId, ...sync, ...mirror });
  }
  if (pathname === '/api/tmdb/sync-to-list' && method === 'POST') {
    const items = (body.watchlistSeries ?? []) as TmdbListSyncItem[];
    return json({
      success: true,
      listId: cleanTmdbListId(body.listId),
      ...(await syncItemsToTmdbLists(body.listId, body.movieListId, body.apiKey, items)),
      ...(await mirrorTmdbAccountWatchlist(body.syncAccountWatchlist, body.readToken, body.apiKey, items, true)),
    });
  }
  if (pathname === '/api/tmdb/remove-from-list' && method === 'POST') {
    const items = (body.items ?? body.watchlistSeries ?? []) as TmdbListSyncItem[];
    return json({
      success: true,
      ...(await removeItemsFromTmdbLists(body.listId, body.movieListId, body.apiKey, items)),
      ...(await mirrorTmdbAccountWatchlist(body.syncAccountWatchlist, body.readToken, body.apiKey, items, false)),
    });
  }
  if (pathname === '/api/tmdb/create-list' && method === 'POST') {
    const listId = await createTmdbList(body.writeToken, body.name, body.description);
    return json({ success: true, listId });
  }

  if (pathname === '/api/series/ai-season-intel') return unavailable('AI season intelligence');
  if (pathname === '/api/bingecat/export.json') return unavailable('The Bingecat/Stremio addon');

  return json({ error: `No static handler for ${pathname}` }, 501);
}

/**
 * Drop-in replacement for `fetch` against the app's own API. Server builds pass straight
 * through; static builds answer from baked JSON, localStorage, and direct TMDB/TVMaze calls.
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  if (!IS_STATIC_BUILD) return fetch(path, init);
  const url = new URL(path, window.location.origin);
  try {
    return await handleStatically(url, init);
  } catch (err) {
    const status = err instanceof TmdbError ? err.status : 500;
    return json({ error: err instanceof Error ? err.message : 'Request failed' }, status);
  }
}
