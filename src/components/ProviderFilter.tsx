import React from 'react';
import { StreamingProvider, StreamingProviderId } from '../types';
import { LayoutGrid, Clapperboard, Film, Tv } from 'lucide-react';

export type MediaTypeFilter = 'all' | 'movies' | 'series';

interface ProviderFilterProps {
  providers: StreamingProvider[];
  selectedProvider: StreamingProviderId;
  onSelectProvider: (id: StreamingProviderId) => void;
  countsByProvider?: Record<string, number>;
  mediaTypeFilter: MediaTypeFilter;
  onSelectMediaType: (filter: MediaTypeFilter) => void;
  mediaCounts: {
    all: number;
    theaters: number;
    movies: number;
    series: number;
  };
}

export const ProviderFilter: React.FC<ProviderFilterProps> = ({
  providers,
  selectedProvider,
  onSelectProvider,
  countsByProvider = {},
  mediaTypeFilter,
  onSelectMediaType,
  mediaCounts,
}) => {
  // Streaming networks row excludes 'all' and 'theaters', which are in the top row
  const networkProviders = providers.filter((p) => p.id !== 'all' && p.id !== 'theaters');

  return (
    <div id="provider-filter-container" className="w-full space-y-2.5">
      {/* Row 1: All Providers, In Theaters, Movies, Series */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none min-w-max">
        {/* All Providers Button */}
        <button
          key="all"
          id="provider-btn-all"
          onClick={() => {
            onSelectProvider('all');
            onSelectMediaType('all');
          }}
          className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border ${
            selectedProvider === 'all' && mediaTypeFilter === 'all'
              ? 'bg-zinc-800 text-white border-zinc-500 shadow-md ring-1 ring-white/20'
              : 'bg-zinc-900/90 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          <span className="flex items-center gap-1.5 font-semibold">
            <LayoutGrid
              className={`w-3.5 h-3.5 ${
                selectedProvider === 'all' && mediaTypeFilter === 'all'
                  ? 'text-indigo-400'
                  : 'text-zinc-400 group-hover:text-zinc-200'
              }`}
            />
            <span>All Providers</span>
          </span>

          {mediaCounts.all > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                selectedProvider === 'all' && mediaTypeFilter === 'all'
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-300'
              }`}
            >
              {mediaCounts.all}
            </span>
          )}

          {selectedProvider === 'all' && mediaTypeFilter === 'all' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-indigo-500" />
          )}
        </button>

        {/* In Theaters Button */}
        <button
          key="theaters"
          id="provider-btn-theaters"
          onClick={() => {
            onSelectProvider('theaters');
            onSelectMediaType('all');
          }}
          className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border ${
            selectedProvider === 'theaters'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
              : 'bg-zinc-900/90 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          <span className="flex items-center gap-1.5 font-semibold">
            <Clapperboard
              className={`w-3.5 h-3.5 ${
                selectedProvider === 'theaters'
                  ? 'text-amber-400'
                  : 'text-amber-500/80 group-hover:text-amber-400'
              }`}
            />
            <span>In Theaters</span>
          </span>

          {mediaCounts.theaters > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                selectedProvider === 'theaters'
                  ? 'bg-amber-500/30 text-amber-200'
                  : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-300'
              }`}
            >
              {mediaCounts.theaters}
            </span>
          )}

          {selectedProvider === 'theaters' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-amber-500" />
          )}
        </button>

        {/* Movies Button */}
        <button
          key="movies"
          id="filter-btn-movies"
          onClick={() => {
            if (mediaTypeFilter === 'movies' && selectedProvider !== 'theaters') {
              onSelectMediaType('all');
            } else {
              onSelectMediaType('movies');
              if (selectedProvider === 'theaters') onSelectProvider('all');
            }
          }}
          className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border ${
            mediaTypeFilter === 'movies' && selectedProvider !== 'theaters'
              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
              : 'bg-zinc-900/90 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          <span className="flex items-center gap-1.5 font-semibold">
            <Film
              className={`w-3.5 h-3.5 ${
                mediaTypeFilter === 'movies' && selectedProvider !== 'theaters'
                  ? 'text-indigo-400'
                  : 'text-zinc-400 group-hover:text-zinc-200'
              }`}
            />
            <span>Movies</span>
          </span>

          {mediaCounts.movies > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                mediaTypeFilter === 'movies' && selectedProvider !== 'theaters'
                  ? 'bg-indigo-500/30 text-indigo-200'
                  : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-300'
              }`}
            >
              {mediaCounts.movies}
            </span>
          )}

          {mediaTypeFilter === 'movies' && selectedProvider !== 'theaters' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-indigo-500" />
          )}
        </button>

        {/* Series Button */}
        <button
          key="series"
          id="filter-btn-series"
          onClick={() => {
            if (mediaTypeFilter === 'series' && selectedProvider !== 'theaters') {
              onSelectMediaType('all');
            } else {
              onSelectMediaType('series');
              if (selectedProvider === 'theaters') onSelectProvider('all');
            }
          }}
          className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border ${
            mediaTypeFilter === 'series' && selectedProvider !== 'theaters'
              ? 'bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-md ring-1 ring-purple-500/30'
              : 'bg-zinc-900/90 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          <span className="flex items-center gap-1.5 font-semibold">
            <Tv
              className={`w-3.5 h-3.5 ${
                mediaTypeFilter === 'series' && selectedProvider !== 'theaters'
                  ? 'text-purple-400'
                  : 'text-zinc-400 group-hover:text-zinc-200'
              }`}
            />
            <span>Series</span>
          </span>

          {mediaCounts.series > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                mediaTypeFilter === 'series' && selectedProvider !== 'theaters'
                  ? 'bg-purple-500/30 text-purple-200'
                  : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-300'
              }`}
            >
              {mediaCounts.series}
            </span>
          )}

          {mediaTypeFilter === 'series' && selectedProvider !== 'theaters' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-purple-500" />
          )}
        </button>
      </div>

      {/* Row 2: Streaming Networks */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none min-w-max">
        {networkProviders.map((prov) => {
          const isSelected = selectedProvider === prov.id;
          const count = countsByProvider[prov.id];

          return (
            <button
              key={prov.id}
              id={`provider-btn-${prov.id}`}
              onClick={() => onSelectProvider(isSelected ? 'all' : prov.id)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                isSelected
                  ? 'bg-zinc-800 text-white border-zinc-500 shadow-md ring-1 ring-white/20'
                  : 'bg-zinc-900/90 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: prov.accentColor }}
              />

              <span>{prov.name}</span>

              {count !== undefined && count > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    isSelected
                      ? 'bg-zinc-700 text-zinc-100'
                      : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-300'
                  }`}
                >
                  {count}
                </span>
              )}

              {isSelected && (
                <span
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                  style={{ backgroundColor: prov.accentColor || '#6366f1' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
