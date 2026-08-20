import React, { useCallback, useEffect, useState } from 'react';
import {
  Check,
  Film,
  KeyRound,
  Loader2,
  Plus,
  Search,
  Star,
  Tv,
  X,
} from 'lucide-react';
import { Series } from '../types';
import {
  fetchTmdbStatus,
  fetchTmdbTrending,
  getStoredTmdbToken,
  importTmdbTitle,
  searchTmdbTitles,
  storeTmdbToken,
  TmdbRequestError,
} from '../tmdbClient';

interface TmdbBrowseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: (series: Series, addToWatchlist: boolean) => void;
  catalogTmdbIds: number[];
}

type MediaFilter = 'multi' | 'tv' | 'movie';

const FILTERS: Array<{ id: MediaFilter; label: string }> = [
  { id: 'multi', label: 'All' },
  { id: 'tv', label: 'TV Shows' },
  { id: 'movie', label: 'Movies' },
];

export const TmdbBrowseModal: React.FC<TmdbBrowseModalProps> = ({
  isOpen,
  onClose,
  onImported,
  catalogTmdbIds,
}) => {
  const [query, setQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('multi');
  const [results, setResults] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsToken, setNeedsToken] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [addToWatchlist, setAddToWatchlist] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [importedIds, setImportedIds] = useState<string[]>([]);
  const [isTrending, setIsTrending] = useState(true);

  const handleError = useCallback((err: unknown) => {
    const requestError = err as TmdbRequestError;
    setError(requestError.message || 'Something went wrong talking to TMDB.');
    if (requestError.needsToken) {
      setNeedsToken(true);
      setShowTokenForm(true);
    }
  }, []);

  const loadTrending = useCallback(
    async (filter: MediaFilter) => {
      setIsLoading(true);
      setError(null);
      setIsTrending(true);
      try {
        setResults(await fetchTmdbTrending(filter === 'multi' ? 'all' : filter));
      } catch (err) {
        setResults([]);
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  const runSearch = useCallback(
    async (searchQuery: string, filter: MediaFilter) => {
      if (!searchQuery.trim()) {
        void loadTrending(filter);
        return;
      }
      setIsLoading(true);
      setError(null);
      setIsTrending(false);
      try {
        setResults(await searchTmdbTitles(searchQuery, filter));
      } catch (err) {
        setResults([]);
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, loadTrending]
  );

  useEffect(() => {
    if (!isOpen) return;
    setTokenInput(getStoredTmdbToken());
    (async () => {
      try {
        const status = await fetchTmdbStatus();
        const hasToken = status.configured || Boolean(getStoredTmdbToken());
        setNeedsToken(!hasToken);
        setShowTokenForm(!hasToken);
        if (hasToken) void loadTrending(mediaFilter);
      } catch {
        void loadTrending(mediaFilter);
      }
    })();
    // Only re-run when the modal is (re)opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    storeTmdbToken(tokenInput);
    setNeedsToken(false);
    setShowTokenForm(false);
    setError(null);
    await (query.trim() ? runSearch(query, mediaFilter) : loadTrending(mediaFilter));
  };

  const handleSelectFilter = (filter: MediaFilter) => {
    setMediaFilter(filter);
    if (needsToken) return;
    void (query.trim() ? runSearch(query, filter) : loadTrending(filter));
  };

  const handleImport = async (series: Series) => {
    const mediaType = series.mediaType === 'movie' ? 'movie' : 'tv';
    if (!series.tmdbId) return;
    setPendingId(series.id);
    setError(null);
    try {
      const { series: imported } = await importTmdbTitle(mediaType, series.tmdbId);
      setImportedIds((prev) => (prev.includes(series.id) ? prev : [...prev, series.id]));
      onImported(imported, addToWatchlist);
    } catch (err) {
      handleError(err);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div
      id="tmdb-browse-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto pt-16 sm:pt-20"
      onClick={onClose}
    >
      <div
        id="tmdb-browse-modal"
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Add from TMDB</h3>
              <p className="text-xs text-zinc-400">
                Search The Movie Database and add movies or shows to your StreamPulse catalog
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

        {/* Token setup */}
        {showTokenForm ? (
          <form onSubmit={handleSaveToken} className="space-y-2 bg-zinc-950/60 border border-teal-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold">
              <KeyRound className="w-3.5 h-3.5" />
              <span>TMDB API credential</span>
            </div>
            <p className="text-xs text-zinc-400">
              Paste a TMDB API key (v3) or API Read Access Token (v4) from themoviedb.org/settings/api. It is stored in
              this browser only. Set <code className="text-zinc-300">TMDB_API_KEY</code> on the server to skip this step.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="TMDB API key or read access token"
                className="flex-1 bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/50"
              />
              <button
                type="submit"
                disabled={!tokenInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-zinc-800 text-white font-semibold text-xs transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowTokenForm(true)}
            className="text-[11px] text-zinc-400 hover:text-teal-300 underline underline-offset-2 cursor-pointer"
          >
            Change TMDB credential
          </button>
        )}

        {/* Search + filters */}
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
            placeholder="Search TMDB for a movie or show (e.g. Dune, Andor)..."
            className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl pl-9.5 pr-24 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/50"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || needsToken}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:bg-zinc-800 text-white font-semibold text-xs transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
          </button>
        </form>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleSelectFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  mediaFilter === filter.id
                    ? 'bg-teal-600/30 text-teal-200 border-teal-500/50'
                    : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={addToWatchlist}
              onChange={(e) => setAddToWatchlist(e.target.checked)}
              className="accent-teal-500"
            />
            Also add to watchlist
          </label>
        </div>

        {error && (
          <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/40 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="max-h-[55vh] overflow-y-auto space-y-2">
          {!error && !isLoading && results.length > 0 && (
            <p className="text-[11px] uppercase tracking-wide text-zinc-500 font-bold">
              {isTrending ? 'Trending this week on TMDB' : `${results.length} results`}
            </p>
          )}

          {isLoading && (
            <div className="p-8 text-center text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-400" />
              <p className="text-xs font-semibold">Loading TMDB titles...</p>
            </div>
          )}

          {!isLoading && !error && results.length === 0 && (
            <div className="p-8 text-center text-zinc-400 bg-zinc-950/40 rounded-xl border border-zinc-800">
              <p className="text-sm font-semibold">No titles to show yet</p>
              <p className="text-xs text-zinc-500 mt-1">Search for a movie or show to add it to your catalog.</p>
            </div>
          )}

          {!isLoading &&
            results.map((series) => {
              const isMovie = series.mediaType === 'movie';
              const isInCatalog =
                importedIds.includes(series.id) ||
                (series.tmdbId !== undefined && catalogTmdbIds.includes(series.tmdbId));

              return (
                <div
                  key={series.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={series.posterUrl}
                      alt={series.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-16 object-cover rounded-lg bg-zinc-900 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate">{series.title}</h4>
                        <span className="text-xs text-zinc-400 shrink-0">({series.firstAirYear})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-300">
                          {isMovie ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                          {isMovie ? 'MOVIE' : 'TV'}
                        </span>
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

                  <button
                    onClick={() => void handleImport(series)}
                    disabled={pendingId === series.id || isInCatalog}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:cursor-default ${
                      isInCatalog
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-teal-600 hover:bg-teal-500 text-white'
                    }`}
                  >
                    {pendingId === series.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isInCatalog ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>{isInCatalog ? 'Added' : 'Add'}</span>
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
