import React from 'react';
import { Tv, Search, Bookmark, Sparkles, Flame, Calendar, RefreshCw, Plus } from 'lucide-react';
import { SeriesCategory } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenLiveSearch: () => void;
  onOpenAndroidModal: () => void;
  onOpenTmdbModal: () => void;
  onOpenTmdbBrowse: () => void;
  activeCategory: SeriesCategory;
  onSelectCategory: (category: SeriesCategory) => void;
  watchlistCount: number;
  totalSeriesCount: number;
  upcomingCount: number;
  renewalsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenLiveSearch,
  onOpenAndroidModal,
  onOpenTmdbModal,
  onOpenTmdbBrowse,
  activeCategory,
  onSelectCategory,
  watchlistCount,
  totalSeriesCount,
  upcomingCount,
  renewalsCount,
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Brand Logo & Stats */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => onSelectCategory('now_playing')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md ring-2 ring-indigo-500/30">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                    StreamPulse
                  </h1>
                  <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-[10px] font-extrabold text-indigo-300 border border-indigo-500/30">
                    SERIES TRACKER
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-medium">
                  Streaming Series & New Seasons Guide
                </p>
              </div>
            </div>

            {/* Mobile Watchlist Toggle */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                id="btn-mobile-watchlist"
                onClick={() => onSelectCategory('watchlist')}
                className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold ${
                  activeCategory === 'watchlist'
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                {watchlistCount > 0 && <span>{watchlistCount}</span>}
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar (Desktop) */}
          <div className="hidden xl:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-zinc-300">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-semibold text-white">{totalSeriesCount}</span>
              <span className="text-zinc-400">Tracked Shows</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-white">{renewalsCount}</span>
              <span className="text-zinc-400">New Seasons Alert</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-zinc-300">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-white">{upcomingCount}</span>
              <span className="text-zinc-400">Premieres</span>
            </div>
          </div>

          {/* Search Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:justify-end">
            <div className="relative w-full sm:w-64 lg:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Filter this tab by title, cast, genre..."
                className="w-full bg-zinc-900/90 border border-zinc-800 text-zinc-200 placeholder-zinc-500 rounded-xl pl-9.5 pr-4 py-2 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Global Live TV Lookup button */}
            <button
              id="btn-global-lookup"
              onClick={onOpenLiveSearch}
              title="Search TMDB for any movie or series"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-indigo-300 border border-zinc-700/60 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Find Movies & Series</span>
            </button>

            {/* Add titles from TMDB button */}
            <button
              id="btn-tmdb-browse"
              onClick={onOpenTmdbBrowse}
              title="Search TMDB and add movies or shows to your catalog"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white border border-teal-400/50 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add from TMDB</span>
            </button>

            {/* TMDB Direct Sync button */}
            <button
              id="btn-tmdb-sync"
              onClick={onOpenTmdbModal}
              title="Connect & Sync directly to TMDB (TheMovieDB.org)"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-950/40 hover:bg-teal-900/50 text-teal-300 border border-teal-500/40 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">TMDB Sync</span>
            </button>

            {/* Android PWA QR Code button */}
            <button
              id="btn-android-qr"
              onClick={onOpenAndroidModal}
              title="Scan QR Code to install Android PWA version"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Tv className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Android PWA</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
