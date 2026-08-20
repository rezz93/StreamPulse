import React, { useState, useEffect } from 'react';
import { apiFetch } from '../apiClient';
import { Series, AISeasonIntel } from '../types';
import { ProviderBadge } from './ProviderBadge';
import { StatusBadge } from './StatusBadge';
import {
  X,
  Star,
  Bookmark,
  Calendar,
  Sparkles,
  Film,
  Clock,
  ExternalLink,
  Bot,
  RefreshCw,
  Info,
  CheckCircle2,
  Users,
  Layers,
  AlertTriangle,
} from 'lucide-react';

interface SeriesDetailModalProps {
  series: Series | null;
  isOpen: boolean;
  onClose: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (id: string) => void;
}

export const SeriesDetailModal: React.FC<SeriesDetailModalProps> = ({
  series,
  isOpen,
  onClose,
  isWatchlisted,
  onToggleWatchlist,
}) => {
  const [activeTab, setActiveTab] = useState<'seasons' | 'upcoming_intel' | 'cast'>('seasons');
  const [aiIntel, setAiIntel] = useState<AISeasonIntel | null>(null);
  const [isLoadingIntel, setIsLoadingIntel] = useState(false);
  const [intelError, setIntelError] = useState<string | null>(null);

  // Reset tab when series changes
  useEffect(() => {
    if (series) {
      const isMovieTitle = series.mediaType === 'movie';
      setActiveTab(
        isMovieTitle ? 'cast' : series.hasNewSeasonAlert || series.isUpcoming ? 'upcoming_intel' : 'seasons'
      );
      setAiIntel(null);
      setIntelError(null);
    }
  }, [series]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !series) return null;

  const isMovie = series.mediaType === 'movie';

  const handleFetchAIIntel = async () => {
    setIsLoadingIntel(true);
    setIntelError(null);
    try {
      const response = await apiFetch('/api/series/ai-season-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: series.title,
          context: `Network: ${series.network || series.primaryProvider}, Total Seasons: ${series.totalSeasons}, Current Status: ${series.renewalBadgeText}`,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to generate season intelligence');
      }

      setAiIntel(payload as AISeasonIntel);
    } catch (err: any) {
      setIntelError(err?.message || 'Could not retrieve AI season intelligence at this time.');
    } finally {
      setIsLoadingIntel(false);
    }
  };

  return (
    <div
      id="series-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="series-detail-modal"
        className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-700/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-auto text-zinc-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Banner with Backdrop */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-zinc-950">
          <img
            src={series.backdropUrl || series.posterUrl}
            alt={series.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-black/30" />

          {/* Hero Content Overlay */}
          <div className="absolute bottom-4 sm:bottom-6 inset-x-4 sm:inset-x-6 flex flex-col sm:flex-row items-start sm:items-end gap-4 z-10">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <ProviderBadge providerId={series.primaryProvider} size="md" />
                <StatusBadge
                  renewalState={series.renewalState}
                  text={series.renewalBadgeText}
                  daysLeft={series.nextSeasonDaysLeft}
                  size="md"
                />
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
                {series.title}
              </h1>

              {series.tagline && (
                <p className="text-xs sm:text-sm text-zinc-300 italic mt-1 drop-shadow-xs line-clamp-1">
                  "{series.tagline}"
                </p>
              )}

              {/* Meta metrics */}
              <div className="flex items-center gap-2.5 sm:gap-4 mt-2 text-xs sm:text-sm text-zinc-300 flex-wrap">
                <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30 text-amber-300 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{series.rating.toFixed(1)} / 10</span>
                </div>
                <span className="font-semibold text-zinc-200">
                  {isMovie
                    ? series.firstAirYear
                    : `${series.firstAirYear}${series.lastAirYear ? `–${series.lastAirYear}` : '–Present'}`}
                </span>
                <span>•</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-xs font-semibold text-zinc-300">
                  {series.contentRating}
                </span>
                {!isMovie && (
                  <>
                    <span>•</span>
                    <span>{series.totalSeasons} {series.totalSeasons === 1 ? 'Season' : 'Seasons'} ({series.totalEpisodes} eps)</span>
                  </>
                )}
                {series.network && (
                  <>
                    <span>•</span>
                    <span className="text-indigo-300 font-medium">{series.network}</span>
                  </>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="modal-toggle-watchlist"
                onClick={() => onToggleWatchlist(series.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm cursor-pointer transition-all border ${
                  isWatchlisted
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md font-bold'
                    : 'bg-zinc-800/90 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 px-4 sm:px-6">
          {!isMovie && (
          <button
            id="tab-btn-upcoming-intel"
            onClick={() => setActiveTab('upcoming_intel')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'upcoming_intel'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>New Season & Renewal Radar</span>
            {series.hasNewSeasonAlert && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>
          )}

          {!isMovie && (
          <button
            id="tab-btn-seasons"
            onClick={() => setActiveTab('seasons')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'seasons'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Seasons Guide ({series.seasons.length})</span>
          </button>
          )}

          <button
            id="tab-btn-cast"
            onClick={() => setActiveTab('cast')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'cast'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Cast & Info</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 max-h-[55vh] overflow-y-auto space-y-6">
          {/* TAB 1: UPCOMING SEASON RADAR & AI INTELLIGENCE */}
          {activeTab === 'upcoming_intel' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Next Season Countdown Card */}
              {series.nextSeasonNumber ? (
                <div className="bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30">
                          Season {series.nextSeasonNumber}
                        </span>
                        <span className="text-xs font-semibold text-zinc-300">
                          Status: <strong className="text-white">{series.renewalBadgeText}</strong>
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-white mt-2">
                        Upcoming Season Premiere
                      </h3>

                      {series.renewalNewsSummary && (
                        <p className="text-xs sm:text-sm text-zinc-300 mt-1.5 leading-relaxed">
                          {series.renewalNewsSummary}
                        </p>
                      )}

                      {series.productionNotes && (
                        <div className="flex items-start gap-2 mt-3 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-400">
                          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span><strong>Production Dispatch:</strong> {series.productionNotes}</span>
                        </div>
                      )}
                    </div>

                    {/* Countdown Pill Box */}
                    {series.nextSeasonDaysLeft !== undefined && (
                      <div className="bg-zinc-950/90 border border-indigo-500/40 rounded-xl p-4 text-center shrink-0 shadow-lg min-w-[140px]">
                        <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400">
                          {series.nextSeasonDaysLeft}
                        </div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
                          Days Remaining
                        </div>
                        {series.nextSeasonReleaseDate && (
                          <div className="text-[11px] text-zinc-300 mt-2 pt-2 border-t border-zinc-800 font-medium">
                            {new Date(series.nextSeasonReleaseDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-5 text-center">
                  <Film className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-zinc-200">
                    {series.status === 'Ended' ? 'Series Concluded' : 'Season Renewal Tracking'}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                    {series.renewalNewsSummary || 'This series has completed its intended broadcast run across its seasons.'}
                  </p>
                </div>
              )}

              {/* Streaming Platform Watch Locations */}
              <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                  <Film className="w-4 h-4 text-indigo-400" />
                  <span>Available Streaming Providers</span>
                </h4>
                <div className="flex flex-wrap items-center gap-2.5">
                  {series.providers.map((p) => (
                    <div
                      key={p}
                      className="flex items-center gap-2 bg-zinc-900 border border-zinc-700/70 px-3.5 py-2 rounded-xl text-xs font-semibold"
                    >
                      <ProviderBadge providerId={p} size="sm" />
                      <span className="text-zinc-300">All Seasons Active</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Season Intelligence (Gemini Integration) */}
              <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Gemini AI Season Radar</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Live Intel
                        </span>
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Query live production status, filming milestones, and storyline expectations
                      </p>
                    </div>
                  </div>

                  <button
                    id="btn-run-ai-intel"
                    onClick={handleFetchAIIntel}
                    disabled={isLoadingIntel}
                    className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-semibold text-xs transition-all cursor-pointer shadow-md disabled:cursor-not-allowed"
                  >
                    {isLoadingIntel ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing Industry Reports...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{aiIntel ? 'Refresh Analysis' : 'Run Season Intelligence'}</span>
                      </>
                    )}
                  </button>
                </div>

                {intelError && (
                  <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{intelError}</span>
                  </div>
                )}

                {aiIntel && (
                  <div className="mt-4 space-y-4 animate-in fade-in duration-300 text-xs sm:text-sm">
                    {/* Status grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl">
                        <span className="text-[11px] font-semibold text-zinc-400 block">Renewal Verdict</span>
                        <span className="font-bold text-emerald-400 text-sm mt-0.5 block">{aiIntel.renewalStatus}</span>
                      </div>
                      <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl">
                        <span className="text-[11px] font-semibold text-zinc-400 block">Release Window</span>
                        <span className="font-bold text-amber-300 text-sm mt-0.5 block">{aiIntel.projectedReleaseWindow}</span>
                      </div>
                      <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl">
                        <span className="text-[11px] font-semibold text-zinc-400 block">Production Phase</span>
                        <span className="font-bold text-indigo-300 text-sm mt-0.5 block">{aiIntel.productionStatus}</span>
                      </div>
                    </div>

                    {/* Key Cast & Storyline Teasers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl">
                        <h5 className="text-xs font-bold text-zinc-200 mb-2 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Cast & Production Updates</span>
                        </h5>
                        <ul className="space-y-1.5 text-zinc-300 text-xs">
                          {aiIntel.keyCastUpdates.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-indigo-400 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl">
                        <h5 className="text-xs font-bold text-zinc-200 mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Storyline Expectations</span>
                        </h5>
                        <ul className="space-y-1.5 text-zinc-300 text-xs">
                          {aiIntel.plotTeasers.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-amber-400 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Sources & Verification footer */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-500">
                      <span>Source Intel: {aiIntel.sourcesSummary}</span>
                      <span className="font-medium text-zinc-400">Confidence: {aiIntel.confidence}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SEASONS BREAKDOWN */}
          {activeTab === 'seasons' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">
                  All Broadcast & Upcoming Seasons ({series.seasons.length})
                </h4>
                <span className="text-xs text-zinc-400">
                  Total: {series.totalEpisodes} Episodes
                </span>
              </div>

              <div className="space-y-3">
                {series.seasons.map((season) => (
                  <div
                    key={season.seasonNumber}
                    className={`p-4 rounded-xl border transition-all ${
                      season.status === 'upcoming'
                        ? 'bg-indigo-950/30 border-indigo-500/40'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-200 border border-zinc-700">
                          S{season.seasonNumber}
                        </span>
                        <div>
                          <h5 className="text-sm font-bold text-white">{season.title}</h5>
                          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                            <span>{season.episodeCount} Episodes</span>
                            <span>•</span>
                            <span>Aired: {season.releaseDate}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {season.status === 'released' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-700">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Completed
                          </span>
                        )}
                        {season.status === 'upcoming' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            Upcoming Season
                            {season.countdownDays && ` • ${season.countdownDays}d`}
                          </span>
                        )}
                      </div>
                    </div>

                    {season.overview && (
                      <p className="text-xs text-zinc-300 mt-2.5 leading-relaxed bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/60">
                        {season.overview}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CAST & INFO */}
          {activeTab === 'cast' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h4 className="text-sm font-bold text-white mb-2">Series Synopsis</h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
                  {series.synopsis}
                </p>
              </div>

              {/* Creators & Network */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl">
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">
                    {isMovie ? 'Directed By' : 'Created By'}
                  </span>
                  <span className="text-sm font-bold text-zinc-100 mt-1 block">
                    {series.creator || (isMovie ? 'Director' : 'Showrunner / Creators')}
                  </span>
                </div>
                <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl">
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">
                    {isMovie ? 'Studio' : 'Original Network / Studio'}
                  </span>
                  <span className="text-sm font-bold text-zinc-100 mt-1 block">{series.network || series.primaryProvider}</span>
                </div>
              </div>

              {/* Cast List */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3">Starring Cast</h4>
                {series.cast.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {series.cast.map((actor) => (
                      <div
                        key={actor.name}
                        className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800"
                      >
                        <div className="w-9 h-9 rounded-full bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-300 shrink-0">
                          {actor.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <h5 className="text-xs font-bold text-zinc-100 truncate">{actor.name}</h5>
                          <p className="text-[11px] text-zinc-400 truncate">{actor.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic">Cast list verified with TV guide metadata.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
