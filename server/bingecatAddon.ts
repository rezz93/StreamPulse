import { Series } from '../src/types';

// Map of popular series to IMDb IDs for stream resolution in Bingecat / Stremio
export const IMDB_MAPPING: Record<string, { imdbId: string }> = {
  'severance': { imdbId: 'tt11280740' },
  'the-last-of-us': { imdbId: 'tt3581920' },
  'stranger-things': { imdbId: 'tt4574334' },
  'house-of-the-dragon': { imdbId: 'tt11198330' },
  'the-bear': { imdbId: 'tt14452776' },
  'the-white-lotus': { imdbId: 'tt13406094' },
  'shogun': { imdbId: 'tt2788316' },
  'slow-horses': { imdbId: 'tt5875444' },
  'fallout': { imdbId: 'tt12637874' },
  'silo': { imdbId: 'tt14688458' },
  'wednesday': { imdbId: 'tt13443470' },
  'succession': { imdbId: 'tt7660850' },
  'breaking-bad': { imdbId: 'tt0903747' },
  'game-of-thrones': { imdbId: 'tt0944947' },
  'the-sopranos': { imdbId: 'tt0141842' },
  'the-wire': { imdbId: 'tt0306414' },
  'dark': { imdbId: 'tt5753856' },
  'mindhunter': { imdbId: 'tt5290382' },
  'ted-lasso': { imdbId: 'tt10986410' },
  'squid-game': { imdbId: 'tt10919420' },
  'peaky-blinders': { imdbId: 'tt2442560' },
  'true-detective': { imdbId: 'tt2356777' },
  'fargo': { imdbId: 'tt2802850' },
  'the-boys': { imdbId: 'tt1190634' },
};

export function getAddonManifest(baseUrl: string) {
  return {
    id: 'org.streampulse.addon',
    version: '1.3.0',
    name: 'StreamPulse Radar',
    description: 'Curated season premieres, renewed series radar, in-theaters & top streaming movies for Nuvio & Stremio.',
    logo: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=256&auto=format&fit=crop&q=80',
    background: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1280&auto=format&fit=crop&q=80',
    resources: ['catalog', 'meta'],
    types: ['series', 'movie'],
    catalogs: [
      {
        type: 'series',
        id: 'streampulse_upcoming',
        name: 'StreamPulse: Upcoming Premieres',
        extra: [{ name: 'search', isRequired: false }, { name: 'skip', isRequired: false }]
      },
      {
        type: 'series',
        id: 'streampulse_renewals',
        name: 'StreamPulse: Renewed Radar',
        extra: [{ name: 'search', isRequired: false }, { name: 'skip', isRequired: false }]
      },
      {
        type: 'series',
        id: 'streampulse_trending',
        name: 'StreamPulse: Top Rated Shows',
        extra: [{ name: 'search', isRequired: false }, { name: 'skip', isRequired: false }]
      },
      {
        type: 'movie',
        id: 'streampulse_movies',
        name: 'StreamPulse: Featured Cinema & Hits',
        extra: [{ name: 'search', isRequired: false }, { name: 'skip', isRequired: false }]
      },
      {
        type: 'series',
        id: 'streampulse_watchlist',
        name: 'StreamPulse: My Watchlist',
        extra: [{ name: 'search', isRequired: false }, { name: 'skip', isRequired: false }]
      }
    ],
    idPrefixes: ['tt', 'streampulse:']
  };
}

export function seriesToMetaItem(series: Series) {
  const mapping = IMDB_MAPPING[series.id];
  const metaId = series.imdbId || mapping?.imdbId || `streampulse:${series.id}`;
  const isMovie = series.mediaType === 'movie';

  return {
    id: metaId,
    type: isMovie ? 'movie' : 'series',
    name: series.title,
    poster: series.posterUrl,
    posterShape: 'poster',
    banner: series.backdropUrl,
    background: series.backdropUrl,
    logo: series.posterUrl,
    description: `${series.renewalBadgeText ? `[${series.renewalBadgeText}] ` : ''}${series.synopsis}`,
    releaseInfo: isMovie
      ? `${series.firstAirYear}${series.runtimeMinutes ? ` • ${series.runtimeMinutes} min` : ''}`
      : `${series.firstAirYear} • ${series.totalSeasons} Season${series.totalSeasons > 1 ? 's' : ''}`,
    imdbRating: series.rating ? series.rating.toFixed(1) : undefined,
    genres: series.genres,
    links: [
      {
        name: series.primaryProvider.toUpperCase(),
        category: 'Stream',
        url: `https://trakt.tv/search/imdb/${encodeURIComponent(metaId)}`
      }
    ]
  };
}

export function seriesToFullMeta(series: Series) {
  const base = seriesToMetaItem(series);
  const isMovie = series.mediaType === 'movie';

  if (isMovie) {
    return {
      ...base,
      runtime: series.runtimeMinutes ? `${series.runtimeMinutes} min` : undefined,
      trailers: []
    };
  }

  const videos = (series.seasons || []).flatMap((season) => {
    return Array.from({ length: season.episodeCount }, (_, idx) => {
      const epNum = idx + 1;
      return {
        id: `${base.id}:${season.seasonNumber}:${epNum}`,
        title: `S${season.seasonNumber}E${epNum} - Episode ${epNum}`,
        season: season.seasonNumber,
        episode: epNum,
        released: season.releaseDate || `${series.firstAirYear}-01-01`,
        overview: season.overview || `${series.title} Season ${season.seasonNumber} Episode ${epNum}`
      };
    });
  });

  return {
    ...base,
    videos
  };
}
