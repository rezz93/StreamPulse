export const TMDB_LIST_ID_KEY = 'streampulse_tmdb_list_id';
export const TMDB_MOVIE_LIST_ID_KEY = 'streampulse_tmdb_movie_list_id';
export const TMDB_WRITE_TOKEN_KEY = 'streampulse_tmdb_write_token';
export const TMDB_ACCOUNT_WATCHLIST_KEY = 'streampulse_tmdb_account_watchlist';
/** Kept as the example/placeholder list id; sync no longer falls back to it. */
export const EXAMPLE_TMDB_LIST_ID = '8687293';

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

const LIST_DEFAULT_MIGRATION_KEY = 'streampulse_tmdb_list_default_migrated';

/**
 * Earlier builds pre-filled list #8687293, which Stremio's TMDB catalogs cannot read, so clear
 * that stored value once and let the account watchlist be the destination instead.
 */
export function migrateDefaultTmdbListId(): void {
  if (localStorage.getItem(LIST_DEFAULT_MIGRATION_KEY) === 'done') return;
  if (localStorage.getItem(TMDB_LIST_ID_KEY) === EXAMPLE_TMDB_LIST_ID) {
    localStorage.removeItem(TMDB_LIST_ID_KEY);
  }
  localStorage.setItem(LIST_DEFAULT_MIGRATION_KEY, 'done');
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
