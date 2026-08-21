export const TMDB_LIST_ID_KEY = 'streampulse_tmdb_list_id';
export const TMDB_MOVIE_LIST_ID_KEY = 'streampulse_tmdb_movie_list_id';
export const TMDB_WRITE_TOKEN_KEY = 'streampulse_tmdb_write_token';
export const TMDB_ACCOUNT_WATCHLIST_KEY = 'streampulse_tmdb_account_watchlist';
export const DEFAULT_TMDB_LIST_ID = '8687068';

/** Mirroring into TMDB's built-in "My Watchlist" is what Stremio's TMDB addon reads. */
export function getTmdbAccountWatchlistEnabled(): boolean {
  return localStorage.getItem(TMDB_ACCOUNT_WATCHLIST_KEY) === 'true';
}

export function saveTmdbAccountWatchlistEnabled(enabled: boolean): void {
  localStorage.setItem(TMDB_ACCOUNT_WATCHLIST_KEY, String(enabled));
}

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

export function saveTmdbWriteToken(token: string): void {
  localStorage.setItem(TMDB_WRITE_TOKEN_KEY, token);
}

export function clearTmdbWriteToken(): void {
  localStorage.removeItem(TMDB_WRITE_TOKEN_KEY);
}
