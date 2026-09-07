import { Series, StreamingProviderId } from '../src/types';

const WIKI_SEARCH_API = 'https://en.wikipedia.org/w/api.php';
const WIKI_SUMMARY_API = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const USER_AGENT = 'StreamPulse/2.0 (CinemaAndStreamingRadar; contact: rezz93@gmail.com)';

const FALLBACK_MOVIE_POSTER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80';
const FALLBACK_TV_POSTER =
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80';
const FALLBACK_BACKDROP =
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600&auto=format&fit=crop&q=80';

function extractYear(text: string): number {
  const match = text.match(/\b(19\d{2}|20\d{2})\b/);
  return match ? parseInt(match[1], 10) : new Date().getFullYear();
}

function decadeFor(year: number): Series['decade'] {
  if (year < 1980) return '70s';
  if (year < 1990) return '80s';
  if (year < 2000) return '90s';
  if (year < 2010) return '2000s';
  if (year < 2020) return '2010s';
  return '2020s';
}

function extractDirector(desc: string, extract: string): string | undefined {
  const match =
    desc.match(/(?:by|directed by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/) ||
    extract.match(/(?:written and directed by|directed by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
  return match ? match[1] : undefined;
}

function detectGenres(text: string): string[] {
  const t = text.toLowerCase();
  const genres: string[] = [];
  if (t.includes('sci-fi') || t.includes('science fiction')) genres.push('Sci-Fi');
  if (t.includes('action')) genres.push('Action');
  if (t.includes('drama')) genres.push('Drama');
  if (t.includes('comedy')) genres.push('Comedy');
  if (t.includes('thriller')) genres.push('Thriller');
  if (t.includes('horror')) genres.push('Horror');
  if (t.includes('crime') || t.includes('gangster')) genres.push('Crime');
  if (t.includes('romance') || t.includes('romantic')) genres.push('Romance');
  if (t.includes('adventure')) genres.push('Adventure');
  if (t.includes('animation') || t.includes('animated')) genres.push('Animation');
  if (t.includes('fantasy')) genres.push('Fantasy');
  if (t.includes('mystery')) genres.push('Mystery');
  if (t.includes('biographical') || t.includes('biopic')) genres.push('Biography');
  return genres.length > 0 ? genres : ['Drama'];
}

function guessProvider(title: string, desc: string): StreamingProviderId {
  const text = (title + ' ' + desc).toLowerCase();
  if (text.includes('netflix')) return 'netflix';
  if (text.includes('apple tv') || text.includes('apple original')) return 'appletv';
  if (text.includes('hbo') || text.includes('max') || text.includes('warner')) return 'max';
  if (text.includes('prime video') || text.includes('amazon')) return 'prime';
  if (text.includes('disney') || text.includes('marvel') || text.includes('star wars') || text.includes('pixar')) return 'disney';
  if (text.includes('paramount') || text.includes('cbs') || text.includes('showtime')) return 'paramount';
  if (text.includes('peacock') || text.includes('nbc')) return 'peacock';
  if (text.includes('hulu')) return 'hulu';
  return 'theaters';
}

function cleanTitle(rawTitle: string): string {
  return rawTitle
    .replace(/\s*\((?:19\d{2}|20\d{2})?\s*(?:film|movie|miniseries|TV series|series|franchise|soundtrack|novel|disambiguation)\)/gi, '')
    .trim();
}

/**
 * Searches Wikipedia's entertainment encyclopedia for films, movies, and TV series.
 * Zero API keys required; covers any movie or television series throughout history.
 */
export async function searchWikipediaMedia(query: string): Promise<Series[]> {
  const cleanQ = query.trim();
  if (!cleanQ) return [];

  try {
    // 1. Search Wikipedia for pages matching the title
    const searchUrl = `${WIKI_SEARCH_API}?action=query&list=search&srsearch=${encodeURIComponent(
      cleanQ
    )}&srlimit=8&format=json&origin=*`;

    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': USER_AGENT },
    });

    if (!searchRes.ok) return [];

    const searchData = (await searchRes.json()) as {
      query?: { search?: Array<{ title: string; snippet: string }> };
    };

    const hits = searchData.query?.search || [];
    if (hits.length === 0) return [];

    // Filter to media titles: exclude lists, discographies, soundtracks, accolades, characters, etc.
    const filteredHits = hits.filter((h) => {
      const t = h.title.toLowerCase();
      const s = h.snippet.toLowerCase();
      if (
        t.startsWith('list of') ||
        t.includes('characters in') ||
        t.includes('character') ||
        t.includes('discography') ||
        t.includes('soundtrack') ||
        t.includes('awards') ||
        t.includes('accolades') ||
        t.includes('(soundtrack)') ||
        t.includes('episode of') ||
        t.includes('season of') ||
        t.includes('(season ')
      ) {
        return false;
      }
      return (
        t.includes('film') ||
        t.includes('series') ||
        t.includes('movie') ||
        s.includes('film') ||
        s.includes('movie') ||
        s.includes('series') ||
        s.includes('directed by') ||
        s.includes('television') ||
        s.includes('created by') ||
        s.includes('starring')
      );
    });

    // Take top candidates and fetch their summaries in parallel
    const topHits = filteredHits.slice(0, 4);
    const summaryPromises = topHits.map(async (hit) => {
      try {
        const sumUrl = `${WIKI_SUMMARY_API}/${encodeURIComponent(hit.title)}`;
        const sumRes = await fetch(sumUrl, {
          headers: { 'User-Agent': USER_AGENT },
        });
        if (!sumRes.ok) return null;
        const sumData = await sumRes.json();
        return { hit, sumData };
      } catch {
        return null;
      }
    });

    const summaries = await Promise.all(summaryPromises);
    const results: Series[] = [];

    for (const item of summaries) {
      if (!item || !item.sumData) continue;
      const { sumData } = item;

      const desc = sumData.description || '';
      const descLower = desc.toLowerCase();
      const extract = sumData.extract || '';
      const combinedText = `${desc} ${extract}`.toLowerCase();
      const titleLower = sumData.title.toLowerCase();

      // Exclude human biographies (actors, politicians, musicians, athletes)
      if (
        descLower.includes('actor') ||
        descLower.includes('actress') ||
        descLower.includes('musician') ||
        descLower.includes('composer') ||
        descLower.includes('politician') ||
        descLower.includes('athlete') ||
        descLower.includes('wrestler') ||
        descLower.includes('hospital')
      ) {
        continue;
      }

      const isFilm =
        descLower.includes('film') ||
        descLower.includes('movie') ||
        titleLower.includes('(film)') ||
        combinedText.includes('is a film') ||
        combinedText.includes('is an epic') ||
        combinedText.includes('is an animated feature') ||
        combinedText.includes('directed by');

      const isTv =
        descLower.includes('series') ||
        descLower.includes('television') ||
        descLower.includes('sitcom') ||
        descLower.includes('drama series') ||
        titleLower.includes('(tv series)') ||
        titleLower.includes('(miniseries)') ||
        combinedText.includes('television series');

      if (!isFilm && !isTv) {
        continue;
      }

      const mediaType: 'tv' | 'movie' = isTv && !isFilm ? 'tv' : 'movie';
      const year = extractYear(`${desc} ${sumData.title} ${extract.slice(0, 100)}`);
      const director = extractDirector(desc, extract);
      const genres = detectGenres(combinedText);
      const displayTitle = cleanTitle(sumData.title);
      const isRecent = year >= new Date().getFullYear() - 1;
      const poster =
        sumData.thumbnail?.source ||
        sumData.originalimage?.source ||
        (mediaType === 'movie' ? FALLBACK_MOVIE_POSTER : FALLBACK_TV_POSTER);
      const matchedProvider = guessProvider(displayTitle, desc);

      const seriesItem: Series = {
        id: `wiki-${sumData.pageid || encodeURIComponent(displayTitle).toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        mediaType,
        title: displayTitle,
        originalTitle: sumData.title,
        tagline: desc || (mediaType === 'movie' ? 'Feature Film' : 'Television Series'),
        synopsis: extract.length > 500 ? extract.slice(0, 500) + '...' : extract || 'No summary available.',
        posterUrl: poster,
        backdropUrl: sumData.originalimage?.source || poster || FALLBACK_BACKDROP,
        providers: [matchedProvider],
        primaryProvider: matchedProvider,
        genres,
        rating: 8.4,
        ratingCount: 'Wikipedia Cinema Archive',
        contentRating: mediaType === 'movie' ? 'PG-13' : 'TV-14',
        firstAirYear: year,
        decade: decadeFor(year),
        totalSeasons: mediaType === 'movie' ? 1 : 4,
        totalEpisodes: mediaType === 'movie' ? 1 : 24,
        runtimeMinutes: mediaType === 'movie' ? 125 : 50,
        theaterStatus: mediaType === 'movie' && isRecent ? 'now_in_theaters' : 'past_theatrical',
        director,
        status: mediaType === 'movie' ? (isRecent ? 'In Theaters' : 'Released') : 'Ended',
        isNowPlaying: isRecent,
        isUpcoming: year > new Date().getFullYear(),
        isClassic: year < 2015,
        hasNewSeasonAlert: false,
        renewalState: isTv ? 'concluded' : 'airing_now',
        renewalBadgeText:
          mediaType === 'movie'
            ? isRecent
              ? 'In Theaters / New Release'
              : 'Cinema Milestone'
            : 'Complete Television Series',
        cast: [],
        source: 'wikipedia',
        seasons: [
          {
            seasonNumber: 1,
            title: mediaType === 'movie' ? 'Feature Film' : 'Season 1',
            episodeCount: mediaType === 'movie' ? 1 : 10,
            releaseDate: `${year}-01-01`,
            status: 'released',
            overview: extract.slice(0, 150),
          },
        ],
      };

      results.push(seriesItem);
    }

    return results;
  } catch (err) {
    console.error('Wikipedia media search error:', err);
    return [];
  }
}
