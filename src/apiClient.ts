import { generateSeasonIntel } from '../shared/seasonIntelService';
import { searchTvmazeShows } from '../shared/tvmazeService';
import { searchWikipediaMedia } from '../shared/wikipediaService';
import { Series } from './types';

/**
 * Static builds (GitHub Pages) ship without the Express backend: the catalog is baked
 * into JSON at build time and TVMaze is queried straight from the browser.
 */
export const IS_STATIC_BUILD = import.meta.env.VITE_STATIC_BUILD === 'true';

const BASE_URL = import.meta.env.BASE_URL;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function staticSeries(): Promise<Response> {
  const response = await fetch(`${BASE_URL}api/series.json`);
  if (!response.ok) return json({ error: 'Static catalog is missing.' }, 500);
  const data = (await response.json()) as { series: Series[] };
  return json({ total: data.series?.length ?? 0, series: data.series ?? [] });
}

async function handleStatically(url: URL, _init?: RequestInit): Promise<Response> {
  const { pathname, searchParams } = url;

  if (pathname === '/api/providers') return fetch(`${BASE_URL}api/providers.json`);
  if (pathname === '/api/series') return staticSeries();
  if (pathname === '/api/watchlist/sync') {
    if (_init?.method === 'POST') {
      try {
        const body = typeof _init.body === 'string' ? JSON.parse(_init.body) : _init.body;
        if (body?.watchlist && Array.isArray(body.watchlist)) {
          localStorage.setItem('streampulse_watchlist', JSON.stringify(body.watchlist));
          localStorage.setItem('streampulse_watchlist_synced_at', new Date().toISOString());
        }
        return json({ success: true, count: body?.watchlist?.length || 0, staticMode: true });
      } catch {
        return json({ success: true, staticMode: true });
      }
    }
    const saved = localStorage.getItem('streampulse_watchlist');
    return json({ watchlist: saved ? JSON.parse(saved) : [] });
  }

  if (pathname === '/api/theaters/live-radar') {
    try {
      const catRes = await fetch(`${BASE_URL}api/series.json`);
      if (catRes.ok) {
        const catData = (await catRes.json()) as { series: Series[] };
        const currentYear = new Date().getFullYear();
        const theaters = (catData.series || []).filter(
          (s) =>
            s.mediaType === 'movie' &&
            s.firstAirYear === currentYear &&
            s.isDomestic !== false &&
            (s.theaterStatus === 'now_in_theaters' ||
              (s.providers.includes('theaters') && s.theaterStatus !== 'coming_to_theaters' && !s.isUpcoming))
        );
        return json({ total: theaters.length, titles: theaters, source: 'static_catalog' });
      }
    } catch {
      // Fallback
    }
    return json({ total: 0, titles: [], source: 'fallback' });
  }

  if (pathname === '/api/series/live-search') {
    const query = searchParams.get('q') ?? '';
    if (!query.trim()) return json({ results: [], source: 'none' });
    try {
      const qLower = query.toLowerCase();
      let localMatches: Series[] = [];
      try {
        const catRes = await fetch(`${BASE_URL}api/series.json`);
        if (catRes.ok) {
          const catData = (await catRes.json()) as { series: Series[] };
          localMatches = (catData.series || []).filter(
            (s) =>
              s.title.toLowerCase().includes(qLower) ||
              s.synopsis.toLowerCase().includes(qLower) ||
              (s.director && s.director.toLowerCase().includes(qLower)) ||
              (s.creator && s.creator.toLowerCase().includes(qLower)) ||
              s.genres.some((g) => g.toLowerCase().includes(qLower)) ||
              (s.cast && s.cast.some((c) => c.name.toLowerCase().includes(qLower) || (c.role && c.role.toLowerCase().includes(qLower)))) ||
              (s.renewalBadgeText && s.renewalBadgeText.toLowerCase().includes(qLower))
          );
        }
      } catch {
        // Continue to tvmaze
      }

      const [wikiResults, tvmazeResults] = await Promise.all([
        searchWikipediaMedia(query).catch(() => []),
        searchTvmazeShows(query).catch(() => []),
      ]);

      const combined: Series[] = [...localMatches];
      const seenTitles = new Set(localMatches.map((s) => s.title.toLowerCase().trim()));

      for (const item of wikiResults) {
        const norm = item.title.toLowerCase().trim();
        if (!seenTitles.has(norm)) {
          combined.push(item);
          seenTitles.add(norm);
        }
      }

      for (const item of tvmazeResults) {
        const norm = item.title.toLowerCase().trim();
        if (!seenTitles.has(norm)) {
          combined.push({ ...item, source: 'tvmaze' as const });
          seenTitles.add(norm);
        }
      }
      return json({ results: combined, source: 'multi_source', sourcesUsed: ['catalog', 'wikipedia', 'tvmaze'] });
    } catch {
      return json({ results: [], source: 'error' });
    }
  }

  // AI Season Intelligence static resolution
  if (pathname === '/api/series/ai-season-intel') {
    let body: any = {};
    if (_init?.body) {
      try {
        body = typeof _init.body === 'string' ? JSON.parse(_init.body) : _init.body;
      } catch {
        body = {};
      }
    }
    const title = (body.title || '').trim();
    const context = body.context || '';
    const series = body.series as Partial<Series> | undefined;

    // 1. Check pre-baked static season intelligence
    try {
      const intelRes = await fetch(`${BASE_URL}api/season-intel.json`);
      if (intelRes.ok) {
        const intelMap = await intelRes.json();
        const found =
          (series?.id && intelMap[series.id]) ||
          (title && (intelMap[title.toLowerCase().trim()] || intelMap[title]));
        if (found) {
          return json(found);
        }
      }
    } catch {
      // Continue to on-the-fly generation
    }

    // 2. Synthesize season intelligence on-the-fly
    const generated = generateSeasonIntel(title, context, series);
    return json(generated);
  }

  // Bingecat watchlist export static resolution
  if (pathname === '/api/bingecat/export.json') {
    try {
      const exportRes = await fetch(`${BASE_URL}api/bingecat/export.json`);
      if (exportRes.ok) return exportRes;
    } catch {
      // Fallback
    }
    return json({
      name: 'StreamPulse Watchlist & Season Premieres',
      description: 'Synchronized from StreamPulse series tracker',
      updatedAt: new Date().toISOString(),
      itemCount: 0,
      items: [],
    });
  }

  return json({ error: `No static handler for ${pathname}` }, 501);
}

