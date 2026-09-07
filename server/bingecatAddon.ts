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
    idPrefixes: ['tt', 'streampulse:']
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
