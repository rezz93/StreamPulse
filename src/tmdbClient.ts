import { Series } from './types';

const TOKEN_STORAGE_KEY = 'streampulse_tmdb_token';

export function getStoredTmdbToken(): string {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function storeTmdbToken(token: string) {
  try {
    if (token.trim()) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token.trim());
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures (private mode / disabled storage)
  }
}

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
  const res = await fetch('/api/tmdb/status');
  return readJson(res);
}

export async function searchTmdbTitles(query: string, type: 'multi' | 'tv' | 'movie'): Promise<Series[]> {
  const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}&type=${type}`, {
    headers: tmdbHeaders(),
  });
  const data = await readJson(res);
  return data.results || [];
}

export async function fetchTmdbTrending(type: 'all' | 'tv' | 'movie'): Promise<Series[]> {
  const res = await fetch(`/api/tmdb/trending?type=${type}`, { headers: tmdbHeaders() });
  const data = await readJson(res);
  return data.results || [];
}

export async function importTmdbTitle(
  mediaType: 'tv' | 'movie',
  tmdbId: number
): Promise<{ series: Series; alreadyInCatalog: boolean }> {
  const res = await fetch('/api/catalog/tmdb', {
    method: 'POST',
    headers: tmdbHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ mediaType, tmdbId }),
  });
  return readJson(res);
}

export async function removeTmdbTitle(id: string): Promise<void> {
  const res = await fetch(`/api/catalog/tmdb/${encodeURIComponent(id)}`, { method: 'DELETE' });
  await readJson(res);
}
