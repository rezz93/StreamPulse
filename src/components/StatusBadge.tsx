import React from 'react';
import { RenewalState } from '../types';
import { Sparkles, Clock, CheckCircle2, Flame, BellRing, Film } from 'lucide-react';

interface StatusBadgeProps {
  renewalState: RenewalState;
  text: string;
  daysLeft?: number;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  renewalState,
  text,
  daysLeft,
  size = 'sm'
}) => {
  let bg = 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60';
  let Icon = Sparkles;

  if (renewalState === 'season_upcoming') {
    bg = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    Icon = Clock;
  } else if (renewalState === 'final_season_upcoming') {
    bg = 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold';
    Icon = BellRing;
  } else if (renewalState === 'renewed') {
    bg = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    Icon = CheckCircle2;
  } else if (renewalState === 'in_production') {
    bg = 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
    Icon = Film;
  } else if (renewalState === 'airing_now') {
    bg = 'bg-red-500/15 text-red-300 border-red-500/30 animate-pulse';
    Icon = Flame;
  } else if (renewalState === 'concluded') {
    bg = 'bg-zinc-800/70 text-zinc-400 border-zinc-700/40';
    Icon = Film;
  }

  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      id={`status-badge-${renewalState}`}
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border backdrop-blur-xs ${bg} ${pad}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{text}</span>
      {daysLeft !== undefined && daysLeft > 0 && daysLeft <= 180 && (
        <span className="ml-0.5 px-1 py-0.2 rounded bg-black/40 text-[10px] font-bold text-amber-200">
          {daysLeft}d
        </span>
      )}
    </span>
  );
};
