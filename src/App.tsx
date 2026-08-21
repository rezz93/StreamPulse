import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiFetch } from './apiClient';
import {
  Series,
  StreamingProvider,
  StreamingProviderId,
  SeriesCategory,
} from './types';
import { Header } from './components/Header';
import { ProviderFilter } from './components/ProviderFilter';
import { CategoryTabs } from './components/CategoryTabs';
import { SeriesCard } from './components/SeriesCard';
import { SeriesDetailModal } from './components/SeriesDetailModal';
import { NewSeasonRadarView } from './components/NewSeasonRadarView';
import { ClassicsExplorerView } from './components/ClassicsExplorerView';
import { UpcomingTimelineView } from './components/UpcomingTimelineView';
import { WatchlistView } from './components/WatchlistView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AndroidPwaModal } from './components/AndroidPwaModal';
import { TmdbSyncModal } from './components/TmdbSyncModal';
import { TmdbBrowseModal } from './components/TmdbBrowseModal';
import { cleanTmdbListId } from '../shared/tmdbListSync';
import {
  clearTmdbWriteToken,
  getTmdbAccountWatchlistEnabled,
  getTmdbListId,
  getTmdbMovieListId,
  getTmdbWriteToken,
  migrateDefaultTmdbListId,
} from './tmdbSettings';
import { getStoredTmdbToken } from './tmdbToken';
import { fetchTmdbDiscover, importTmdbTitle } from './tmdbClient';
import {
  SlidersHorizontal,
  Flame,
  ArrowUpDown,
  Search,
  Tv,
  Film,
  Sparkles,
  Info,
  Calendar,
  Loader2,
} from 'lucide-react';

type BrowseKind = 'tv' | 'movie';

interface BrowseState {
  results: Series[];
  page: number;
  totalPages: number;
}

const EMPTY_BROWSE: Record<BrowseKind, BrowseState> = {
  tv: { results: [], page: 0, totalPages: 1 },
  movie: { results: [], page: 0, totalPages: 1 },
};

