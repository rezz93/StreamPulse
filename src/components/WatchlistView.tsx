import React from 'react';
import { Series } from '../types';
import { SeriesCard } from './SeriesCard';
import { Bookmark, Bell, ArrowRight, RefreshCw, SlidersHorizontal } from 'lucide-react';

interface WatchlistViewProps {
  watchlistedSeries: Series[];
  watchlistIds: string[];
  totalWatchlistCount: number;
  hasActiveFilters: boolean;
  onToggleWatchlist: (id: string, e: React.MouseEvent) => void;
  onSelectSeries: (series: Series) => void;
  onBrowseMore: () => void;
  onClearFilters: () => void;
  onOpenTmdbModal?: () => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  watchlistedSeries,
  watchlistIds,
  totalWatchlistCount,
  hasActiveFilters,
  onToggleWatchlist,
  onSelectSeries,
  onBrowseMore,
  onClearFilters,
  onOpenTmdbModal,
}) => {
  const showsWithNewSeasons = watchlistedSeries.filter(
    (s) => s.hasNewSeasonAlert || ['season_upcoming', 'renewed', 'in_production', 'final_season_upcoming'].includes(s.renewalState)
  );

  return (
    <div id="watchlist-view" className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/20 rounded-3xl p-5 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Bookmark className="w-3.5 h-3.5" />
                <span>MY PERSONAL TRACKER</span>
              </div>
              {onOpenTmdbModal && (
                <button
                  onClick={onOpenTmdbModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3 h-3 text-teal-400" />
                  <span>Sync with TMDB</span>
                </button>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              My Watchlist & Season Alerts
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
              Your saved shows with automated tracking for upcoming season air dates, renewal milestones, and return countdowns.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-zinc-950/80 border border-amber-500/30 px-4 py-3 rounded-2xl text-center">
              <div className="text-2xl font-black text-amber-300">{totalWatchlistCount}</div>
              <div className="text-[11px] font-semibold text-zinc-400 mt-0.5">Saved Series</div>
            </div>
            {showsWithNewSeasons.length > 0 && (
              <div className="bg-zinc-950/80 border border-indigo-500/30 px-4 py-3 rounded-2xl text-center">
                <div className="text-2xl font-black text-indigo-400">{showsWithNewSeasons.length}</div>
                <div className="text-[11px] font-semibold text-zinc-400 mt-0.5">Returning Soon</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shows List */}
      {watchlistedSeries.length > 0 ? (
        <div className="space-y-6">
          {showsWithNewSeasons.length > 0 && (
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-center gap-3 text-xs sm:text-sm text-indigo-200">
              <Bell className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>
                <strong>{showsWithNewSeasons.length} of your tracked shows</strong> have upcoming new seasons or active renewals scheduled!
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {watchlistedSeries.map((s) => (
              <SeriesCard
                key={s.id}
                series={s}
                isWatchlisted={watchlistIds.includes(s.id)}
                onToggleWatchlist={onToggleWatchlist}
                onSelect={onSelectSeries}
              />
            ))}
          </div>
        </div>
      ) : totalWatchlistCount > 0 && hasActiveFilters ? (
        <div className="p-12 text-center bg-zinc-900/40 rounded-3xl border border-zinc-800 space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Saved Titles Match These Filters</h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Your watchlist has {totalWatchlistCount} saved {totalWatchlistCount === 1 ? 'title' : 'titles'}, but none match the current provider, genre, or search filters.
            </p>
          </div>
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all cursor-pointer shadow-md"
          >
            <span>Clear Filters</span>
          </button>
        </div>
      ) : (
        <div className="p-12 text-center bg-zinc-900/40 rounded-3xl border border-zinc-800 space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Your Watchlist is Empty</h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Click the bookmark icon on any series to track release schedules, upcoming season countdowns, and renewal alerts here.
            </p>
          </div>
          <button
            onClick={onBrowseMore}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all cursor-pointer shadow-md"
          >
            <span>Explore Streaming Series</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
