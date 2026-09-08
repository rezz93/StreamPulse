import React from 'react';
import { Clapperboard, Search, Bookmark, Sparkles, Flame, Calendar, Film, Tv, Puzzle } from 'lucide-react';
import { SeriesCategory } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenLiveSearch: () => void;
  onOpenAndroidModal: () => void;
  onOpenNuvioModal: () => void;
  activeCategory: SeriesCategory;
  onSelectCategory: (category: SeriesCategory) => void;
  watchlistCount: number;
  totalCount: number;
  theatersCount: number;
  moviesCount: number;
  seriesCount: number;
  upcomingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenLiveSearch,
  onOpenAndroidModal,
  onOpenNuvioModal,
  activeCategory,
  onSelectCategory,
  watchlistCount,
  totalCount,
  theatersCount,
  moviesCount,
  seriesCount,
  upcomingCount,
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md ring-2 ring-amber-500/30">
                <Clapperboard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                    StreamPulse
                  </h1>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[10px] font-extrabold text-amber-300 border border-amber-500/30">
                    CINEMA & STREAMING RADAR
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-medium">
                  In Theaters, Streaming Movies & Premier Series
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
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-white">{theatersCount}</span>
              <span className="text-amber-200/80">In Theaters</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-zinc-300">
              <Film className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-semibold text-white">{moviesCount}</span>
              <span className="text-zinc-400">Movies</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-zinc-300">
              <Tv className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-white">{seriesCount}</span>
              <span className="text-zinc-400">Series</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-zinc-300">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-white">{upcomingCount}</span>
              <span className="text-zinc-400">Upcoming</span>
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
                placeholder="Search movies, series, directors, cast..."
                className="w-full bg-zinc-900/90 border border-zinc-800 text-zinc-200 placeholder-zinc-500 rounded-xl pl-9.5 pr-4 py-2 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
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

            {/* Global Live Movies & TV Finder button */}
            <button
              id="btn-global-lookup"
              onClick={onOpenLiveSearch}
              title="Search old and new series & movies"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-700/60 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Find Any Title</span>
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

            {/* Nuvio & Stremio Addon button */}
            <button
              id="btn-nuvio-addon"
              onClick={onOpenNuvioModal}
              title="Install StreamPulse Addon into Nuvio or Stremio"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Puzzle className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Nuvio Addon</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
