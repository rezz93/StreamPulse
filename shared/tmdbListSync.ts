import { TmdbError } from './tmdbService';

/**
 * TMDB v4 list writes. TMDB serves its API with permissive CORS headers, so these run
 * unchanged in the browser (static GitHub Pages build) and on the Express server.
 *
 * Writing to a list needs a *user* access token, which only the v4 approval flow issues:
 * an app-level Read Access Token carries the `api_read` scope only.
 */
const TMDB_V4 = 'https://api.themoviedb.org/4';

const NO_LISTS_MESSAGE = 'No custom TMDB list configured, so only your TMDB account watchlist was updated.';

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

export interface TmdbListSyncSingleResult {
  syncedCount: number;
  requestedCount: number;
  message: string;
}

export interface TmdbListSyncDetail {
  listId: string;
  mediaKind: 'tv' | 'movie';
  syncedCount: number;
  requestedCount: number;
}

export interface TmdbListSyncResult extends TmdbListSyncSingleResult {
  lists: TmdbListSyncDetail[];
}

export interface TmdbListRemovalDetail {
  listId: string;
  mediaKind: 'tv' | 'movie';
  removedCount: number;
  requestedCount: number;
}

export interface TmdbListRemovalResult {
  removedCount: number;
  requestedCount: number;
  message: string;
  lists: TmdbListRemovalDetail[];
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
    .filter((item) => Number.isFinite(Number(item.tmdbId)) && Number(item.tmdbId) > 0)
    .map((item) => ({ media_type: item.mediaType === 'movie' ? 'movie' : 'tv', media_id: Number(item.tmdbId) }));
}

/** Adds every item with a known TMDB id to the given list, using a user write token. */
export async function syncItemsToTmdbList(
  listId: unknown,
  writeToken: string,
  items: TmdbListSyncItem[]
): Promise<TmdbListSyncSingleResult> {
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

/**
 * Splits the watchlist across the configured lists. Both list ids are optional: with neither
 * set, the account watchlist mirror is the only destination and no list write is attempted.
 */
export async function syncItemsToTmdbLists(
  tvListId: unknown,
  movieListId: unknown,
  writeToken: string,
  items: TmdbListSyncItem[]
): Promise<TmdbListSyncResult> {
  const tvList = cleanTmdbListId(tvListId);
  const movieList = cleanTmdbListId(movieListId);
  if (!tvList && !movieList) {
    return { syncedCount: 0, requestedCount: 0, message: NO_LISTS_MESSAGE, lists: [] };
  }

  const tvItems = movieList ? items.filter((item) => item.mediaType !== 'movie') : items;
  const movieItems = movieList ? items.filter((item) => item.mediaType === 'movie') : [];
  const tvPayload = toTmdbListItems(tvItems);
  const moviePayload = toTmdbListItems(movieItems);

  if (tvPayload.length === 0 && moviePayload.length === 0) {
    throw new TmdbError('None of your watchlisted titles have a TMDB id yet.', 400);
  }

  const token = assertBearerToken(writeToken);
  const details: TmdbListSyncDetail[] = [];
  if (tvList && tvPayload.length > 0) {
    const result = await syncItemsToTmdbList(tvList, token, tvItems);
    details.push({
      listId: tvList,
      mediaKind: 'tv',
      syncedCount: result.syncedCount,
      requestedCount: result.requestedCount,
    });
  }
  if (movieList && moviePayload.length > 0) {
    const result = await syncItemsToTmdbList(movieList, token, movieItems);
    details.push({
      listId: movieList,
      mediaKind: 'movie',
      syncedCount: result.syncedCount,
      requestedCount: result.requestedCount,
    });
  }

  const syncedCount = details.reduce((total, list) => total + list.syncedCount, 0);
  const requestedCount = details.reduce((total, list) => total + list.requestedCount, 0);
  return {
    syncedCount,
    requestedCount,
    message: details
      .map(
        (list) =>
          `${list.mediaKind === 'movie' ? 'Movies' : 'Shows'}: ${list.syncedCount} of ${list.requestedCount} went to TMDB list #${list.listId}.`
      )
      .join(' '),
    lists: details,
  };
}

async function removeItemsFromTmdbList(
  listId: unknown,
  writeToken: string,
  items: TmdbListSyncItem[]
): Promise<{ removedCount: number; requestedCount: number }> {
  const cleanListId = cleanTmdbListId(listId);
  if (!cleanListId) {
    throw new TmdbError('Enter your numeric TMDB list ID or its themoviedb.org URL.', 400);
  }

  const payload = toTmdbListItems(items);
  if (payload.length === 0) {
    return { removedCount: 0, requestedCount: 0 };
  }

  const token = assertBearerToken(writeToken);
  const data = await tmdbV4<{ results?: Array<{ success?: boolean }> }>(
    `/list/${cleanListId}/items`,
    token,
    { items: payload },
    'DELETE'
  );
  const results = data.results ?? [];
  const removedCount = results.length ? results.filter((result) => result.success !== false).length : payload.length;
  return { removedCount, requestedCount: payload.length };
}

/** Removes known movies and shows from their configured lists, if any are configured. */
export async function removeItemsFromTmdbLists(
  tvListId: unknown,
  movieListId: unknown,
  writeToken: string,
  items: TmdbListSyncItem[]
): Promise<TmdbListRemovalResult> {
  const tvList = cleanTmdbListId(tvListId);
  const movieList = cleanTmdbListId(movieListId);
  if (!tvList && !movieList) {
    return { removedCount: 0, requestedCount: 0, message: NO_LISTS_MESSAGE, lists: [] };
  }

  const tvItems = movieList ? items.filter((item) => item.mediaType !== 'movie') : items;
  const movieItems = movieList ? items.filter((item) => item.mediaType === 'movie') : [];
  const tvPayload = toTmdbListItems(tvItems);
  const moviePayload = toTmdbListItems(movieItems);
  const details: TmdbListRemovalDetail[] = [];

  if (tvList && tvPayload.length > 0) {
    const result = await removeItemsFromTmdbList(tvList, writeToken, tvItems);
    details.push({
      listId: tvList,
      mediaKind: 'tv',
      ...result,
    });
  }
  if (movieList && moviePayload.length > 0) {
    const result = await removeItemsFromTmdbList(movieList, writeToken, movieItems);
    details.push({
      listId: movieList,
      mediaKind: 'movie',
      ...result,
    });
  }

  const removedCount = details.reduce((total, list) => total + list.removedCount, 0);
  const requestedCount = details.reduce((total, list) => total + list.requestedCount, 0);
  return {
    removedCount,
    requestedCount,
    message: details.length
      ? details
          .map(
            (list) =>
              `${list.mediaKind === 'movie' ? 'Movies' : 'Shows'}: removed ${list.removedCount} of ${list.requestedCount} from TMDB list #${list.listId}.`
          )
          .join(' ')
      : 'No TMDB titles to remove.',
    lists: details,
  };
}

/** Creates a v4 list for the authenticated TMDB user. */
export async function createTmdbList(writeToken: string, name: string, description?: string): Promise<number> {
  const token = assertBearerToken(writeToken);
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new TmdbError('Enter a name for the TMDB list.', 400);
  }

  const data = await tmdbV4<{ id?: number }>('/list', token, {
    name: trimmedName,
    description: description?.trim() ?? '',
    iso_3166_1: 'US',
    iso_639_1: 'en',
    public: true,
  });
  if (!Number.isFinite(data.id)) {
    throw new TmdbError('TMDB did not return the new list ID.', 502);
  }
  return Number(data.id);
}
