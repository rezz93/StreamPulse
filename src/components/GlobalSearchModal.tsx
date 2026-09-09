import React, { useState, useEffect, useCallback } from 'react';
import { Series } from '../types';
import { Bookmark, Film, Search, X, Loader2, Tv, Sparkles, Star, Clapperboard, Clock, Globe, Database, Radio, CheckCircle2 } from 'lucide-react';
import { liveSearchTitles } from '../apiClient';
import { ProviderBadge } from './ProviderBadge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSeries: (series: Series) => void;
  onToggleWatchlist: (series: Series) => void;
  watchlistIds: string[];
  initialQuery?: string;
}

const POPULAR_QUICK_SEARCHES = [
  'Dune',
  'Oppenheimer',
  'Severance',
  'The Batman',
  'The Last of Us',
  'The Godfather',
  'Pulp Fiction',
  'Succession',
  'Casablanca',
  'Interstellar',
  'Gladiator',
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectSeries,
  onToggleWatchlist,
  watchlistIds,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'theaters' | 'movies' | 'series'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'wikipedia' | 'tvmaze' | 'catalog'>('all');

  const runSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const { results: found } = await liveSearchTitles(trimmed);
      setResults(found);
    } catch (err) {
      console.error('Live search error:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Synchronize search term from main screen when modal opens or initialQuery changes
  useEffect(() => {
    if (isOpen) {
      const term = (initialQuery || '').trim();
      setQuery(initialQuery || '');
      if (term) {
        void runSearch(term);
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }
  }, [isOpen, initialQuery, runSearch]);

  if (!isOpen) return null;

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    void runSearch(term);
  };

  const filteredResults = results.filter((item) => {
    if (filterType === 'theaters') {
      const currentYear = new Date().getFullYear();
      if (item.mediaType !== 'movie') return false;
      if (item.firstAirYear !== currentYear || item.isDomestic === false) return false;
      if (item.theaterStatus !== 'now_in_theaters' && !item.providers.includes('theaters')) return false;
    } else if (filterType === 'movies') {
      if (item.mediaType !== 'movie') return false;
    } else if (filterType === 'series') {
      if (item.mediaType === 'movie') return false;
    }

    if (sourceFilter === 'wikipedia') {
      if (item.source !== 'wikipedia') return false;
    } else if (sourceFilter === 'tvmaze') {
      if (item.source !== 'tvmaze') return false;
    } else if (sourceFilter === 'catalog') {
      if (item.source && item.source !== 'catalog') return false;
    }

    return true;
  });

  return (
    <div
      id="global-search-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto pt-14 sm:pt-16"
      onClick={onClose}
    >
      <div
        id="global-search-modal"
        className="w-full max-w-3xl bg-zinc-900 border border-zinc-700/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-xs">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Multi-Source Cinema & Series Search</h3>
              <p className="text-xs text-zinc-400">
                Cross-searching Wikipedia Film Archives, TVMaze Broadcast Directory, and Curated Radar
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
            void runSearch(query);
          }}
          className="relative"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any movie, theatrical release, or TV show (e.g. Dune, Casablanca, Severance)..."
            className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl pl-9.5 pr-28 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
            autoFocus
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setHasSearched(false);
                }}
                className="p-1 text-zinc-400 hover:text-zinc-200 text-xs"
                title="Clear input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 text-zinc-950 font-bold text-xs transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>

        {/* Multi-source live badges */}
        <div className="flex items-center gap-2 text-[11px] text-zinc-400 flex-wrap px-1">
          <span className="text-zinc-500 font-semibold flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Live Sources:
          </span>
          <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium flex items-center gap-1">
            <Database className="w-2.5 h-2.5 text-amber-400" /> Curated Radar
          </span>
          <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium flex items-center gap-1">
            <Globe className="w-2.5 h-2.5 text-blue-400" /> Wikipedia Film Archives
          </span>
          <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium flex items-center gap-1">
            <Tv className="w-2.5 h-2.5 text-purple-400" /> TVMaze Directory
          </span>
        </div>

        {/* Popular Quick Searches */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 pt-1">
          <span className="text-[11px] font-semibold text-zinc-500 shrink-0">Popular:</span>
          {POPULAR_QUICK_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => handleQuickSearch(term)}
              className="px-2.5 py-1 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs whitespace-nowrap transition-colors cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Filter Pills when results are loaded */}
        {results.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/80 pt-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-zinc-400 font-medium mr-1">Type:</span>
              {(
                [
                  { id: 'all', label: `All (${results.length})` },
                  {
                    id: 'theaters',
                    label: `In Theaters (${results.filter((s) => s.mediaType === 'movie' && s.firstAirYear === new Date().getFullYear() && s.isDomestic !== false && (s.theaterStatus === 'now_in_theaters' || s.providers.includes('theaters'))).length})`,
                  },
                  {
                    id: 'movies',
                    label: `Movies (${results.filter((s) => s.mediaType === 'movie').length})`,
                  },
                  {
                    id: 'series',
                    label: `Series (${results.filter((s) => s.mediaType !== 'movie').length})`,
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    filterType === tab.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Source Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-500 font-medium">Source:</span>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as any)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2 py-1 focus:outline-hidden"
              >
                <option value="all">All Sources</option>
                <option value="wikipedia">Wikipedia Cinema</option>
                <option value="tvmaze">TVMaze Shows</option>
                <option value="catalog">Curated Catalog</option>
              </select>
            </div>
          </div>
        )}

        {/* Results summary and no-limits indicator */}
        {hasSearched && !isLoading && (
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1 pt-1 flex-wrap gap-2">
            <span className="font-medium text-zinc-300">
              Found <strong className="text-amber-400 font-bold">{filteredResults.length}</strong> {filteredResults.length === 1 ? 'title' : 'titles'}
              {query.trim() ? <> for "<span className="text-white font-semibold">{query}</span>"</> : null}
            </span>
            <span className="text-[11px] text-zinc-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Showing all matches across sources (no arbitrary limit)
            </span>
          </div>
        )}

        {/* Results List */}
        <div className="max-h-[55vh] overflow-y-auto space-y-2 pt-2">
          {isLoading && (
            <div className="p-10 text-center text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
              <p className="text-xs font-semibold">Cross-querying Wikipedia, TVMaze & Cinema catalogs...</p>
            </div>
          )}

          {!isLoading && hasSearched && filteredResults.length === 0 && (
            <div className="p-8 text-center text-zinc-400 bg-zinc-950/40 rounded-xl border border-zinc-800">
              <p className="text-sm font-semibold">No titles found matching your search</p>
              <p className="text-xs text-zinc-500 mt-1">Try another movie title, director name, or adjust filters above.</p>
            </div>
          )}

          {!isLoading &&
            filteredResults.map((series) => {
              const isMovie = series.mediaType === 'movie';
              const isFavorite = watchlistIds.includes(series.id);
              const isInTheaters = series.theaterStatus === 'now_in_theaters';

              const sourceBadge =
                series.source === 'wikipedia' ? (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60 text-[9px] font-semibold">
                    <Globe className="w-2.5 h-2.5 text-blue-400" /> Wikipedia Film Archive
                  </span>
                ) : series.source === 'tvmaze' ? (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 text-[9px] font-semibold">
                    <Tv className="w-2.5 h-2.5 text-purple-400" /> TVMaze Directory
                  </span>
                ) : series.source === 'gemini_radar' ? (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 text-[9px] font-semibold">
                    <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Live Cinema Radar
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 text-[9px] font-semibold">
                    <Database className="w-2.5 h-2.5 text-amber-400" /> Curated Radar
                  </span>
                );

              return (
                <div
                  key={series.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700 transition-all group"
                >
                  <div
                    className="flex items-center gap-3 overflow-hidden cursor-pointer flex-1"
                    onClick={() => {
                      onSelectSeries(series);
                      onClose();
                    }}
                  >
                    <img
                      src={series.posterUrl}
                      alt={series.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-16 object-cover rounded-lg bg-zinc-900 shrink-0 border border-zinc-800"
                    />
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                          {series.title}
                        </h4>
                        <span className="text-xs text-zinc-400 shrink-0">({series.firstAirYear})</span>
                        {isInTheaters && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950 text-[10px] font-black tracking-wider uppercase shadow-xs">
                            NOW IN THEATERS
                          </span>
                        )}
                        {sourceBadge}
                      </div>

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-300">
                          {isMovie ? <Film className="w-3 h-3 text-teal-400" /> : <Tv className="w-3 h-3 text-indigo-400" />}
                          {isMovie ? 'MOVIE' : 'SERIES'}
                        </span>
                        {!isInTheaters && <ProviderBadge providerId={series.primaryProvider} size="sm" />}
                        {series.rating > 0 && (
                          <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{series.rating.toFixed(1)}</span>
                          </div>
                        )}
                        {isMovie && series.runtimeMinutes && (
                          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            {Math.floor(series.runtimeMinutes / 60)}h {series.runtimeMinutes % 60}m
                          </span>
                        )}
                        {isMovie && series.director && (
                          <span className="text-[11px] text-zinc-400">Dir: {series.director}</span>
                        )}
                        {!isMovie && series.totalSeasons && (
                          <span className="text-[11px] text-zinc-400">
                            {series.totalSeasons} {series.totalSeasons === 1 ? 'Season' : 'Seasons'}
                          </span>
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
                      <span>{isFavorite ? 'In Watchlist' : 'Watchlist'}</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectSeries(series);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-amber-300 text-xs font-semibold hover:bg-amber-500 hover:text-zinc-950 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>View</span>
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
