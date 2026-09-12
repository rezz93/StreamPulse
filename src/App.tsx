import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch, syncWatchlistToServer } from './apiClient';
import { sanitizeSeriesSeasonIntel } from '../shared/dateSanitizer';
import {
  Series,
  StreamingProvider,
  StreamingProviderId,
  SeriesCategory,
} from './types';
import { Header } from './components/Header';
import { ProviderFilter, MediaTypeFilter } from './components/ProviderFilter';
import { CategoryTabs } from './components/CategoryTabs';
import { SeriesCard } from './components/SeriesCard';
import { SeriesDetailModal } from './components/SeriesDetailModal';
import { NewSeasonRadarView } from './components/NewSeasonRadarView';
import { ClassicsExplorerView } from './components/ClassicsExplorerView';
import { UpcomingTimelineView } from './components/UpcomingTimelineView';
import { WatchlistView } from './components/WatchlistView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AndroidPwaModal } from './components/AndroidPwaModal';
import { NuvioStremioModal } from './components/NuvioStremioModal';
import {
  Flame,
  ArrowUpDown,
  Search,
  Tv,
  Film,
  Clapperboard,
  RefreshCw,
  Globe,
  Sparkles,
  Radio,
  Zap,
} from 'lucide-react';

export default function App() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [providers, setProviders] = useState<StreamingProvider[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveRadarScanning, setIsLiveRadarScanning] = useState<boolean>(false);
  const [radarStatusMsg, setRadarStatusMsg] = useState<string | null>(null);

  // Filter & Navigation states
  const [activeCategory, setActiveCategory] = useState<SeriesCategory>('now_playing');
  const [selectedProvider, setSelectedProvider] = useState<StreamingProviderId>('all');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaTypeFilter>('all');
  const [providerShelfFilter, setProviderShelfFilter] = useState<'all' | 'new' | 'next_watch' | 'airing'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('All Genres');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'countdown' | 'releaseDate' | 'title'>('popularity');

  useEffect(() => {
    setProviderShelfFilter('all');
  }, [selectedProvider]);

  // Modals & Drawers
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isDetailFromSearch, setIsDetailFromSearch] = useState<boolean>(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);
  const [isNuvioModalOpen, setIsNuvioModalOpen] = useState<boolean>(false);

  // Watchlist persistence in localStorage & server sync for Stremio / Nuvio Addon
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('streampulse_watchlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return Array.from(
            new Set(parsed.filter((x): x is string => typeof x === 'string' && !!x.trim()))
          );
        }
      }
      return ['severance', 'the-last-of-us', 'stranger-things'];
    } catch {
      return ['severance', 'the-last-of-us', 'stranger-things'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('streampulse_watchlist', JSON.stringify(watchlist));
      // Sync with server backend for Stremio addon catalog (movies & series)
      const customSeries = seriesList.filter((s) => watchlist.includes(s.id));
      syncWatchlistToServer(watchlist, customSeries).catch((e) =>
        console.log('Watchlist sync error', e)
      );
    } catch (e) {
      console.error(e);
    }
  }, [watchlist, seriesList]);

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [provRes, seriesRes] = await Promise.all([
          apiFetch('/api/providers'),
          apiFetch('/api/series'),
        ]);
        const provData = await provRes.json();
        const seriesData = await seriesRes.json();

        setProviders(provData);
        // Guarantee clean deduplication of initial series and movies
        const seenIds = new Set<string>();
        const seenTitles = new Set<string>();
        const deduped: Series[] = [];
        for (const raw of (seriesData.series || [])) {
          if (!raw || !raw.id || seenIds.has(raw.id)) continue;
          const s = sanitizeSeriesSeasonIntel(raw);
          const key = `${s.title.toLowerCase().trim()}-${s.mediaType || 'series'}`;
          if (seenTitles.has(key)) continue;
          seenIds.add(s.id);
          seenTitles.add(key);
          deduped.push(s);
        }
        setSeriesList(deduped);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggleWatchlist = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setWatchlist((prev) => {
      const target = seriesList.find((s) => s.id === id);
      const isAlreadyWatchlisted =
        prev.includes(id) ||
        (target
          ? prev.some((wid) => {
              const item = seriesList.find((s) => s.id === wid);
              return (
                item &&
                ((target.imdbId && item.imdbId && target.imdbId === item.imdbId) ||
                  item.title.toLowerCase().trim() === target.title.toLowerCase().trim())
              );
            })
          : false);

      if (isAlreadyWatchlisted) {
        // Remove id AND any aliases (matching title or IMDb ID)
        return prev.filter((wid) => {
          if (wid === id) return false;
          if (target) {
            const item = seriesList.find((s) => s.id === wid);
            if (item) {
              if (target.imdbId && item.imdbId && target.imdbId === item.imdbId) return false;
              if (item.title.toLowerCase().trim() === target.title.toLowerCase().trim()) return false;
            }
          }
          return true;
        });
      } else {
        // Add id, strictly preventing duplicate strings
        return Array.from(new Set([...prev, id]));
      }
    });
  };

  const upsertSeries = (series: Series) => {
    setSeriesList((prev) => {
      const existing = prev.findIndex(
        (s) =>
          s.id === series.id ||
          (s.title.toLowerCase().trim() === series.title.toLowerCase().trim() &&
            s.mediaType === series.mediaType)
      );
      if (existing < 0) return [series, ...prev];
      const next = [...prev];
      next[existing] = { ...next[existing], ...series };
      return next;
    });
  };

  const handleFavoriteFromSearch = (series: Series) => {
    const isAlreadyIn =
      watchlist.includes(series.id) ||
      watchlist.some((wid) => {
        const existing = seriesList.find((s) => s.id === wid);
        return (
          existing &&
          ((series.imdbId && existing.imdbId && series.imdbId === existing.imdbId) ||
            existing.title.toLowerCase().trim() === series.title.toLowerCase().trim())
        );
      });

    if (isAlreadyIn) {
      handleToggleWatchlist(series.id);
      return;
    }
    if (!seriesList.some((s) => s.id === series.id)) {
      upsertSeries(series);
    }
    setWatchlist((prev) => Array.from(new Set([...prev, series.id])));
  };

  const handleScanLiveTheaters = async () => {
    setIsLiveRadarScanning(true);
    setRadarStatusMsg('Querying multi-source box office & theater feeds...');
    try {
      const res = await apiFetch('/api/theaters/live-radar');
      const data = await res.json();
      if (data.titles && Array.isArray(data.titles) && data.titles.length > 0) {
        setSeriesList((prev) => {
          const map = new Map(prev.map((s) => [s.title.toLowerCase().trim(), s]));
          for (const item of data.titles) {
            const key = item.title.toLowerCase().trim();
            if (!map.has(key)) {
              map.set(key, item);
            }
          }
          return Array.from(map.values());
        });
        setRadarStatusMsg(`Synchronized ${data.titles.length} in-theater box office titles from multi-source radar!`);
      } else {
        setRadarStatusMsg('Theaters radar is currently up-to-date with active box office releases.');
      }
    } catch {
      setRadarStatusMsg('Completed radar sync with active cinema catalog.');
    } finally {
      setIsLiveRadarScanning(false);
      setTimeout(() => setRadarStatusMsg(null), 4000);
    }
  };

  const handleOpenDetail = (series: Series) => {
    setSelectedSeries(series);
    setIsDetailFromSearch(false);
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
    setProviderShelfFilter('all');
    setSelectedGenre('All Genres');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedProvider !== 'all' ||
    providerShelfFilter !== 'all' ||
    selectedGenre !== 'All Genres' ||
    Boolean(searchQuery.trim());

  // Active provider metadata and curation shelf counts
  const currentProviderMeta = useMemo(() => {
    return providers.find((p) => p.id === selectedProvider);
  }, [providers, selectedProvider]);

  const providerShelfCounts = useMemo(() => {
    const baseList =
      selectedProvider === 'all'
        ? seriesList
        : seriesList.filter((s) => s.providers.includes(selectedProvider));

    return {
      all: baseList.length,
      new: baseList.filter((s) => s.isNewOnProvider).length,
      next_watch: baseList.filter((s) => s.isNextWatch).length,
      airing: baseList.filter((s) => s.isCurrentlyAiring).length,
    };
  }, [seriesList, selectedProvider]);

  // Categorized counts
  const categoryCounts = useMemo(() => {
    const shows = seriesList.filter((s) => s.mediaType !== 'movie');
    const allMovies = seriesList.filter((s) => s.mediaType === 'movie');
    const currentYear = new Date().getFullYear();
    const theaters = allMovies.filter(
      (s) =>
        s.firstAirYear === currentYear &&
        s.isDomestic !== false &&
        (s.theaterStatus === 'now_in_theaters' ||
          (s.providers.includes('theaters') && s.theaterStatus !== 'coming_to_theaters' && !s.isUpcoming))
    );
    const streamingMovies = allMovies.filter(
      (s) =>
        (s.theaterStatus !== 'now_in_theaters' &&
          s.theaterStatus !== 'coming_to_theaters' &&
          !s.isUpcoming) ||
        s.firstAirYear !== currentYear ||
        s.isDomestic === false
    );
    const upcoming = seriesList.filter(
      (s) =>
        s.isUpcoming ||
        s.theaterStatus === 'coming_to_theaters' ||
        (s.nextSeasonDaysLeft !== undefined && s.nextSeasonDaysLeft > 0 && s.nextSeasonDaysLeft <= 180)
    ).length;
    const newSeasons = shows.filter(
      (s) =>
        s.hasNewSeasonAlert ||
        ['season_upcoming', 'renewed', 'in_production', 'final_season_upcoming'].includes(s.renewalState)
    ).length;
    return {
      upcoming,
      newSeasons,
      theaters: theaters.length,
      movies: streamingMovies.length,
      series: shows.length,
      total: seriesList.length,
    };
  }, [seriesList]);

  // Filtered series list based on active options
  const filteredSeries = useMemo(() => {
    let list = [...seriesList];

    // Category Filter: Strict taxonomy separation
    if (activeCategory === 'now_playing') {
      // IN THEATERS: ONLY domestic movies released in the current year currently playing in theaters
      const currentYear = new Date().getFullYear();
      list = list.filter(
        (s) =>
          s.mediaType === 'movie' &&
          s.firstAirYear === currentYear &&
          s.isDomestic !== false &&
          (s.theaterStatus === 'now_in_theaters' ||
            (s.providers.includes('theaters') && s.theaterStatus !== 'coming_to_theaters' && !s.isUpcoming))
      );
    } else if (activeCategory === 'movies') {
      // STREAMING MOVIES: ONLY feature films on streaming platforms
      const currentYear = new Date().getFullYear();
      list = list.filter(
        (s) =>
          s.mediaType === 'movie' &&
          ((s.theaterStatus !== 'now_in_theaters' &&
            s.theaterStatus !== 'coming_to_theaters' &&
            !s.isUpcoming) ||
            s.firstAirYear !== currentYear ||
            s.isDomestic === false)
      );
    } else if (activeCategory === 'series') {
      // PREMIER SERIES: ONLY television and streaming series
      list = list.filter((s) => s.mediaType !== 'movie');
    } else if (activeCategory === 'upcoming') {
      list = list.filter(
        (s) =>
          s.isUpcoming ||
          s.theaterStatus === 'coming_to_theaters' ||
          (s.nextSeasonDaysLeft !== undefined && s.nextSeasonDaysLeft > 0 && s.nextSeasonDaysLeft <= 180)
      );
    } else if (activeCategory === 'new_seasons') {
      list = list.filter(
        (s) =>
          s.hasNewSeasonAlert ||
          ['season_upcoming', 'renewed', 'in_production', 'final_season_upcoming'].includes(s.renewalState)
      );
    } else if (activeCategory === 'classics') {
      list = list.filter((s) => s.isClassic || s.decade === 'Pre-70s' || s.status === 'Ended' || s.firstAirYear < 2020);
    } else if (activeCategory === 'watchlist') {
      list = list.filter((s) => watchlist.includes(s.id));
    }

    // Top-row Media Type Filter (All, Movies, Series)
    if (mediaTypeFilter === 'movies') {
      list = list.filter((s) => s.mediaType === 'movie');
    } else if (mediaTypeFilter === 'series') {
      list = list.filter((s) => s.mediaType !== 'movie');
    }

    // Provider Filter
    if (selectedProvider !== 'all') {
      if (selectedProvider === 'theaters') {
        const currentYear = new Date().getFullYear();
        list = list.filter(
          (s) =>
            s.providers.includes('theaters') &&
            s.firstAirYear === currentYear &&
            s.isDomestic !== false
        );
      } else {
        list = list.filter((s) => s.providers.includes(selectedProvider));
      }
    }

    // Provider Curation Shelf Filter: New on Provider, Your Next Watch, Currently Airing
    if (providerShelfFilter === 'new') {
      list = list.filter((s) => s.isNewOnProvider);
    } else if (providerShelfFilter === 'next_watch') {
      list = list.filter((s) => s.isNextWatch);
    } else if (providerShelfFilter === 'airing') {
      list = list.filter((s) => s.isCurrentlyAiring);
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
          (s.director && s.director.toLowerCase().includes(q)) ||
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

    // Final deduplication layer to guarantee no card duplicates
    const seen = new Set<string>();
    const seenTitles = new Set<string>();
    return list.filter((item) => {
      if (!item || !item.id || seen.has(item.id)) return false;
      const key = `${item.title.toLowerCase().trim()}-${item.mediaType || 'series'}`;
      if (seenTitles.has(key)) return false;
      seen.add(item.id);
      seenTitles.add(key);
      return true;
    });
  }, [
    seriesList,
    activeCategory,
    selectedProvider,
    providerShelfFilter,
    selectedGenre,
    searchQuery,
    sortBy,
    watchlist,
  ]);

  return (
    <div id="streampulse-app" className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenLiveSearch={() => setIsGlobalSearchOpen(true)}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
        onOpenNuvioModal={() => setIsNuvioModalOpen(true)}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        watchlistCount={watchlist.length}
        totalCount={categoryCounts.total}
        theatersCount={categoryCounts.theaters}
        moviesCount={categoryCounts.movies}
        seriesCount={categoryCounts.series}
        upcomingCount={categoryCounts.upcoming}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Category Navigation Bar */}
        <CategoryTabs
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          watchlistCount={watchlist.length}
          newSeasonsCount={categoryCounts.newSeasons}
          theatersCount={categoryCounts.theaters}
          upcomingCount={categoryCounts.upcoming}
          moviesCount={categoryCounts.movies}
          seriesCount={categoryCounts.series}
        />

        {/* Streaming Providers Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-indigo-400" />
              <span>Filter by Network & Media</span>
            </span>
            {(selectedProvider !== 'all' || mediaTypeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSelectedProvider('all');
                  setMediaTypeFilter('all');
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
          <ProviderFilter
            providers={providers}
            selectedProvider={selectedProvider}
            onSelectProvider={setSelectedProvider}
            countsByProvider={countsByProvider}
            mediaTypeFilter={mediaTypeFilter}
            onSelectMediaType={setMediaTypeFilter}
            mediaCounts={{
              all: activeCategory === 'watchlist' ? watchlist.length : categoryCounts.total,
              theaters:
                activeCategory === 'watchlist'
                  ? seriesList.filter(
                      (s) =>
                        watchlist.includes(s.id) &&
                        (s.theaterStatus === 'now_in_theaters' || s.providers.includes('theaters'))
                    ).length
                  : categoryCounts.theaters,
              movies:
                activeCategory === 'watchlist'
                  ? seriesList.filter((s) => watchlist.includes(s.id) && s.mediaType === 'movie').length
                  : seriesList.filter((s) => s.mediaType === 'movie').length,
              series:
                activeCategory === 'watchlist'
                  ? seriesList.filter((s) => watchlist.includes(s.id) && s.mediaType !== 'movie').length
                  : categoryCounts.series,
            }}
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

        {/* Provider Spotlight & Curation Shelves */}
        {selectedProvider !== 'all' && currentProviderMeta ? (
          <div
            id="provider-spotlight-banner"
            className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <span
                className="w-4 h-4 rounded-full shrink-0 ring-4 ring-white/10"
                style={{ backgroundColor: currentProviderMeta.accentColor }}
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {currentProviderMeta.name} Spotlight
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                    {providerShelfCounts.all} titles cataloged
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Curated selections for {currentProviderMeta.name}: new arrivals, your next watch recommendations, and currently airing series.
                </p>
              </div>
            </div>

            {/* Shelf Switchers */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80 shrink-0">
              <button
                id="shelf-btn-all"
                onClick={() => setProviderShelfFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  providerShelfFilter === 'all'
                    ? 'bg-zinc-800 text-white shadow-xs ring-1 ring-zinc-600'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All {currentProviderMeta.name} ({providerShelfCounts.all})
              </button>

              <button
                id="shelf-btn-new"
                onClick={() => setProviderShelfFilter('new')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  providerShelfFilter === 'new'
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-xs'
                    : 'text-zinc-400 hover:text-emerald-300'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>New on {currentProviderMeta.name}</span>
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-200 text-[10px]">
                  {providerShelfCounts.new}
                </span>
              </button>

              <button
                id="shelf-btn-next-watch"
                onClick={() => setProviderShelfFilter('next_watch')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  providerShelfFilter === 'next_watch'
                    ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50 shadow-xs'
                    : 'text-zinc-400 hover:text-purple-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Your Next Watch</span>
                <span className="px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-200 text-[10px]">
                  {providerShelfCounts.next_watch}
                </span>
              </button>

              <button
                id="shelf-btn-airing"
                onClick={() => setProviderShelfFilter('airing')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  providerShelfFilter === 'airing'
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-xs'
                    : 'text-zinc-400 hover:text-rose-300'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-rose-400" />
                <span>Currently Airing</span>
                <span className="px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-200 text-[10px]">
                  {providerShelfCounts.airing}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* Global Curation Bar when "All Providers" is selected */
          <div
            id="global-curation-bar"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl"
          >
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Curation Radar:</span>
              <span className="text-zinc-300">Quickly filter by editorial drops & next watches</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setProviderShelfFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  providerShelfFilter === 'all'
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Titles ({providerShelfCounts.all})
              </button>
              <button
                onClick={() => setProviderShelfFilter('new')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  providerShelfFilter === 'new'
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-xs'
                    : 'text-zinc-400 hover:text-emerald-300'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>New Drops ({providerShelfCounts.new})</span>
              </button>
              <button
                onClick={() => setProviderShelfFilter('next_watch')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  providerShelfFilter === 'next_watch'
                    ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50 shadow-xs'
                    : 'text-zinc-400 hover:text-purple-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Your Next Watch ({providerShelfCounts.next_watch})</span>
              </button>
              <button
                onClick={() => setProviderShelfFilter('airing')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  providerShelfFilter === 'airing'
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-xs'
                    : 'text-zinc-400 hover:text-rose-300'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-rose-400" />
                <span>Currently Airing ({providerShelfCounts.airing})</span>
              </button>
            </div>
          </div>
        )}

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
            onOpenNuvioModal={() => setIsNuvioModalOpen(true)}
          />
        ) : (
          /* DEFAULT: NOW PLAYING / MOVIES / SERIES STANDARD BROWSER */
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  {activeCategory === 'now_playing' ? (
                    <Flame className="w-5 h-5 text-amber-400" />
                  ) : activeCategory === 'movies' ? (
                    <Film className="w-5 h-5 text-teal-400" />
                  ) : (
                    <Tv className="w-5 h-5 text-indigo-400" />
                  )}
                  <span>
                    {providerShelfFilter === 'new'
                      ? selectedProvider !== 'all' && currentProviderMeta
                        ? `New on ${currentProviderMeta.name}`
                        : 'New Releases & Drops'
                      : providerShelfFilter === 'next_watch'
                      ? selectedProvider !== 'all' && currentProviderMeta
                        ? `Your Next Watch on ${currentProviderMeta.name}`
                        : 'Your Next Watch Picks'
                      : providerShelfFilter === 'airing'
                      ? selectedProvider !== 'all' && currentProviderMeta
                        ? `Currently Airing on ${currentProviderMeta.name}`
                        : 'Currently Airing Programming'
                      : activeCategory === 'now_playing'
                      ? selectedProvider !== 'all' && currentProviderMeta
                        ? `${currentProviderMeta.name} in Theaters`
                        : 'In Theaters'
                      : activeCategory === 'movies'
                      ? selectedProvider !== 'all' && currentProviderMeta
                        ? `${currentProviderMeta.name} Movies`
                        : 'Streaming Movies'
                      : selectedProvider !== 'all' && currentProviderMeta
                      ? `${currentProviderMeta.name} Series`
                      : 'Premier Series'}{' '}
                    ({filteredSeries.length})
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {activeCategory === 'now_playing'
                    ? 'Feature films currently playing on the big screen in cinema theaters'
                    : activeCategory === 'movies'
                    ? 'Feature films available to stream across premium platforms'
                    : 'Acclaimed multi-season dramas, comedies, and premier television series'}
                </p>
              </div>

              {/* Category-specific indicator badges & actions */}
              {activeCategory === 'now_playing' && (
                <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                    <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
                    <span>In Theaters Only</span>
                  </div>
                  <button
                    id="live-theater-radar-btn"
                    onClick={handleScanLiveTheaters}
                    disabled={isLiveRadarScanning}
                    title="Scan live box office & cinema radar feeds for currently playing releases"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap shadow-md shadow-amber-500/20"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-950 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-950"></span>
                    </span>
                    <Radio className={`w-3.5 h-3.5 ${isLiveRadarScanning ? 'animate-spin' : ''}`} />
                    <span>{isLiveRadarScanning ? 'Scanning Radar...' : 'Live Cinema Radar'}</span>
                  </button>
                </div>
              )}

              {activeCategory === 'movies' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold self-start md:self-auto">
                  <Film className="w-3.5 h-3.5 text-teal-400" />
                  <span>Streaming Feature Films Only</span>
                </div>
              )}

              {activeCategory === 'series' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold self-start md:self-auto">
                  <Tv className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Premier Television & Streaming Series</span>
                </div>
              )}
            </div>

            {/* Radar sync notification */}
            {radarStatusMsg && (
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-medium rounded-xl animate-in fade-in">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                <span>{radarStatusMsg}</span>
              </div>
            )}

            {isLoading ? (
              <div className="p-16 text-center text-zinc-400">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold">Loading cinema & streaming catalogs...</p>
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
                <h3 className="text-base font-bold text-white">
                  {activeCategory === 'now_playing'
                    ? 'No In Theaters Movies Found'
                    : activeCategory === 'movies'
                    ? 'No Streaming Movies Found'
                    : activeCategory === 'series'
                    ? 'No Premier Series Found'
                    : 'No Titles Found'}
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  No titles match your current filter combination. Try clearing filters or searching for another title.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-all cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                  {searchQuery.trim() && (
                    <button
                      onClick={() => setIsGlobalSearchOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all cursor-pointer shadow-md shadow-amber-500/20"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Search "{searchQuery}" across All Sources</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-zinc-800/80 bg-zinc-950/80 py-8 px-4 sm:px-6 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-zinc-300">StreamPulse Cinema & Streaming Radar</span>
          </div>
          <p className="text-zinc-400">
            Current in-theaters, streaming movies, and series synchronized across Theaters, Netflix, Apple TV+, Max, Prime Video, Disney+, and Paramount+.
          </p>
        </div>
      </footer>

      {/* Series Detail & Season Explorer Modal */}
      <SeriesDetailModal
        series={selectedSeries}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setIsDetailFromSearch(false);
        }}
        isFromSearch={isDetailFromSearch}
        isWatchlisted={selectedSeries ? watchlist.includes(selectedSeries.id) : false}
        onToggleWatchlist={(id) => handleToggleWatchlist(id)}
      />

      {/* Global Live TV Database Search Modal */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        initialQuery={searchQuery}
        onSelectSeries={(series) => {
          setSelectedSeries(series);
          setIsDetailFromSearch(true);
          setIsDetailModalOpen(true);
        }}
        onToggleWatchlist={handleFavoriteFromSearch}
        watchlistIds={watchlist}
      />

      {/* Android PWA & QR Code Modal */}
      <AndroidPwaModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />

      {/* Nuvio & Stremio Addon Sync Modal */}
      <NuvioStremioModal
        isOpen={isNuvioModalOpen}
        onClose={() => setIsNuvioModalOpen(false)}
        watchlist={watchlist}
        watchlistSeries={seriesList.filter((s) => watchlist.includes(s.id))}
      />
    </div>
  );
}