export default function App() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [providers, setProviders] = useState<StreamingProvider[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter & Navigation states
  const [activeCategory, setActiveCategory] = useState<SeriesCategory>('now_playing');
  const [selectedProvider, setSelectedProvider] = useState<StreamingProviderId>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('All Genres');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'countdown' | 'releaseDate' | 'title'>('popularity');

  // Modals & Drawers
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);
  const [isTmdbModalOpen, setIsTmdbModalOpen] = useState<boolean>(false);
  const [isTmdbBrowseOpen, setIsTmdbBrowseOpen] = useState<boolean>(false);
  const [tmdbRemovalStatus, setTmdbRemovalStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Popularity-ordered TMDB pages that back the Series and Movies browse tabs
  const [browse, setBrowse] = useState<Record<BrowseKind, BrowseState>>(EMPTY_BROWSE);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseError, setBrowseError] = useState<string | null>(null);

  // Watchlist persistence in localStorage & server sync for Bingecat Addon
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('streampulse_watchlist');
      return saved ? JSON.parse(saved) : ['severance', 'the-last-of-us', 'stranger-things'];
    } catch {
      return ['severance', 'the-last-of-us', 'stranger-things'];
    }
  });

  useEffect(() => {
    migrateDefaultTmdbListId();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('streampulse_watchlist', JSON.stringify(watchlist));
      // Sync with server backend for Bingecat Addon catalog
      apiFetch('/api/watchlist/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchlist })
      }).catch((e) => console.log('Watchlist sync error', e));
    } catch (e) {
      console.error(e);
    }
  }, [watchlist]);

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [provRes, seriesRes] = await Promise.all([
          apiFetch('/api/providers'),
          apiFetch('/api/series')
        ]);
        const provData = await provRes.json();
        const seriesData = await seriesRes.json();

        setProviders(provData);
        setSeriesList(seriesData.series || []);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const browseKind: BrowseKind | null =
    activeCategory === 'movies' ? 'movie' : activeCategory === 'now_playing' ? 'tv' : null;

  const loadBrowsePage = useCallback(async (kind: BrowseKind, page: number) => {
    setBrowseLoading(true);
    setBrowseError(null);
    try {
      const data = await fetchTmdbDiscover(kind, page);
      setBrowse((prev) => {
        const known = new Set(prev[kind].results.map((s) => s.id));
        return {
          ...prev,
          [kind]: {
            results: [...prev[kind].results, ...data.results.filter((s) => !known.has(s.id))],
            page: data.page,
            totalPages: data.totalPages,
          },
        };
      });
    } catch (err) {
      setBrowseError(err instanceof Error ? err.message : 'Could not load titles from TMDB.');
    } finally {
      setBrowseLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!browseKind || browse[browseKind].page > 0 || browseLoading) return;
    void loadBrowsePage(browseKind, 1);
  }, [browseKind, browse, browseLoading, loadBrowsePage]);

  const showTmdbRemovalStatus = (type: 'success' | 'error', message: string) => {
    setTmdbRemovalStatus({ type, message });
    window.setTimeout(() => setTmdbRemovalStatus(null), 4500);
  };

  const removeFromTmdb = async (series: Series) => {
    if (!series.tmdbId) return;

    const writeToken = getTmdbWriteToken();
    const tvListId = cleanTmdbListId(getTmdbListId());
    const movieListId = cleanTmdbListId(getTmdbMovieListId());
    const configuredListId = series.mediaType === 'movie' ? movieListId || tvListId : tvListId;
    const mirrorAccountWatchlist = getTmdbAccountWatchlistEnabled();
    if (!writeToken || (!configuredListId && !mirrorAccountWatchlist)) return;

    try {
      const response = await apiFetch('/api/tmdb/remove-from-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listId: tvListId,
          movieListId,
          apiKey: writeToken,
          readToken: getStoredTmdbToken(),
          syncAccountWatchlist: mirrorAccountWatchlist,
          items: [{
            id: series.id,
            title: series.title,
            tmdbId: series.tmdbId,
            mediaType: series.mediaType,
          }],
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          clearTmdbWriteToken();
          showTmdbRemovalStatus('error', 'TMDB authorization expired. Re-run authorization from the TMDB Sync modal.');
          return;
        }
        throw new Error(data.error || `TMDB removal failed with status ${response.status}`);
      }

      const listIds = Array.isArray(data.lists)
        ? data.lists.map((list: { listId?: string }) => list.listId).filter(Boolean)
        : [];
      const destination = listIds.length
        ? listIds.map((listId: string) => `#${listId}`).join(' and ')
        : configuredListId
          ? `#${configuredListId}`
          : '';
      const accountWatchlistNote = data.accountWatchlistError
        ? ` Account watchlist: ${data.accountWatchlistError}`
        : data.accountWatchlist
          ? ' Also removed from your TMDB account watchlist.'
          : '';
      showTmdbRemovalStatus(
        'success',
        destination
          ? `Removed ${series.title} from TMDB list ${destination}.${accountWatchlistNote}`
          : `Removed ${series.title} from your TMDB account watchlist.`
      );
    } catch (error) {
      showTmdbRemovalStatus(
        'error',
        error instanceof Error ? error.message : `Failed to remove ${series.title} from TMDB.`
      );
    }
  };

  const handleToggleWatchlist = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isRemoving = watchlist.includes(id);
    if (isRemoving) {
      const removedSeries = seriesList.find((series) => series.id === id);
      if (removedSeries) void removeFromTmdb(removedSeries);
    }
    setWatchlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const upsertSeries = (series: Series) => {
    setSeriesList((prev) => {
      const existing = prev.findIndex((s) => s.id === series.id);
      if (existing < 0) return [series, ...prev];
      const next = [...prev];
      next[existing] = series;
      return next;
    });
  };

  /**
   * Favoriting a browse/search row: the title is not in the catalog yet, so add the list-level
   * record immediately and backfill the full TMDB metadata (providers, cast, seasons) after.
   */
  const handleFavoriteTitle = (series: Series) => {
    if (watchlist.includes(series.id)) {
      handleToggleWatchlist(series.id);
      return;
    }
    if (!seriesList.some((s) => s.id === series.id)) {
      upsertSeries(series);
      if (series.tmdbId) {
        void importTmdbTitle(series.mediaType === 'movie' ? 'movie' : 'tv', series.tmdbId)
          .then(({ series: full }) => upsertSeries(full))
          .catch((err) => console.warn('Could not load full TMDB metadata:', err));
      }
    }
    setWatchlist((prev) => (prev.includes(series.id) ? prev : [...prev, series.id]));
  };

  const handleTmdbImported = (series: Series, addToWatchlist: boolean) => {
    upsertSeries(series);
    if (addToWatchlist) {
      setWatchlist((prev) => (prev.includes(series.id) ? prev : [...prev, series.id]));
    }
    // Jump to the tab that actually shows the imported title.
    setActiveCategory(series.mediaType === 'movie' ? 'movies' : 'now_playing');
  };

  const handleOpenDetail = (series: Series) => {
    setSelectedSeries(series);
    setIsDetailModalOpen(true);
  };

  // Provider counts map
  const countsByProvider = useMemo(() => {
    const counts: Record<string, number> = { all: seriesList.length };
    seriesList.forEach((s) => {
      s.providers.forEach((p) => {
        counts[p] = (counts[p] || 0) + 1;
      });
    });
    return counts;
  }, [seriesList]);

  const availableGenres = useMemo(() => {
    const genreCounts = new Map<string, { label: string; count: number }>();
    seriesList.forEach((series) => {
      const seenGenres = new Set<string>();
      series.genres.forEach((genre) => {
        const label = genre.trim();
        const key = label.toLowerCase();
        if (!key || seenGenres.has(key)) return;
        seenGenres.add(key);
        const existing = genreCounts.get(key);
        genreCounts.set(key, { label: existing?.label || label, count: (existing?.count || 0) + 1 });
      });
    });
    return [
      'All Genres',
      ...Array.from(genreCounts.values())
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
        .slice(0, 16)
        .map((genre) => genre.label),
    ];
  }, [seriesList]);

  useEffect(() => {
    if (!availableGenres.includes(selectedGenre)) {
      setSelectedGenre('All Genres');
    }
  }, [availableGenres, selectedGenre]);

  const clearFilters = () => {
    setSelectedProvider('all');
    setSelectedGenre('All Genres');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedProvider !== 'all' || selectedGenre !== 'All Genres' || Boolean(searchQuery.trim());

  // Categorized counts
  const categoryCounts = useMemo(() => {
    const shows = seriesList.filter((s) => s.mediaType !== 'movie');
    const upcoming = shows.filter((s) => s.isUpcoming || (s.nextSeasonDaysLeft !== undefined && s.nextSeasonDaysLeft <= 180)).length;
    const newSeasons = shows.filter((s) => s.hasNewSeasonAlert || ['season_upcoming', 'renewed', 'in_production', 'final_season_upcoming'].includes(s.renewalState)).length;
    return {
      upcoming,
      newSeasons,
      movies: seriesList.filter((s) => s.mediaType === 'movie').length,
      total: shows.length,
    };
  }, [seriesList]);

  /**
   * TMDB browse rows for the active tab, minus anything already in the catalog. They carry no
   * provider data, so they are hidden while a network filter is on rather than filtered out.
   */
  const browseSuggestions = useMemo(() => {
    if (!browseKind || selectedProvider !== 'all') return [];
    const knownIds = new Set(seriesList.map((s) => s.id));
    const knownTmdb = new Set(
      seriesList.filter((s) => s.tmdbId).map((s) => `${s.mediaType ?? 'tv'}-${s.tmdbId}`)
    );
    return browse[browseKind].results.filter(
      (s) => !knownIds.has(s.id) && !knownTmdb.has(`${s.mediaType ?? 'tv'}-${s.tmdbId}`)
    );
  }, [browse, browseKind, selectedProvider, seriesList]);

  // Filtered series list based on active options
  const filteredSeries = useMemo(() => {
    // Movies live in their own tab, while classics can include older films.
    let list = [...seriesList, ...browseSuggestions].filter((s) =>
      activeCategory === 'movies' || activeCategory === 'watchlist' || activeCategory === 'classics'
        ? true
        : s.mediaType !== 'movie'
    );

    // Category Filter
    if (activeCategory === 'now_playing') {
      list = list.filter((s) => s.isNowPlaying);
    } else if (activeCategory === 'movies') {
      list = list.filter((s) => s.mediaType === 'movie');
    } else if (activeCategory === 'upcoming') {
      list = list.filter((s) => s.isUpcoming || (s.nextSeasonDaysLeft !== undefined && s.nextSeasonDaysLeft > 0 && s.nextSeasonDaysLeft <= 180));
    } else if (activeCategory === 'new_seasons') {
      list = list.filter((s) => s.hasNewSeasonAlert || ['season_upcoming', 'renewed', 'in_production', 'final_season_upcoming'].includes(s.renewalState));
    } else if (activeCategory === 'classics') {
      list = list.filter((s) => s.isClassic || s.status === 'Ended' || s.firstAirYear < 2020);
    } else if (activeCategory === 'watchlist') {
      list = list.filter((s) => watchlist.includes(s.id));
    }

    // Provider Filter
    if (selectedProvider !== 'all') {
      list = list.filter((s) => s.providers.includes(selectedProvider));
    }

    // Genre Filter
    if (selectedGenre !== 'All Genres') {
      list = list.filter((s) =>
        s.genres.some((g) => g.toLowerCase().includes(selectedGenre.toLowerCase()))
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.synopsis.toLowerCase().includes(q) ||
          s.genres.some((g) => g.toLowerCase().includes(q)) ||
          s.cast.some((c) => c.name.toLowerCase().includes(q)) ||
          s.renewalBadgeText.toLowerCase().includes(q) ||
          (s.network && s.network.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'countdown') {
      list.sort((a, b) => (a.nextSeasonDaysLeft ?? 9999) - (b.nextSeasonDaysLeft ?? 9999));
    } else if (sortBy === 'releaseDate') {
      list.sort((a, b) => b.firstAirYear - a.firstAirYear);
    } else if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Default: popularity / featured
      list.sort((a, b) => {
        if (a.hasNewSeasonAlert && !b.hasNewSeasonAlert) return -1;
        if (!a.hasNewSeasonAlert && b.hasNewSeasonAlert) return 1;
        return b.rating - a.rating;
      });
    }

    return list;
  }, [
    seriesList,
    browseSuggestions,
    activeCategory,
    selectedProvider,
    selectedGenre,
    searchQuery,
    sortBy,
    watchlist,
  ]);

  /** Browse and search rows are not in the catalog yet, so favoriting them has to import first. */
  const handleToggleWatchlistInGrid = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const suggestion = seriesList.some((s) => s.id === id)
      ? undefined
      : filteredSeries.find((s) => s.id === id);
    if (suggestion) handleFavoriteTitle(suggestion);
    else handleToggleWatchlist(id);
  };

  const isMoviesView = activeCategory === 'movies';

  // Watchlisted series full objects
  const watchlistedSeriesObjects = useMemo(() => {
    return seriesList.filter((s) => watchlist.includes(s.id));
  }, [seriesList, watchlist]);

  // TMDB ids already tracked, so the picker can mark them as added
  const catalogTmdbIds = useMemo(
    () => seriesList.map((s) => s.tmdbId).filter((id): id is number => typeof id === 'number'),
    [seriesList]
  );

  return (
    <div id="streampulse-app" className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenLiveSearch={() => setIsGlobalSearchOpen(true)}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
        onOpenTmdbModal={() => setIsTmdbModalOpen(true)}
        onOpenTmdbBrowse={() => setIsTmdbBrowseOpen(true)}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        watchlistCount={watchlist.length}
        totalSeriesCount={categoryCounts.total}

        upcomingCount={categoryCounts.upcoming}
        renewalsCount={categoryCounts.newSeasons}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Category Navigation Bar */}
        <CategoryTabs
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          watchlistCount={watchlist.length}
          newSeasonsCount={categoryCounts.newSeasons}
          upcomingCount={categoryCounts.upcoming}
          moviesCount={categoryCounts.movies}
        />

        {/* Streaming Providers Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-indigo-400" />
              <span>Filter by Streaming Network</span>
            </span>
            {selectedProvider !== 'all' && (
              <button
                onClick={() => setSelectedProvider('all')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                Reset to All
              </button>
            )}
          </div>
          <ProviderFilter
            providers={providers}
            selectedProvider={selectedProvider}
            onSelectProvider={setSelectedProvider}
            countsByProvider={countsByProvider}
          />
        </div>

        {/* Sub-Filters Bar: Genre chips & Sort Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
          {/* Genre Scrollable Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {availableGenres.map((genre) => {
              const isSelected = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-xs'
                      : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs text-zinc-400 font-medium">Sort:</span>
            <select
              id="sort-selector"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-700/80 text-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="popularity">Featured / Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="countdown">Premiere Countdown</option>
              <option value="releaseDate">Newest First</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* View Switcher based on Active Category */}
        {activeCategory === 'new_seasons' ? (
          <NewSeasonRadarView
            series={filteredSeries}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectSeries={handleOpenDetail}
          />
        ) : activeCategory === 'upcoming' ? (
          <UpcomingTimelineView
            series={filteredSeries}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectSeries={handleOpenDetail}
          />
        ) : activeCategory === 'classics' ? (
          <ClassicsExplorerView
            series={filteredSeries}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectSeries={handleOpenDetail}
          />
        ) : activeCategory === 'watchlist' ? (
          <WatchlistView
            watchlistedSeries={filteredSeries}
            watchlistIds={watchlist}
            totalWatchlistCount={watchlist.length}
            hasActiveFilters={hasActiveFilters}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectSeries={handleOpenDetail}
            onBrowseMore={() => setActiveCategory('now_playing')}
            onClearFilters={clearFilters}
            onOpenTmdbModal={() => setIsTmdbModalOpen(true)}
          />
        ) : (
          /* DEFAULT: NOW PLAYING / STANDARD BROWSER */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  {isMoviesView ? (
                    <Film className="w-5 h-5 text-teal-400" />
                  ) : (
                    <Flame className="w-5 h-5 text-rose-400" />
                  )}
                  <span>
                    {isMoviesView ? 'Movies' : 'Series'} ({filteredSeries.length})
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {isMoviesView
                    ? 'Popular films from TMDB plus everything in your catalog — bookmark any card to favorite it'
                    : 'Popular series from TMDB plus your tracked shows — bookmark any card to favorite it'}
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="p-16 text-center text-zinc-400">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold">Loading streaming catalogs...</p>
              </div>
            ) : filteredSeries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredSeries.map((series) => (
                  <SeriesCard
                    key={series.id}
                    series={series}
                    isWatchlisted={watchlist.includes(series.id)}
                    onToggleWatchlist={handleToggleWatchlistInGrid}
                    onSelect={handleOpenDetail}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-zinc-900/40 rounded-3xl border border-zinc-800 space-y-3">
                <Search className="w-8 h-8 text-zinc-500 mx-auto" />
                <h3 className="text-base font-bold text-white">
                  {isMoviesView ? 'No Movies Found' : 'No Series Found'}
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  {isMoviesView
                    ? 'Nothing matched. Popular films load from TMDB — add a TMDB key via "Add from TMDB" if this stays empty.'
                    : 'No series match your current filter combination. Try clearing filters or searching for another title.'}
                </p>
                <button
                  onClick={() => {
                    setSelectedProvider('all');
                    setSelectedGenre('All Genres');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {browseError && (
              <p className="text-xs text-amber-300 bg-amber-950/30 border border-amber-500/30 rounded-xl px-3 py-2">
                {browseError} Add a TMDB key via "Add from TMDB" to browse the full catalog.
              </p>
            )}

            {browseKind && !browseError && browse[browseKind].page < browse[browseKind].totalPages && (
              <div className="flex justify-center">
                <button
                  onClick={() => void loadBrowsePage(browseKind, browse[browseKind].page + 1)}
                  disabled={browseLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 text-zinc-200 border border-zinc-700/70 text-xs font-semibold transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {browseLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {browseLoading
                      ? 'Loading more from TMDB...'
                      : `Load more ${isMoviesView ? 'movies' : 'series'}`}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-zinc-800/80 bg-zinc-950/80 py-8 px-4 sm:px-6 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-zinc-300">StreamPulse Series & New Seasons Radar</span>
          </div>
          <p className="text-zinc-400">
            Streaming availability metadata synchronized across Netflix, Apple TV+, Max, Prime Video, Disney+, and Paramount+.
          </p>
        </div>
      </footer>

      {/* Series Detail & Season Explorer Modal */}
      <SeriesDetailModal
        series={selectedSeries}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        isWatchlisted={selectedSeries ? watchlist.includes(selectedSeries.id) : false}
        onToggleWatchlist={(id) => handleToggleWatchlist(id)}
      />

      {/* Global Live TV Database Search Modal */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onSelectSeries={(series) => {
          setSelectedSeries(series);
          setIsDetailModalOpen(true);
        }}
        onToggleWatchlist={handleFavoriteTitle}
        watchlistIds={watchlist}
      />

      {/* Android PWA & QR Code Modal */}
      <AndroidPwaModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />

      {/* TMDB Direct Integration & Sync Modal */}
      <TmdbSyncModal
        isOpen={isTmdbModalOpen}
        onClose={() => setIsTmdbModalOpen(false)}
        watchlistedSeries={watchlistedSeriesObjects}
      />

      {/* TMDB Catalog Browser: add movies & shows from TMDB */}
      <TmdbBrowseModal
        isOpen={isTmdbBrowseOpen}
        onClose={() => setIsTmdbBrowseOpen(false)}
        onImported={handleTmdbImported}
        catalogTmdbIds={catalogTmdbIds}
      />

      {tmdbRemovalStatus && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm font-semibold shadow-xl ${
            tmdbRemovalStatus.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-950/90 text-emerald-200'
              : 'border-rose-500/40 bg-rose-950/90 text-rose-200'
          }`}
        >
          {tmdbRemovalStatus.message}
        </div>
      )}
    </div>
  );
}
