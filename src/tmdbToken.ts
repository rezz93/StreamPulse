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
