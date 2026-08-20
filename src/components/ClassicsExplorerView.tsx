import React, { useState } from 'react';
import { Series } from '../types';
import { SeriesCard } from './SeriesCard';
import { Archive, Sparkles, Award, History, Clock } from 'lucide-react';

interface ClassicsExplorerViewProps {
  series: Series[];
  watchlist: string[];
  onToggleWatchlist: (id: string, e: React.MouseEvent) => void;
  onSelectSeries: (series: Series) => void;
}

export const ClassicsExplorerView: React.FC<ClassicsExplorerViewProps> = ({
  series,
  watchlist,
  onToggleWatchlist,
  onSelectSeries,
}) => {
  const [selectedDecade, setSelectedDecade] = useState<string>('all');

  const decades: Array<{ id: string; label: string; sub: string }> = [
    { id: 'all', label: 'All Decades', sub: 'Complete Archive' },
    { id: '2010s', label: '2010s Era', sub: 'Peak TV Era' },
    { id: '2000s', label: '2000s Era', sub: 'Golden Age Drama' },
    { id: '90s', label: '1990s', sub: 'Cult & Prestigious' },
    { id: '80s', label: '1980s', sub: 'Sci-Fi & Pioneers' },
    { id: '70s', label: 'Vintage / 70s', sub: 'Classic TV Foundations' },
  ];

  const filtered = selectedDecade === 'all'
    ? series
    : series.filter((s) => s.decade === selectedDecade);

  return (
    <div id="classics-explorer-view" className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-purple-950/30 border border-zinc-700/60 rounded-3xl p-5 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold mb-3">
              <Archive className="w-3.5 h-3.5" />
              <span>TIMELESS & OLDER MASTERPIECES</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Classic Series & Complete Legends
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
              Explore ground-breaking older series across decades, from 90s cult favorites to 2000s Golden Age prestige drama, complete and ready to binge.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-zinc-950/80 border border-zinc-800 p-3 rounded-2xl flex items-center gap-3">
              <Award className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <div className="text-lg font-bold text-white">Top Rated</div>
                <div className="text-xs text-zinc-400">9.0+ IMDb Ratings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decade Selector Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none mt-6 pt-4 border-t border-zinc-800">
          {decades.map((dec) => {
            const isSelected = selectedDecade === dec.id;
            return (
              <button
                key={dec.id}
                id={`decade-btn-${dec.id}`}
                onClick={() => setSelectedDecade(dec.id)}
                className={`flex flex-col items-start px-4 py-2.5 rounded-xl transition-all cursor-pointer border whitespace-nowrap ${
                  isSelected
                    ? 'bg-purple-600/30 border-purple-500 text-white shadow-md ring-1 ring-purple-400/40'
                    : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
                }`}
              >
                <span className="text-xs font-bold">{dec.label}</span>
                <span className="text-[10px] text-zinc-400">{dec.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Classic Series */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-purple-400" />
            <span>
              {selectedDecade === 'all' ? 'All Classic Series' : `${selectedDecade} Archive`} ({filtered.length})
            </span>
          </h3>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((s) => (
              <SeriesCard
                key={s.id}
                series={s}
                isWatchlisted={watchlist.includes(s.id)}
                onToggleWatchlist={onToggleWatchlist}
                onSelect={onSelectSeries}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800">
            <Clock className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-300">No classic titles in this decade category.</p>
            <p className="text-xs text-zinc-500 mt-1">Try selecting 'All Decades' or clearing filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
