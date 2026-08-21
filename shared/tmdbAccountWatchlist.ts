import { TmdbError } from './tmdbService';
import { TmdbListSyncItem, toTmdbListItems } from './tmdbListSync';

/**
 * TMDB's built-in account watchlist ("My Watchlist") is separate from user lists and is
 * only writable through v3, which needs a session id and the numeric account id. The v4
 * user access token from the approval flow converts into both, so the same one-click
 * authorization covers list writes and watchlist writes.
 *
 * Stremio's TMDB addon reads this account watchlist, so mirroring into it makes the
 * StreamPulse watchlist visible there.
 */
const TMDB_V3 = 'https://api.themoviedb.org/3';

export interface TmdbAccountWatchlistResult {
  changedCount: number;
  requestedCount: number;
  message: string;
}

interface AccountSession {
  sessionId: string;
  accountId: number;
}

const sessionCache = new Map<string, AccountSession>();

async function tmdbV3<T>(
  path: string,
  readToken: string,
  options: { method?: string; query?: Record<string, string>; body?: unknown } = {}
): Promise<T> {
  const url = new URL(`${TMDB_V3}${path}`);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    method: options.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${readToken.trim()}`,
      'Content-Type': 'application/json;charset=utf-8',
      Accept: 'application/json',
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
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

/** Trades the approved v4 user access token for a v3 session and the numeric account id. */
async function resolveAccountSession(readToken: string, writeToken: string): Promise<AccountSession> {
  const cached = sessionCache.get(writeToken);
  if (cached) return cached;

  const session = await tmdbV3<{ session_id?: string }>('/authentication/session/convert/4', readToken, {
    method: 'POST',
    body: { access_token: writeToken.trim() },
  });
  if (!session.session_id) {
    throw new TmdbError('TMDB did not return a session for your approved token.', 502);
  }

  const account = await tmdbV3<{ id?: number }>('/account', readToken, {
    query: { session_id: session.session_id },
  });
  if (!Number.isFinite(account.id)) {
    throw new TmdbError('TMDB did not return your account id.', 502);
  }

  const resolved = { sessionId: session.session_id, accountId: Number(account.id) };
  sessionCache.set(writeToken, resolved);
  return resolved;
}

/** Adds or removes items on the account watchlist; TMDB only accepts one title per call. */
export async function updateTmdbAccountWatchlist(
  readToken: string,
  writeToken: string,
  items: TmdbListSyncItem[],
  watchlist: boolean
): Promise<TmdbAccountWatchlistResult> {
  const readAccess = readToken.trim();
  if (!readAccess) {
    throw new TmdbError('Paste your TMDB API Read Access Token to mirror the account watchlist.', 401);
  }
  if (!writeToken.trim()) {
    throw new TmdbError('Authorize StreamPulse on TMDB before mirroring the account watchlist.', 401);
  }

  const payload = toTmdbListItems(items);
  if (payload.length === 0) {
    return { changedCount: 0, requestedCount: 0, message: 'No TMDB ids to mirror to your account watchlist.' };
  }

  const { sessionId, accountId } = await resolveAccountSession(readAccess, writeToken);
  let changedCount = 0;
  for (const item of payload) {
    await tmdbV3(`/account/${accountId}/watchlist`, readAccess, {
      method: 'POST',
      query: { session_id: sessionId },
      body: { media_type: item.media_type, media_id: item.media_id, watchlist },
    });
    changedCount += 1;
  }

  const verb = watchlist ? 'Added' : 'Removed';
  const preposition = watchlist ? 'to' : 'from';
  return {
    changedCount,
    requestedCount: payload.length,
    message: `${verb} ${changedCount} title${changedCount === 1 ? '' : 's'} ${preposition} your TMDB account watchlist.`,
  };
}

export interface TmdbAccountWatchlistMirror {
  accountWatchlist?: TmdbAccountWatchlistResult;
  accountWatchlistError?: string;
}

/**
 * Optional mirror step for the list sync/removal routes: a watchlist failure reports back
 * to the caller without failing the list write that already succeeded.
 */
export async function mirrorTmdbAccountWatchlist(
  enabled: unknown,
  readToken: unknown,
  writeToken: unknown,
  items: TmdbListSyncItem[],
  watchlist: boolean
): Promise<TmdbAccountWatchlistMirror> {
  if (enabled !== true) return {};
  try {
    const result = await updateTmdbAccountWatchlist(String(readToken ?? ''), String(writeToken ?? ''), items, watchlist);
    return { accountWatchlist: result };
  } catch (err) {
    return {
      accountWatchlistError:
        err instanceof Error ? err.message : 'Could not update your TMDB account watchlist.',
    };
  }
}
