import React, { useState, useEffect, useMemo } from 'react';
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
import { BingecatSyncModal } from './components/BingecatSyncModal';
import { TmdbSyncModal } from './components/TmdbSyncModal';
import { TmdbBrowseModal } from './components/TmdbBrowseModal';
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
} from 'lucide-react';

const GENRE_LIST = [
  'All Genres',
  'Sci-Fi',
  'Drama',
  'Thriller',
  'Dark Comedy',
  'Crime',
  'Mystery',
  'Fantasy',
  'Action',
  'Historical',
  'Espionage',
];

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
  const [isBingecatModalOpen, setIsBingecatModalOpen] = useState<boolean>(false);
  const [isTmdbModalOpen, setIsTmdbModalOpen] = useState<boolean>(false);
  const [isTmdbBrowseOpen, setIsTmdbBrowseOpen] = useState<boolean>(false);

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
    try {
      localStorage.setItem('streampulse_watchlist', JSON.stringify(watchlist));
      // Sync with server backend for Bingecat Addon catalog
      fetch('/api/watchlist/sync', {
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
          fetch('/api/providers'),
          fetch('/api/series')
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

  const handleToggleWatchlist = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWatchlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleTmdbImported = (series: Series, addToWatchlist: boolean) => {
    setSeriesList((prev) => {
      const existing = prev.findIndex((s) => s.id === series.id);
      if (existing < 0) return [series, ...prev];
      const next = [...prev];
      next[existing] = series;
      return next;
    });
    if (addToWatchlist) {
      setWatchlist((prev) => (prev.includes(series.id) ? prev : [...prev, series.id]));
    }
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

  // Categorized counts
  const categoryCounts = useMemo(() => {
    const upcoming = seriesList.filter((s) => s.isUpcoming || (s.nextSeasonDaysLeft !== undefined && s.nextSeasonDaysLeft <= 180)).length;
    const newSeasons = seriesList.filter((s) => s.hasNewSeasonAlert || ['season_upcoming', 'renewed', 'in_production', 'final_season_upcoming'].includes(s.renewalState)).length;
    return {
      upcoming,
      newSeasons,
      total: seriesList.length,
    };
  }, [seriesList]);

  // Filtered series list based on active options
  const filteredSeries = useMemo(() => {
    let list = [...seriesList];

    // Category Filter
    if (activeCategory === 'now_playing') {
      list = list.filter((s) => s.isNowPlaying);
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
  }, [seriesList, activeCategory, selectedProvider, selectedGenre, searchQuery, sortBy, watchlist]);

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
        onOpenBingecatModal={() => setIsBingecatModalOpen(true)}
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
            {GENRE_LIST.map((genre) => {
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
            watchlistedSeries={watchlistedSeriesObjects}
            watchlistIds={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectSeries={handleOpenDetail}
            onBrowseMore={() => setActiveCategory('now_playing')}
            onOpenBingecatModal={() => setIsBingecatModalOpen(true)}
            onOpenTmdbModal={() => setIsTmdbModalOpen(true)}
          />
        ) : (
          /* DEFAULT: NOW PLAYING / STANDARD BROWSER */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-400" />
                  <span>Now Streaming Series ({filteredSeries.length})</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Currently active, returning, and acclaimed series across major platforms
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
                    onToggleWatchlist={handleToggleWatchlist}
                    onSelect={handleOpenDetail}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-zinc-900/40 rounded-3xl border border-zinc-800 space-y-3">
                <Search className="w-8 h-8 text-zinc-500 mx-auto" />
                <h3 className="text-base font-bold text-white">No Series Found</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  No series match your current filter combination. Try clearing filters or searching for another title.
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
      />

      {/* Android PWA & QR Code Modal */}
      <AndroidPwaModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />

      {/* Bingecat Addon & Sync Modal */}
      <BingecatSyncModal
        isOpen={isBingecatModalOpen}
        onClose={() => setIsBingecatModalOpen(false)}
        watchlistCount={watchlist.length}
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
    </div>
  );
}
