import { TmdbError } from './tmdbService';

/**
 * TMDB v4 list writes. TMDB serves its API with permissive CORS headers, so these run
 * unchanged in the browser (static GitHub Pages build) and on the Express server.
 *
 * Writing to a list needs a *user* access token, which only the v4 approval flow issues:
 * an app-level Read Access Token carries the `api_read` scope only.
 */
const TMDB_V4 = 'https://api.themoviedb.org/4';

export interface TmdbWriteAuthStart {
  requestToken: string;
  authUrl: string;
}

export interface TmdbWriteAuth {
  accessToken: string;
  accountId: string;
}

export interface TmdbListSyncItem {
  id?: string;
  title?: string;
  tmdbId?: number;
  mediaType?: 'tv' | 'movie';
}

export interface TmdbListSyncResult {
  syncedCount: number;
  requestedCount: number;
  message: string;
}

/** Accepts a bare id, a slug (`8687293-watchlist`) or a full themoviedb.org list URL. */
export function cleanTmdbListId(raw: unknown): string {
  const value = String(raw ?? '');
  const fromUrl = value.match(/list\/(\d+)/);
  return (fromUrl ? fromUrl[1] : value).replace(/[^0-9]/g, '');
}

async function tmdbV4<T>(path: string, token: string, body?: unknown, method = 'POST'): Promise<T> {
  const response = await fetch(`${TMDB_V4}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      'Content-Type': 'application/json;charset=utf-8',
      Accept: 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as any;
  if (!response.ok || data.success === false) {
    throw new TmdbError(
      data.status_message || `TMDB request failed with status ${response.status}`,
      response.status === 401 || response.status === 403 ? 401 : 502
    );
  }
  return data as T;
}

function assertBearerToken(token: string) {
  const clean = token.trim();
  if (!clean) {
    throw new TmdbError('Paste your TMDB API Read Access Token (themoviedb.org/settings/api).', 401);
  }
  if (clean.length <= 40) {
    throw new TmdbError(
      'That looks like a v3 API key. TMDB list writes need the longer "API Read Access Token" from themoviedb.org/settings/api.',
      401
    );
  }
  return clean;
}

/** Step 1: create a request token the user approves on themoviedb.org. */
export async function startTmdbWriteAuth(readToken: string, redirectTo?: string): Promise<TmdbWriteAuthStart> {
  const token = assertBearerToken(readToken);
  const data = await tmdbV4<{ request_token?: string }>('/auth/request_token', token, {
    redirect_to: redirectTo || 'https://www.themoviedb.org',
  });
  if (!data.request_token) {
    throw new TmdbError('TMDB did not return a request token.', 502);
  }
  return {
    requestToken: data.request_token,
    authUrl: `https://www.themoviedb.org/auth/access?request_token=${data.request_token}`,
  };
}

/** Step 2: exchange an approved request token for a write-capable user access token. */
export async function completeTmdbWriteAuth(readToken: string, requestToken: string): Promise<TmdbWriteAuth> {
  const token = assertBearerToken(readToken);
  if (!requestToken) {
    throw new TmdbError('Missing TMDB request token. Start the authorization again.', 400);
  }

  let data: { access_token?: string; account_id?: string };
  try {
    data = await tmdbV4<{ access_token?: string; account_id?: string }>('/auth/access_token', token, {
      request_token: requestToken,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'TMDB rejected the request token.';
    throw new TmdbError(
      `${message} Make sure you clicked "Approve" on the TMDB page, then try again.`,
      err instanceof TmdbError ? err.status : 502
    );
  }

  if (!data.access_token) {
    throw new TmdbError('TMDB approval is still pending. Approve the request on TMDB, then try again.', 401);
  }
  return { accessToken: data.access_token, accountId: String(data.account_id ?? '') };
}

export function toTmdbListItems(items: TmdbListSyncItem[]): Array<{ media_type: 'tv' | 'movie'; media_id: number }> {
  return items
    .filter((item) => Number.isFinite(Number(item.tmdbId)))
    .map((item) => ({ media_type: item.mediaType === 'movie' ? 'movie' : 'tv', media_id: Number(item.tmdbId) }));
}

/** Adds every item with a known TMDB id to the given list, using a user write token. */
export async function syncItemsToTmdbList(
  listId: unknown,
  writeToken: string,
  items: TmdbListSyncItem[]
): Promise<TmdbListSyncResult> {
  const cleanListId = cleanTmdbListId(listId);
  if (!cleanListId) {
    throw new TmdbError('Enter your numeric TMDB list ID or its themoviedb.org URL.', 400);
  }

  const token = assertBearerToken(writeToken);
  const payload = toTmdbListItems(items);
  if (payload.length === 0) {
    throw new TmdbError('None of your watchlisted titles have a TMDB id yet.', 400);
  }

  const data = await tmdbV4<{ results?: Array<{ success?: boolean }> }>(`/list/${cleanListId}/items`, token, {
    items: payload,
  });

  const results = data.results ?? [];
  const added = results.length ? results.filter((r) => r.success !== false).length : payload.length;
  return {
    syncedCount: added,
    requestedCount: payload.length,
    message:
      added === payload.length
        ? `Synced ${added} title${added === 1 ? '' : 's'} to TMDB list #${cleanListId}.`
        : `Added ${added} of ${payload.length} titles to TMDB list #${cleanListId} (the rest were already on it).`,
  };
}
