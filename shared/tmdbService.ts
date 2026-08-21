import { CastMember, SeasonInfo, Series, StreamingProviderId } from '../src/types';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';
const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80';
const FALLBACK_BACKDROP = 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600&auto=format&fit=crop&q=80';

export type TmdbMediaType = 'tv' | 'movie';

export interface TmdbCredentials {
  token: string;
  /** v4 read access tokens go in the Authorization header, v3 keys in the api_key query param. */
  isBearer: boolean;
}

export class TmdbError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

/** Environment keys are only available server-side; in the browser only an explicit token counts. */
function envToken(): string {
  if (typeof process === 'undefined' || !process.env) return '';
  return process.env.TMDB_READ_ACCESS_TOKEN || process.env.TMDB_API_KEY || '';
}

export function resolveTmdbCredentials(clientToken?: string): TmdbCredentials | null {
  const token = (clientToken || envToken()).trim();
  if (!token) return null;
  return { token, isBearer: token.length > 40 || token.startsWith('eyJ') };
}

async function tmdbFetch<T>(
  path: string,
  credentials: TmdbCredentials,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  if (!credentials.isBearer) url.searchParams.set('api_key', credentials.token);

  const response = await fetch(url.toString(), {
    headers: credentials.isBearer
      ? { Authorization: `Bearer ${credentials.token}`, Accept: 'application/json' }
      : { Accept: 'application/json' },
  });

  const data = (await response.json()) as any;
  if (!response.ok) {
    const message = data?.status_message || `TMDB request failed with status ${response.status}`;
    throw new TmdbError(message, response.status === 401 ? 401 : 502);
  }
  return data as T;
}

const PROVIDER_MATCHERS: Array<{ id: StreamingProviderId; test: (name: string) => boolean }> = [
  { id: 'netflix', test: (n) => n.includes('netflix') },
  { id: 'appletv', test: (n) => n.includes('apple') },
  { id: 'max', test: (n) => n.includes('max') || n.includes('hbo') },
  { id: 'prime', test: (n) => n.includes('amazon') || n.includes('prime') },
  { id: 'disney', test: (n) => n.includes('disney') },
  { id: 'hulu', test: (n) => n.includes('hulu') },
  { id: 'paramount', test: (n) => n.includes('paramount') || n.includes('showtime') || n.includes('cbs') },
  { id: 'peacock', test: (n) => n.includes('peacock') || n.includes('nbc') },
];

/** TMDB genre ids are stable; list rows only carry ids, so map them for the app's genre filter. */
const GENRE_NAMES: Record<number, string> = {
  12: 'Adventure',
  14: 'Fantasy',
  16: 'Animation',
  18: 'Drama',
  27: 'Horror',
  28: 'Action',
  35: 'Comedy',
  36: 'History',
  37: 'Western',
  53: 'Thriller',
  80: 'Crime',
  99: 'Documentary',
  878: 'Science Fiction',
  9648: 'Mystery',
  10402: 'Music',
  10749: 'Romance',
  10751: 'Family',
  10752: 'War',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
  10770: 'TV Movie',
};

function genreNames(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return ids.map((id) => GENRE_NAMES[Number(id)]).filter((name): name is string => Boolean(name));
}

function matchProvider(name: string): StreamingProviderId | null {
  const lower = name.toLowerCase();
  return PROVIDER_MATCHERS.find((matcher) => matcher.test(lower))?.id ?? null;
}

function decadeFor(year: number): Series['decade'] {
  if (year < 1980) return '70s';
  if (year < 1990) return '80s';
  if (year < 2000) return '90s';
  if (year < 2010) return '2000s';
  if (year < 2020) return '2010s';
  return '2020s';
}

function imageUrl(path: string | null | undefined, size: string, fallback: string): string {
  return path ? `${IMAGE_BASE}/${size}${path}` : fallback;
}

function yearOf(date?: string | null): number {
  const parsed = date ? parseInt(date.slice(0, 4), 10) : NaN;
  return Number.isFinite(parsed) ? parsed : new Date().getFullYear();
}

function daysUntil(date?: string | null): number | undefined {
  if (!date) return undefined;
  const target = new Date(date).getTime();
  if (Number.isNaN(target)) return undefined;
  return Math.ceil((target - Date.now()) / 86_400_000);
}

export function tmdbSeriesId(mediaType: TmdbMediaType, tmdbId: number): string {
  return `tmdb-${mediaType}-${tmdbId}`;
}

