export const TMDB_LIST_ID_KEY = 'streampulse_tmdb_list_id';
export const TMDB_MOVIE_LIST_ID_KEY = 'streampulse_tmdb_movie_list_id';
export const TMDB_WRITE_TOKEN_KEY = 'streampulse_tmdb_write_token';
export const TMDB_PENDING_REQUEST_KEY = 'streampulse_tmdb_pending_request';
const PENDING_REQUEST_TTL_MS = 60 * 60 * 1000;
export const DEFAULT_TMDB_LIST_ID = '8687068';

export function getTmdbListId(): string {
  return localStorage.getItem(TMDB_LIST_ID_KEY) || DEFAULT_TMDB_LIST_ID;
}

export function getTmdbMovieListId(): string {
  return localStorage.getItem(TMDB_MOVIE_LIST_ID_KEY) || '';
}

export function saveTmdbListSettings(listId: string, movieListId: string): void {
  localStorage.setItem(TMDB_LIST_ID_KEY, listId);
  localStorage.setItem(TMDB_MOVIE_LIST_ID_KEY, movieListId);
}

export function getTmdbWriteToken(): string {
  return localStorage.getItem(TMDB_WRITE_TOKEN_KEY) || '';
}

/**
 * TMDB approval happens in a second tab, which can evict this page (mobile / PWA),
 * so the request token awaiting exchange outlives React state.
 */
export function getPendingTmdbRequestToken(): string {
  const raw = localStorage.getItem(TMDB_PENDING_REQUEST_KEY);
  if (!raw) return '';
  try {
    const { requestToken, savedAt } = JSON.parse(raw) as { requestToken?: string; savedAt?: number };
    if (!requestToken || !savedAt || Date.now() - savedAt > PENDING_REQUEST_TTL_MS) {
      localStorage.removeItem(TMDB_PENDING_REQUEST_KEY);
      return '';
    }
    return requestToken;
  } catch {
    localStorage.removeItem(TMDB_PENDING_REQUEST_KEY);
    return '';
  }
}

export function savePendingTmdbRequestToken(requestToken: string): void {
  localStorage.setItem(TMDB_PENDING_REQUEST_KEY, JSON.stringify({ requestToken, savedAt: Date.now() }));
}

export function clearPendingTmdbRequestToken(): void {
  localStorage.removeItem(TMDB_PENDING_REQUEST_KEY);
}

export function saveTmdbWriteToken(token: string): void {
  localStorage.setItem(TMDB_WRITE_TOKEN_KEY, token);
}

export function clearTmdbWriteToken(): void {
  localStorage.removeItem(TMDB_WRITE_TOKEN_KEY);
}
