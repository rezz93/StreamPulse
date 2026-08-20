import React from 'react';
import { Series } from '../types';
import { SeriesCard } from './SeriesCard';
import { Sparkles, BellRing, Film, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface NewSeasonRadarViewProps {
  series: Series[];
  watchlist: string[];
  onToggleWatchlist: (id: string, e: React.MouseEvent) => void;
  onSelectSeries: (series: Series) => void;
}

export const NewSeasonRadarView: React.FC<NewSeasonRadarViewProps> = ({
  series,
  watchlist,
  onToggleWatchlist,
  onSelectSeries,
}) => {
  // Filter and group by renewal states
  const premieringSoon = series.filter(
    (s) => s.renewalState === 'season_upcoming' || s.renewalState === 'final_season_upcoming'
  );
  const renewedAndFilming = series.filter(
    (s) => s.renewalState === 'renewed' || s.renewalState === 'in_production'
  );
  const otherRadar = series.filter(
    (s) => !premieringSoon.includes(s) && !renewedAndFilming.includes(s) && s.hasNewSeasonAlert
  );

  return (
    <div id="new-season-radar-view" className="space-y-8 animate-in fade-in duration-200">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-indigo-950/30 to-zinc-900 border border-amber-500/20 rounded-3xl p-5 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NEW SEASONS & RENEWAL RADAR</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Tracking New Seasons, Air Dates & Production Reports
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
              Stay ahead with verified renewal confirmations, return countdowns, and behind-the-scenes filming updates across all premier streaming networks.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-zinc-950/80 border border-amber-500/30 p-3.5 rounded-2xl text-center">
              <div className="text-2xl font-extrabold text-amber-300">{premieringSoon.length}</div>
              <div className="text-[11px] font-semibold text-zinc-400 mt-0.5">Premieres Ready</div>
            </div>
            <div className="bg-zinc-950/80 border border-indigo-500/30 p-3.5 rounded-2xl text-center">
              <div className="text-2xl font-extrabold text-indigo-300">{renewedAndFilming.length}</div>
              <div className="text-[11px] font-semibold text-zinc-400 mt-0.5">Renewed / Filming</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Premiering Soon / Countdown Set */}
      {premieringSoon.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Upcoming Season Premieres with Scheduled Dates
              </h3>
            </div>
            <span className="text-xs font-semibold text-zinc-400">{premieringSoon.length} shows</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {premieringSoon.map((s) => (
              <SeriesCard
                key={s.id}
                series={s}
                isWatchlisted={watchlist.includes(s.id)}
                onToggleWatchlist={onToggleWatchlist}
                onSelect={onSelectSeries}
              />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Renewed & Active In Production */}
      {renewedAndFilming.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                <Film className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Officially Renewed & In Production
              </h3>
            </div>
            <span className="text-xs font-semibold text-zinc-400">{renewedAndFilming.length} shows</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {renewedAndFilming.map((s) => (
              <SeriesCard
                key={s.id}
                series={s}
                isWatchlisted={watchlist.includes(s.id)}
                onToggleWatchlist={onToggleWatchlist}
                onSelect={onSelectSeries}
              />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Other Tracked Shows */}
      {otherRadar.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Other Returning & Monitored Series
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {otherRadar.map((s) => (
              <SeriesCard
                key={s.id}
                series={s}
                isWatchlisted={watchlist.includes(s.id)}
                onToggleWatchlist={onToggleWatchlist}
                onSelect={onSelectSeries}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