/** Lightweight mapping used for search/trending rows (single TMDB call, no extra detail lookups). */
function mapListResult(raw: any, mediaType: TmdbMediaType): Series {
  const title = (mediaType === 'tv' ? raw.name : raw.title) || raw.original_name || raw.original_title || 'Untitled';
  const releaseDate = mediaType === 'tv' ? raw.first_air_date : raw.release_date;
  const firstAirYear = yearOf(releaseDate);
  const isFuture = (daysUntil(releaseDate) ?? -1) > 0;

  return {
    id: tmdbSeriesId(mediaType, raw.id),
    tmdbId: raw.id,
    mediaType,
    title,
    originalTitle: raw.original_name || raw.original_title,
    tagline: mediaType === 'tv' ? 'TMDB Series' : 'TMDB Movie',
    synopsis: raw.overview || 'No overview available.',
    posterUrl: imageUrl(raw.poster_path, 'w500', FALLBACK_POSTER),
    backdropUrl: imageUrl(raw.backdrop_path, 'w1280', FALLBACK_BACKDROP),
    providers: [],
    primaryProvider: 'all',
    genres: genreNames(raw.genre_ids),
    rating: Number(raw.vote_average) || 0,
    ratingCount: raw.vote_count ? `${raw.vote_count} TMDB votes` : 'TMDB',
    contentRating: mediaType === 'tv' ? 'TV' : 'MOVIE',
    firstAirYear,
    decade: decadeFor(firstAirYear),
    totalSeasons: mediaType === 'tv' ? 1 : 1,
    totalEpisodes: mediaType === 'tv' ? 0 : 1,
    status: isFuture ? 'Upcoming Series' : mediaType === 'tv' ? 'Returning Series' : 'Ended',
    isNowPlaying: !isFuture,
    isUpcoming: isFuture,
    isClassic: firstAirYear < 2018,
    hasNewSeasonAlert: false,
    renewalState: isFuture ? 'season_upcoming' : 'airing_now',
    renewalBadgeText: isFuture ? 'Upcoming Release' : 'Available Now',
    nextSeasonReleaseDate: isFuture ? releaseDate || undefined : undefined,
    nextSeasonDaysLeft: isFuture ? daysUntil(releaseDate) : undefined,
    seasons: [],
    cast: [],
  };
}

function mapCast(credits: any): CastMember[] {
  const list: any[] = credits?.cast ?? [];
  return list.slice(0, 8).map((member) => ({
    name: member.name,
    role: member.character || 'Cast',
    image: member.profile_path ? imageUrl(member.profile_path, 'w185', '') : undefined,
  }));
}

function mapSeasons(raw: any): SeasonInfo[] {
  const seasons: any[] = raw?.seasons ?? [];
  return seasons
    .filter((season) => season.season_number > 0)
    .map((season) => {
      const countdown = daysUntil(season.air_date);
      const isUpcoming = (countdown ?? -1) > 0 || !season.air_date;
      return {
        seasonNumber: season.season_number,
        title: season.name || `Season ${season.season_number}`,
        episodeCount: season.episode_count || 0,
        releaseDate: season.air_date || 'TBA',
        status: isUpcoming ? 'upcoming' : 'released',
        overview: season.overview || undefined,
        countdownDays: isUpcoming && countdown !== undefined ? countdown : undefined,
      } as SeasonInfo;
    });
}

function usProviders(watchProviders: any): { ids: StreamingProviderId[]; link?: string } {
  const region = watchProviders?.results?.US || watchProviders?.results?.GB || {};
  const flatrate: any[] = region.flatrate ?? [];
  const ids: StreamingProviderId[] = [];
  flatrate.forEach((entry) => {
    const matched = matchProvider(entry.provider_name || '');
    if (matched && !ids.includes(matched)) ids.push(matched);
  });
  return { ids, link: region.link };
}

function contentRatingFor(raw: any, mediaType: TmdbMediaType): string {
  if (mediaType === 'tv') {
    const usRating = (raw.content_ratings?.results ?? []).find((r: any) => r.iso_3166_1 === 'US');
    return usRating?.rating || 'TV-14';
  }
  const usRelease = (raw.release_dates?.results ?? []).find((r: any) => r.iso_3166_1 === 'US');
  const certified = (usRelease?.release_dates ?? []).find((r: any) => r.certification);
  return certified?.certification || 'NR';
}

function statusFor(raw: any, mediaType: TmdbMediaType, isFuture: boolean): Series['status'] {
  if (isFuture) return 'Upcoming Series';
  if (mediaType === 'movie') return 'Ended';
  if (raw.status === 'Ended' || raw.status === 'Canceled') return 'Ended';
  if (raw.status === 'In Production' || raw.status === 'Planned') return 'In Production';
  return 'Returning Series';
}

