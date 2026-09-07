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

const unavailable = (feature: string) =>
  json({ error: `${feature} needs the StreamPulse server and is unavailable in the static build.` }, 501);

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
  if (pathname === '/api/watchlist/sync') return json({ success: true, static: true });

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
              s.genres.some((g) => g.toLowerCase().includes(qLower))
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

  if (pathname === '/api/series/ai-season-intel') return unavailable('AI season intelligence');
  if (pathname === '/api/bingecat/export.json') return unavailable('The Bingecat/Stremio addon');

  return json({ error: `No static handler for ${pathname}` }, 501);
}

/**
 * Drop-in replacement for `fetch` against the app's own API. Server builds pass straight
 * through; static builds answer from baked JSON and TVMaze calls.
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  if (!IS_STATIC_BUILD) return fetch(path, init);
  const url = new URL(path, window.location.origin);
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
