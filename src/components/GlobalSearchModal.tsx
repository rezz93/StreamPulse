import React, { useState } from 'react';
import { Series } from '../types';
import { Bookmark, Film, Search, X, Loader2, Tv, Sparkles, Star } from 'lucide-react';
import { liveSearchTitles } from '../tmdbClient';
import { ProviderBadge } from './ProviderBadge';

type MediaFilter = 'multi' | 'tv' | 'movie';

const FILTERS: Array<{ id: MediaFilter; label: string }> = [
  { id: 'multi', label: 'Movies & Series' },
  { id: 'movie', label: 'Movies' },
  { id: 'tv', label: 'Series' },
];

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSeries: (series: Series) => void;
  onToggleWatchlist: (series: Series) => void;
  watchlistIds: string[];
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectSeries,
  onToggleWatchlist,
  watchlistIds,
}) => {
  const [query, setQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('multi');
  const [results, setResults] = useState<Series[]>([]);
  const [source, setSource] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const runSearch = async (searchQuery: string, filter: MediaFilter) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const { results: found, source: from } = await liveSearchTitles(searchQuery, filter);
      setResults(found);
      setSource(from);
    } catch (err) {
      console.error(err);
      setResults([]);
      setSource('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFilter = (filter: MediaFilter) => {
    setMediaFilter(filter);
    if (query.trim()) void runSearch(query, filter);
  };

  return (
    <div
      id="global-search-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto pt-16 sm:pt-20"
      onClick={onClose}
    >
      <div
        id="global-search-modal"
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Global Movie & Series Finder</h3>
              <p className="text-xs text-zinc-400">
                Search TMDB for any movie or series, then favorite it straight from the results
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void runSearch(query, mediaFilter);
          }}
          className="relative"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type any movie or series name (e.g. Dune, Fargo, Oppenheimer)..."
            className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl pl-9.5 pr-24 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-semibold text-xs transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
          </button>
        </form>

        {/* Media type filters + which database answered */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleSelectFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  mediaFilter === filter.id
                    ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/50'
                    : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          {source && (
            <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wide">
              Source: {source === 'tmdb' ? 'TMDB (movies & series)' : 'TVMaze (series only)'}
            </span>
          )}
        </div>

        {source === 'tvmaze' && (
          <p className="text-[11px] text-amber-300 bg-amber-950/30 border border-amber-500/30 rounded-xl px-3 py-2">
            No TMDB credential found, so results come from TVMaze and include series only. Add a TMDB
            key in "Add from TMDB" to search movies too.
          </p>
        )}

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto space-y-2 pt-2">
          {isLoading && (
            <div className="p-8 text-center text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
              <p className="text-xs font-semibold">Retrieving series metadata...</p>
            </div>
          )}

          {!isLoading && hasSearched && results.length === 0 && (
            <div className="p-8 text-center text-zinc-400 bg-zinc-950/40 rounded-xl border border-zinc-800">
              <p className="text-sm font-semibold">No titles found for "{query}"</p>
              <p className="text-xs text-zinc-500 mt-1">Try checking the spelling or searching another title.</p>
            </div>
          )}

          {!isLoading &&
            results.map((series) => {
              const isMovie = series.mediaType === 'movie';
              const isFavorite = watchlistIds.includes(series.id);
              return (
              <div
                key={series.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700 transition-all group"
              >
                <div
                  className="flex items-center gap-3 overflow-hidden cursor-pointer"
                  onClick={() => {
                    onSelectSeries(series);
                    onClose();
                  }}
                >
                  <img
                    src={series.posterUrl}
                    alt={series.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-16 object-cover rounded-lg bg-zinc-900 shrink-0"
                  />
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                        {series.title}
                      </h4>
                      <span className="text-xs text-zinc-400 shrink-0">({series.firstAirYear})</span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-300">
                        {isMovie ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                        {isMovie ? 'MOVIE' : 'TV'}
                      </span>
                      <ProviderBadge providerId={series.primaryProvider} size="sm" />
                      {series.rating > 0 && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{series.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-1 mt-1">{series.synopsis}</p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  <button
                    onClick={() => onToggleWatchlist(series)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isFavorite
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-zinc-800 text-zinc-200 hover:bg-amber-500 hover:text-zinc-950'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400' : ''}`} />
                    <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
                  </button>
                  <button
                    onClick={() => {
                      onSelectSeries(series);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-indigo-300 text-xs font-semibold hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