/** Full mapping used when a title is added to the catalog (details + credits + providers). */
export function mapDetailToSeries(raw: any, mediaType: TmdbMediaType): Series {
  const base = mapListResult(raw, mediaType);
  const { ids, link } = usProviders(raw['watch/providers']);
  const network = raw.networks?.[0]?.name || raw.production_companies?.[0]?.name;
  const fallbackProvider = network ? matchProvider(network) : null;
  const providers = ids.length ? ids : fallbackProvider ? [fallbackProvider] : [];
  const nextEpisodeDate: string | undefined = raw.next_episode_to_air?.air_date;
  const nextSeasonDaysLeft = daysUntil(nextEpisodeDate) ?? base.nextSeasonDaysLeft;
  const lastAirYear = raw.last_air_date ? yearOf(raw.last_air_date) : undefined;
  const isFuture = base.isUpcoming;
  const status = statusFor(raw, mediaType, isFuture);

  return {
    ...base,
    imdbId: raw.external_ids?.imdb_id || undefined,
    tagline: raw.tagline || base.tagline,
    providers,
    primaryProvider: providers[0] ?? 'all',
    directWatchUrl: link,
    genres: (raw.genres ?? []).map((g: any) => g.name),
    contentRating: contentRatingFor(raw, mediaType),
    lastAirYear,
    totalSeasons: mediaType === 'tv' ? raw.number_of_seasons || 1 : 1,
    totalEpisodes: mediaType === 'tv' ? raw.number_of_episodes || 0 : 1,
    status,
    isNowPlaying: !isFuture && (mediaType === 'movie' || raw.in_production === true || status === 'Returning Series'),
    isClassic: base.firstAirYear < 2018 || status === 'Ended',
    hasNewSeasonAlert: Boolean(nextEpisodeDate) || (nextSeasonDaysLeft ?? -1) > 0,
    renewalState:
      status === 'Ended'
        ? 'concluded'
        : status === 'In Production'
          ? 'in_production'
          : isFuture || nextEpisodeDate
            ? 'season_upcoming'
            : 'airing_now',
    renewalBadgeText:
      status === 'Ended'
        ? mediaType === 'movie'
          ? 'Feature Film'
          : 'Ended / Complete Series'
        : nextEpisodeDate
          ? `Next episode ${nextEpisodeDate}`
          : isFuture
            ? 'Upcoming Release'
            : 'Available Now',
    nextSeasonNumber: raw.next_episode_to_air?.season_number,
    nextSeasonReleaseDate: nextEpisodeDate || base.nextSeasonReleaseDate,
    nextSeasonDaysLeft,
    seasons: mediaType === 'tv' ? mapSeasons(raw) : [],
    cast: mapCast(raw.credits),
    creator: raw.created_by?.[0]?.name || (raw.credits?.crew ?? []).find((c: any) => c.job === 'Director')?.name,
    network,
  };
}

export async function searchTmdb(
  credentials: TmdbCredentials,
  query: string,
  mediaType: TmdbMediaType | 'multi' = 'multi'
): Promise<Series[]> {
  const path = mediaType === 'multi' ? '/search/multi' : `/search/${mediaType}`;
  const data = await tmdbFetch<{ results: any[] }>(path, credentials, {
    query,
    include_adult: 'false',
    language: 'en-US',
    page: '1',
  });

  return (data.results ?? [])
    .filter((raw) => (mediaType === 'multi' ? raw.media_type === 'tv' || raw.media_type === 'movie' : true))
    .map((raw) => mapListResult(raw, (mediaType === 'multi' ? raw.media_type : mediaType) as TmdbMediaType));
}

/**
 * Popularity-ordered catalog pages, so the Series and Movies tabs can offer a browsable list
 * instead of only titles that were already imported.
 */
export async function discoverTmdb(
  credentials: TmdbCredentials,
  mediaType: TmdbMediaType,
  page = 1
): Promise<{ results: Series[]; page: number; totalPages: number }> {
  const data = await tmdbFetch<{ results: any[]; page: number; total_pages: number }>(
    `/discover/${mediaType}`,
    credentials,
    {
      include_adult: 'false',
      language: 'en-US',
      sort_by: 'popularity.desc',
      'vote_count.gte': mediaType === 'movie' ? '150' : '50',
      page: String(Math.max(1, Math.min(500, page))),
    }
  );
  return {
    results: (data.results ?? []).map((raw) => mapListResult(raw, mediaType)),
    page: data.page ?? page,
    totalPages: data.total_pages ?? page,
  };
}

export async function trendingTmdb(
  credentials: TmdbCredentials,
  mediaType: TmdbMediaType | 'all' = 'all'
): Promise<Series[]> {
  const data = await tmdbFetch<{ results: any[] }>(`/trending/${mediaType}/week`, credentials, { language: 'en-US' });
  return (data.results ?? [])
    .filter((raw) => {
      const type = mediaType === 'all' ? raw.media_type : mediaType;
      return type === 'tv' || type === 'movie';
    })
    .map((raw) => mapListResult(raw, (mediaType === 'all' ? raw.media_type : mediaType) as TmdbMediaType));
}

export async function fetchTmdbTitle(
  credentials: TmdbCredentials,
  mediaType: TmdbMediaType,
  tmdbId: number
): Promise<Series> {
  const appendix =
    mediaType === 'tv'
      ? 'credits,external_ids,watch/providers,content_ratings'
      : 'credits,external_ids,watch/providers,release_dates';
  const raw = await tmdbFetch<any>(`/${mediaType}/${tmdbId}`, credentials, {
    language: 'en-US',
    append_to_response: appendix,
  });
  return mapDetailToSeries(raw, mediaType);
}
