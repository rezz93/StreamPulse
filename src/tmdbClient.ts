import { apiFetch } from './apiClient';
import { getStoredTmdbToken, storeTmdbToken } from './tmdbToken';
import { Series } from './types';

export { getStoredTmdbToken, storeTmdbToken };

function tmdbHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getStoredTmdbToken();
  return token ? { ...extra, 'x-tmdb-token': token } : extra;
}

export interface TmdbRequestError extends Error {
  needsToken?: boolean;
}

async function readJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error: TmdbRequestError = new Error(data.error || `Request failed with status ${res.status}`);
    error.needsToken = Boolean(data.needsToken) || res.status === 401;
    throw error;
  }
  return data;
}

export async function fetchTmdbStatus(): Promise<{ configured: boolean; importedCount: number }> {
  const res = await apiFetch('/api/tmdb/status');
  return readJson(res);
}

export async function searchTmdbTitles(query: string, type: 'multi' | 'tv' | 'movie'): Promise<Series[]> {
  const res = await apiFetch(`/api/tmdb/search?q=${encodeURIComponent(query)}&type=${type}`, {
    headers: tmdbHeaders(),
  });
  const data = await readJson(res);
  return data.results || [];
}

export async function fetchTmdbTrending(type: 'all' | 'tv' | 'movie'): Promise<Series[]> {
  const res = await apiFetch(`/api/tmdb/trending?type=${type}`, { headers: tmdbHeaders() });
  const data = await readJson(res);
  return data.results || [];
}

export async function fetchTmdbDiscover(
  type: 'tv' | 'movie',
  page = 1
): Promise<{ results: Series[]; page: number; totalPages: number }> {
  const res = await apiFetch(`/api/tmdb/discover?type=${type}&page=${page}`, { headers: tmdbHeaders() });
  const data = await readJson(res);
  return { results: data.results || [], page: data.page || page, totalPages: data.totalPages || page };
}

/** Movies + shows when a TMDB credential is available, TVMaze shows only otherwise. */
export async function liveSearchTitles(
  query: string,
  type: 'multi' | 'tv' | 'movie' = 'multi'
): Promise<{ results: Series[]; source: string }> {
  const res = await apiFetch(`/api/series/live-search?q=${encodeURIComponent(query)}&type=${type}`, {
    headers: tmdbHeaders(),
  });
  const data = await readJson(res);
  return { results: data.results || [], source: data.source || 'unknown' };
}

export async function importTmdbTitle(
  mediaType: 'tv' | 'movie',
  tmdbId: number
): Promise<{ series: Series; alreadyInCatalog: boolean }> {
  const res = await apiFetch('/api/catalog/tmdb', {
    method: 'POST',
    headers: tmdbHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ mediaType, tmdbId }),
  });
  return readJson(res);
}

export async function removeTmdbTitle(id: string): Promise<void> {
  const res = await apiFetch(`/api/catalog/tmdb/${encodeURIComponent(id)}`, { method: 'DELETE' });
  await readJson(res);
}
