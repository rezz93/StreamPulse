import React from 'react';
import { Series } from '../types';
import { SeriesCard } from './SeriesCard';
import { Calendar, Clock, Sparkles, Bell } from 'lucide-react';

interface UpcomingTimelineViewProps {
  series: Series[];
  watchlist: string[];
  onToggleWatchlist: (id: string, e: React.MouseEvent) => void;
  onSelectSeries: (series: Series) => void;
}

export const UpcomingTimelineView: React.FC<UpcomingTimelineViewProps> = ({
  series,
  watchlist,
  onToggleWatchlist,
  onSelectSeries,
}) => {
  // Sort series strictly by countdown days
  const sortedUpcoming = [...series].sort(
    (a, b) => (a.nextSeasonDaysLeft ?? 9999) - (b.nextSeasonDaysLeft ?? 9999)
  );

  return (
    <div id="upcoming-timeline-view" className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-950/50 via-zinc-900 to-zinc-900 border border-indigo-500/30 rounded-3xl p-5 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>PREMIERE SCHEDULE & COUNTDOWNS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Upcoming Series & Returning Seasons Calendar
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
              Track the exact release schedule and countdown timers for new seasons and series arriving in the coming weeks and months.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-zinc-950/80 border border-indigo-500/30 px-4 py-3 rounded-2xl text-center">
              <div className="text-2xl font-black text-indigo-400">{sortedUpcoming.length}</div>
              <div className="text-[11px] font-semibold text-zinc-400 mt-0.5">Premieres Tracked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Premiere Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Chronological Countdown Feed</span>
          </h3>
          <span className="text-xs text-zinc-400 font-medium">Sorted by earliest premiere date</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {sortedUpcoming.map((s) => (
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
    </div>
  );
};
