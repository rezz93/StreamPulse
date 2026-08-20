import { Series } from '../src/types';

// Map of popular series to IMDb IDs for instant 100% TMDB stream resolution in Bingecat / Stremio
export const IMDB_MAPPING: Record<string, { imdbId: string; tmdbId?: number }> = {
  'severance': { imdbId: 'tt11280740', tmdbId: 95396 },
  'the-last-of-us': { imdbId: 'tt3581920', tmdbId: 100088 },
  'stranger-things': { imdbId: 'tt4574334', tmdbId: 66732 },
  'house-of-the-dragon': { imdbId: 'tt11198330', tmdbId: 94997 },
  'the-bear': { imdbId: 'tt14452776', tmdbId: 136315 },
  'the-white-lotus': { imdbId: 'tt13406094', tmdbId: 111803 },
  'shogun': { imdbId: 'tt2788316', tmdbId: 126308 },
  'slow-horses': { imdbId: 'tt5875444', tmdbId: 95480 },
  'fallout': { imdbId: 'tt12637874', tmdbId: 106379 },
  'silo': { imdbId: 'tt14688458', tmdbId: 125988 },
  'wednesday': { imdbId: 'tt13443470', tmdbId: 119051 },
  'succession': { imdbId: 'tt7660850', tmdbId: 76331 },
  'breaking-bad': { imdbId: 'tt0903747', tmdbId: 1396 },
  'game-of-thrones': { imdbId: 'tt0944947', tmdbId: 1399 },
  'the-sopranos': { imdbId: 'tt0141842', tmdbId: 1398 },
  'the-wire': { imdbId: 'tt0306414', tmdbId: 1438 },
  'dark': { imdbId: 'tt5753856', tmdbId: 70523 },
  'mindhunter': { imdbId: 'tt5290382', tmdbId: 67744 },
  'ted-lasso': { imdbId: 'tt10986410', tmdbId: 97546 },
  'squid-game': { imdbId: 'tt10919420', tmdbId: 93405 },
  'peaky-blinders': { imdbId: 'tt2442560', tmdbId: 60574 },
  'true-detective': { imdbId: 'tt2356777', tmdbId: 46648 },
  'fargo': { imdbId: 'tt2802850', tmdbId: 60622 },
  'the-boys': { imdbId: 'tt1190634', tmdbId: 76479 },
};

export function getAddonManifest(baseUrl: string) {
  return {
    id: 'org.streampulse.bingecat',
    version: '1.2.0',
    name: 'StreamPulse Series Radar',
    description: 'Direct watchlist sync and upcoming season premiere alerts for Bingecat & Stremio.',
    logo: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=256&auto=format&fit=crop&q=80',
    background: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1280&auto=format&fit=crop&q=80',
    resources: ['catalog', 'meta'],
    types: ['series'],
    catalogs: [
      {
        type: 'series',
        id: 'streampulse_watchlist',
        name: 'StreamPulse: Watchlist',
        extra: [{ name: 'search', isRequired: false }]
      },
      {
        type: 'series',
        id: 'streampulse_upcoming',
        name: 'StreamPulse: Upcoming Season Premieres',
        extra: [{ name: 'search', isRequired: false }]
      },
      {
        type: 'series',
        id: 'streampulse_renewals',
        name: 'StreamPulse: Renewed Season Radar',
        extra: [{ name: 'search', isRequired: false }]
      },
      {
        type: 'series',
        id: 'streampulse_trending',
        name: 'StreamPulse: Top Rated Shows',
        extra: [{ name: 'search', isRequired: false }]
      }
    ],
    idPrefixes: ['tt', 'tmdb:', 'streampulse:']
  };
}

export function seriesToMetaItem(series: Series) {
  const mapping = IMDB_MAPPING[series.id];
  const metaId = mapping?.imdbId || `streampulse:${series.id}`;

  return {
    id: metaId,
    type: 'series',
    name: series.title,
    poster: series.posterUrl,
    posterShape: 'poster',
    banner: series.backdropUrl,
    background: series.backdropUrl,
    logo: series.posterUrl,
    description: `${series.renewalBadgeText ? `[${series.renewalBadgeText}] ` : ''}${series.synopsis}`,
    releaseInfo: `${series.firstAirYear} • ${series.totalSeasons} Season${series.totalSeasons > 1 ? 's' : ''}`,
    imdbRating: series.rating.toFixed(1),
    genres: series.genres,
    links: [
      {
        name: series.primaryProvider.toUpperCase(),
        category: 'Stream',
        url: `https://bingecat.com/search?q=${encodeURIComponent(series.title)}`
      }
    ]
  };
}

export function seriesToFullMeta(series: Series) {
  const base = seriesToMetaItem(series);
  
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
