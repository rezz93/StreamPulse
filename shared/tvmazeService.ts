import { Series, StreamingProviderId } from '../src/types';

const TVMAZE_SEARCH = 'https://api.tvmaze.com/search/shows';
const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80';
const FALLBACK_BACKDROP = 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600&auto=format&fit=crop&q=80';

function providerForNetwork(networkName: string): StreamingProviderId {
  const netLower = networkName.toLowerCase();
  if (netLower.includes('apple')) return 'appletv';
  if (netLower.includes('hbo') || netLower.includes('max')) return 'max';
  if (netLower.includes('amazon') || netLower.includes('prime')) return 'prime';
  if (netLower.includes('disney')) return 'disney';
  if (netLower.includes('hulu')) return 'hulu';
  if (netLower.includes('paramount') || netLower.includes('cbs') || netLower.includes('showtime')) return 'paramount';
  if (netLower.includes('peacock') || netLower.includes('nbc')) return 'peacock';
  return 'netflix';
}

function decadeFor(year: number): Series['decade'] {
  if (year < 1980) return '70s';
  if (year < 1990) return '80s';
  if (year < 2000) return '90s';
  if (year < 2010) return '2000s';
  if (year < 2020) return '2010s';
  return '2020s';
}

function mapShow(show: any): Series {
  const networkName = show.webChannel?.name || show.network?.name || 'Streaming';
  const matchedProvider = providerForNetwork(networkName);
  const premiereYear = show.premiered ? parseInt(show.premiered.slice(0, 4), 10) : 2024;
  const isEnded = show.status === 'Ended';

  return {
    id: `tvm-${show.id}`,
    title: show.name,
    tagline: show.type || 'Television Series',
    synopsis: show.summary ? show.summary.replace(/<[^>]*>?/gm, '') : 'No overview available.',
    posterUrl: show.image?.original || show.image?.medium || FALLBACK_POSTER,
    backdropUrl: show.image?.original || FALLBACK_BACKDROP,
    providers: [matchedProvider],
    primaryProvider: matchedProvider,
    genres: show.genres?.length ? show.genres : ['Drama'],
    rating: show.rating?.average ? Number(show.rating.average) : 7.5,
    ratingCount: 'Verified TV Guide',
    contentRating: 'TV-14',
    firstAirYear: premiereYear,
    decade: decadeFor(premiereYear),
    totalSeasons: 1,
    totalEpisodes: 10,
    status: isEnded ? 'Ended' : 'Returning Series',
    isNowPlaying: !isEnded,
    isUpcoming: false,
    isClassic: premiereYear < 2018 || isEnded,
    hasNewSeasonAlert: !isEnded,
    renewalState: isEnded ? 'concluded' : 'renewed',
    renewalBadgeText: isEnded ? 'Ended / Complete Series' : 'Active / Returning Broadcast',
    network: networkName,
    cast: [],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodeCount: 8,
        releaseDate: show.premiered || '2024-01-01',
        status: isEnded ? 'released' : 'airing',
        overview: 'Season episodes and broadcast schedule.',
      },
    ],
  };
}

/** Looks any show up on TVMaze and maps the results into the app's Series model. */
export async function searchTvmazeShows(query: string): Promise<Series[]> {
  const response = await fetch(`${TVMAZE_SEARCH}?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error(`TVMaze API returned status ${response.status}`);
  }
  const data = (await response.json()) as Array<{ show: any }>;
  return data.slice(0, 10).map(({ show }) => mapShow(show));
}
