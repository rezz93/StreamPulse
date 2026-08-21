export const TMDB_LIST_ID_KEY = 'streampulse_tmdb_list_id';
export const TMDB_MOVIE_LIST_ID_KEY = 'streampulse_tmdb_movie_list_id';
export const TMDB_WRITE_TOKEN_KEY = 'streampulse_tmdb_write_token';
export const TMDB_ACCOUNT_WATCHLIST_KEY = 'streampulse_tmdb_account_watchlist';
/** List ids earlier builds pre-filled. The list has since been deleted on TMDB. */
const RETIRED_TMDB_LIST_IDS = ['8687293'];

/**
 * Mirroring into TMDB's built-in "My Watchlist" is what Stremio's TMDB addons read, so it is on
 * unless the user explicitly turns it off.
 */
export function getTmdbAccountWatchlistEnabled(): boolean {
  return localStorage.getItem(TMDB_ACCOUNT_WATCHLIST_KEY) !== 'false';
}

export function saveTmdbAccountWatchlistEnabled(enabled: boolean): void {
  localStorage.setItem(TMDB_ACCOUNT_WATCHLIST_KEY, String(enabled));
}

/**
 * Earlier builds pre-filled a custom list that Stremio's TMDB catalogs cannot read and that no
 * longer exists on TMDB, so writes to it would 404. Drop any stored reference to it.
 */
export function migrateDefaultTmdbListId(): void {
  for (const key of [TMDB_LIST_ID_KEY, TMDB_MOVIE_LIST_ID_KEY]) {
    const stored = localStorage.getItem(key);
    if (stored && RETIRED_TMDB_LIST_IDS.some((id) => stored.includes(id))) {
      localStorage.removeItem(key);
    }
  }
}

/** Blank means "account watchlist only": no custom list is written. */
export function getTmdbListId(): string {
  return localStorage.getItem(TMDB_LIST_ID_KEY) ?? '';
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
