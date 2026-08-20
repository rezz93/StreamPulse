export type StreamingProviderId =
  | 'all'
  | 'netflix'
  | 'appletv'
  | 'max'
  | 'prime'
  | 'disney'
  | 'hulu'
  | 'paramount'
  | 'peacock';

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
  | 'upcoming'
  | 'new_seasons'
  | 'classics'
  | 'watchlist';

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
  tmdbId?: number;
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
  decade: '70s' | '80s' | '90s' | '2000s' | '2010s' | '2020s';
  totalSeasons: number;
  totalEpisodes: number;
  status: 'Returning Series' | 'Ended' | 'Upcoming Series' | 'In Production';
  
  // Category flags
  isNowPlaying: boolean;
  isUpcoming: boolean;
  isClassic: boolean;
  hasNewSeasonAlert: boolean;

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
