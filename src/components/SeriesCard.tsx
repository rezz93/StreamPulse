import React from 'react';
import { Series } from '../types';
import { ProviderBadge } from './ProviderBadge';
import { StatusBadge } from './StatusBadge';
import { Star, Bookmark, Calendar, Film, Bell, Check, Clapperboard, Clock, Zap, Radio, Sparkles } from 'lucide-react';

interface SeriesCardProps {
  series: Series;
  isWatchlisted: boolean;
  onToggleWatchlist: (id: string, e: React.MouseEvent) => void;
  onSelect: (series: Series) => void;
}

export const SeriesCard: React.FC<SeriesCardProps> = ({
  series,
  isWatchlisted,
  onToggleWatchlist,
  onSelect,
}) => {
  const formattedRuntime = series.runtimeMinutes
    ? `${Math.floor(series.runtimeMinutes / 60)}h ${series.runtimeMinutes % 60}m`
    : null;

  return (
    <div
      id={`series-card-${series.id}`}
      onClick={() => onSelect(series)}
      className="group relative flex flex-col bg-zinc-900/80 hover:bg-zinc-800/90 rounded-2xl border border-zinc-800 hover:border-zinc-700/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[16/10] sm:aspect-[16/11] w-full overflow-hidden bg-zinc-950">
        <img
          src={series.backdropUrl || series.posterUrl}
          alt={series.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        {/* Top Badges Bar */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1.5 z-10">
          <div className="flex flex-wrap items-center gap-1.5 max-w-[80%]">
            {series.theaterStatus === 'now_in_theaters' ? (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500 text-zinc-950 text-xs font-black tracking-wide shadow-md">
                <Clapperboard className="w-3 h-3" />
                IN THEATERS
              </span>
            ) : series.theaterStatus === 'coming_to_theaters' ? (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold shadow-md">
                <Clapperboard className="w-3 h-3" />
                COMING TO CINEMA
              </span>
            ) : (
              <ProviderBadge providerId={series.primaryProvider} size="sm" />
            )}

            {series.providers.length > 1 && series.theaterStatus !== 'now_in_theaters' && (
              <span className="px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-zinc-300 border border-white/10">
                +{series.providers.length - 1} more
              </span>
            )}
          </div>

          {/* Watchlist Bookmark Button */}
          <button
            id={`btn-watchlist-${series.id}`}
            onClick={(e) => onToggleWatchlist(series.id, e)}
            title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer border ${
              isWatchlisted
                ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-md ring-2 ring-amber-400/30'
                : 'bg-zinc-900/80 text-zinc-300 hover:text-white border-zinc-700/60 hover:bg-zinc-800'
            }`}
          >
            {isWatchlisted ? (
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Bottom Banner inside Poster: Status / Countdown */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between gap-1 z-10">
          <StatusBadge
            renewalState={series.renewalState}
            text={series.renewalBadgeText}
            daysLeft={series.nextSeasonDaysLeft}
            size="sm"
          />

          {series.hasNewSeasonAlert && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
              <Bell className="w-2.5 h-2.5" />
              {series.mediaType === 'movie' ? 'Upcoming' : 'New Season'}
            </span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Header Row: Title & Rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
              {series.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">{series.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Meta Info Row */}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-400 flex-wrap">
            <span className="font-medium text-zinc-300">{series.firstAirYear}</span>
            <span>•</span>
            <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] font-medium text-zinc-300">
              {series.contentRating}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium text-zinc-300">
              {series.mediaType === 'movie' ? (
                <>
                  <Film className="w-3 h-3 text-zinc-500" />
                  {formattedRuntime || 'Movie'}
                </>
              ) : (
                <>
                  <Film className="w-3 h-3 text-zinc-500" />
                  {`${series.totalSeasons} ${series.totalSeasons === 1 ? 'Season' : 'Seasons'}`}
                </>
              )}
            </span>
            {series.director && (
              <>
                <span>•</span>
                <span className="text-zinc-400 truncate max-w-[120px]" title={`Dir: ${series.director}`}>
                  Dir: {series.director}
                </span>
              </>
            )}
          </div>

          {/* Curation Shelf Tags */}
          {(series.isNewOnProvider || series.isNextWatch || series.isCurrentlyAiring) && (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              {series.isNewOnProvider && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  <Zap className="w-2.5 h-2.5" />
                  New Drop
                </span>
              )}
              {series.isNextWatch && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                  <Sparkles className="w-2.5 h-2.5" />
                  Next Watch
                </span>
              )}
              {series.isCurrentlyAiring && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                  <Radio className="w-2.5 h-2.5" />
                  Airing Now
                </span>
              )}
            </div>
          )}

          {/* Synopsis */}
          <p className="mt-2 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {series.synopsis}
          </p>
        </div>

        {/* Footer: Genres & Release Details */}
        <div className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1 items-center overflow-hidden">
            {series.boxOffice ? (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                {series.boxOffice}
              </span>
            ) : null}
            {series.genres.slice(0, series.boxOffice ? 1 : 2).map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 rounded-md bg-zinc-800/90 text-zinc-400 text-[10px] font-medium"
              >
                {g}
              </span>
            ))}
            {series.source === 'wikipedia' && (
              <span className="px-1.5 py-0.5 rounded-md bg-blue-950/60 text-blue-300/90 border border-blue-800/40 text-[9px] font-medium">
                Wikipedia
              </span>
            )}
            {series.source === 'tvmaze' && (
              <span className="px-1.5 py-0.5 rounded-md bg-purple-950/60 text-purple-300/90 border border-purple-800/40 text-[9px] font-medium">
                TVMaze
              </span>
            )}
          </div>

          {series.nextSeasonReleaseDate ? (
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 shrink-0 font-medium">
              <Calendar className="w-3 h-3 text-indigo-400" />
              <span>{series.mediaType === 'movie' ? 'Release' : 'Next'}: {new Date(series.nextSeasonReleaseDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
            </div>
          ) : (
            <span className="text-[11px] text-zinc-500 font-medium">
              {series.primaryProvider === 'theaters' ? 'In Cinemas' : series.network || 'Streaming'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