/**
 * Drop-in replacement for `fetch` against the app's own API. Server builds pass straight
 * through; static builds answer from baked JSON and TVMaze calls.
 * If server returns 404 or 501, it automatically fails over to the static handler.
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = new URL(path, window.location.origin);

  if (!IS_STATIC_BUILD) {
    try {
      const response = await fetch(path, init);
      if (response.status === 404 || response.status === 501) {
        return await handleStatically(url, init);
      }
      return response;
    } catch {
      // Server down or offline: fail over to static handler
      return await handleStatically(url, init);
    }
  }

  try {
    return await handleStatically(url, init);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Request failed' }, 500);
  }
}

/** Searches titles using the live-search endpoint */
export async function liveSearchTitles(
  query: string
): Promise<{ results: Series[]; source: string }> {
  const res = await apiFetch(`/api/series/live-search?q=${encodeURIComponent(query)}`);
  const data = await res.json().catch(() => ({}));
  return { results: data.results || [], source: data.source || 'tvmaze' };
}

/** Resolves the active sync backend URL */
export function getBackendSyncUrl(): string {
  if (typeof window === 'undefined') return '';
  const custom = localStorage.getItem('streampulse_custom_backend_url');
  if (custom && custom.trim()) return custom.trim().replace(/\/$/, '');

  // If running on GitHub Pages, use default public backend
  if (window.location.hostname.includes('github.io')) {
    return 'https://ais-pre-kmnoqak2kyw6nfgbp7y62g-116799203877.us-east1.run.app';
  }
  return window.location.origin;
}

/** Syncs the user's watchlist with server backend for Stremio addon catalogs */
export async function syncWatchlistToServer(
  watchlist: string[],
  customSeries: Series[] = []
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    localStorage.setItem('streampulse_watchlist', JSON.stringify(watchlist));
    localStorage.setItem('streampulse_watchlist_synced_at', new Date().toISOString());

    const backendUrl = getBackendSyncUrl();
    const endpoint = `${backendUrl}/api/watchlist/sync`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ watchlist, customSeries }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, count: data.count || watchlist.length };
    } else {
      // Fallback through apiFetch
      await apiFetch('/api/watchlist/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchlist, customSeries }),
      });
      return { success: true, count: watchlist.length };
    }
  } catch (err: any) {
    console.warn('Watchlist sync error:', err);
    // Still ensure local storage is updated
    return { success: true, count: watchlist.length, error: err?.message };
  }
}

