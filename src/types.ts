export type StreamingProviderId =
  | 'all'
  | 'theaters'
  | 'netflix'
  | 'appletv'
  | 'max'
  | 'prime'
  | 'mubi'
  | 'hulu'
  | 'paramount'
  | 'peacock'
  | 'disney'
  | 'disney_plus';

export interface StreamingProvider {
  id: StreamingProviderId;
  name: string;
  badgeColor: string;
  bgColor: string;
  textColor: string;
  iconName: string;
  accentColor: string;
}

export type SeriesCategory =
  | 'now_playing'
  | 'movies'
  | 'series'
  | 'upcoming'
  | 'new_seasons'
  | 'classics'
  | 'watchlist';

export type TimelineEra = 'all' | 'current' | 'past' | 'upcoming';
export type MediaKind = 'all' | 'theaters' | 'movies' | 'series';

export type RenewalState =
  | 'airing_now'
  | 'season_upcoming'
  | 'renewed'
  | 'in_production'
  | 'pending'
  | 'concluded'
  | 'final_season_upcoming';

export interface SeasonInfo {
  seasonNumber: number;
  title: string;
  episodeCount: number;
  releaseDate: string; // ISO or year
  status: 'released' | 'upcoming' | 'airing' | 'announced';
  overview?: string;
  trailerUrl?: string;
  countdownDays?: number; // if upcoming
}

export interface CastMember {
  name: string;
  role: string;
  image?: string;
}

export interface Series {
  id: string;
  imdbId?: string;
  mediaType?: 'tv' | 'movie';
  title: string;
  originalTitle?: string;
  tagline: string;
  synopsis: string;
  posterUrl: string;
  backdropUrl: string;
  providers: StreamingProviderId[];
  directWatchUrl?: string;
  primaryProvider: StreamingProviderId;
  genres: string[];
  rating: number; // e.g. 8.9 / 10
  ratingCount?: string;
  contentRating: string; // e.g. TV-MA, TV-14
  firstAirYear: number;
  lastAirYear?: number;
  decade: 'Pre-70s' | '70s' | '80s' | '90s' | '2000s' | '2010s' | '2020s';
  totalSeasons: number;
  totalEpisodes: number;
  runtimeMinutes?: number;
  theaterStatus?: 'now_in_theaters' | 'coming_to_theaters' | 'past_theatrical';
  boxOffice?: string;
  isDomestic?: boolean;
  director?: string;
  status: 'Returning Series' | 'Ended' | 'Upcoming Series' | 'In Production' | 'Released' | 'In Theaters' | 'Upcoming';
  
  // Category flags
  isNowPlaying: boolean;
  isUpcoming: boolean;
  isClassic: boolean;
  hasNewSeasonAlert: boolean;

  // Provider Curation & Editorial Shelves
  isNewOnProvider?: boolean;
  isNextWatch?: boolean;
  isCurrentlyAiring?: boolean;

  // Specific New Season / Renewal info
  renewalState: RenewalState;
  renewalBadgeText: string;
  nextSeasonNumber?: number;
  nextSeasonReleaseDate?: string; // e.g. "2026-09-15"
  nextSeasonDaysLeft?: number;
  renewalNewsSummary?: string;
  productionNotes?: string;

  // Seasons detail
  seasons: SeasonInfo[];
  cast: CastMember[];
  creator?: string;
  network?: string;
  source?: 'catalog' | 'wikipedia' | 'tvmaze' | 'gemini_radar';
}

export interface AISeasonIntel {
  seriesTitle: string;
  renewalStatus: string;
  confirmedNextSeason?: number;
  projectedReleaseWindow: string;
  productionStatus: string;
  filmingLocation?: string;
  keyCastUpdates: string[];
  plotTeasers: string[];
  sourcesSummary: string;
  confidence: 'High (Official Announcement)' | 'Medium (Industry Reports)' | 'Speculative (Production Rumors)';
  lastUpdated: string;
}

export interface FilterState {
  category: SeriesCategory;
  provider: StreamingProviderId;
  genre: string;
  decade: string;
  searchQuery: string;
  sortBy: 'popularity' | 'rating' | 'releaseDate' | 'countdown' | 'title';
  statusFilter: 'all' | 'renewed' | 'upcoming' | 'airing' | 'concluded';
}
