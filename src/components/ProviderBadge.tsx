import React from 'react';
import { StreamingProviderId } from '../types';

interface ProviderBadgeProps {
  providerId: StreamingProviderId;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const PROVIDER_METAS: Record<StreamingProviderId, { name: string; bg: string; text: string; border: string }> = {
  all: { name: 'All Providers', bg: 'bg-zinc-800', text: 'text-zinc-200', border: 'border-zinc-700' },
  netflix: { name: 'Netflix', bg: 'bg-[#E50914]', text: 'text-white', border: 'border-red-600/40' },
  appletv: { name: 'Apple TV+', bg: 'bg-zinc-900', text: 'text-zinc-100', border: 'border-zinc-700' },
  max: { name: 'Max (HBO)', bg: 'bg-[#002BE7]', text: 'text-white', border: 'border-blue-500/40' },
  prime: { name: 'Prime Video', bg: 'bg-[#00A8E1]', text: 'text-white', border: 'border-sky-400/40' },
  disney: { name: 'Disney+', bg: 'bg-[#113CCF]', text: 'text-white', border: 'border-blue-400/40' },
  hulu: { name: 'Hulu', bg: 'bg-[#1CE783]', text: 'text-zinc-950', border: 'border-emerald-500/40' },
  paramount: { name: 'Paramount+', bg: 'bg-[#0064FF]', text: 'text-white', border: 'border-indigo-400/40' },
  peacock: { name: 'Peacock', bg: 'bg-zinc-950', text: 'text-amber-400', border: 'border-amber-500/40' },
};

export const ProviderBadge: React.FC<ProviderBadgeProps> = ({ providerId, size = 'sm', showLabel = true }) => {
  const meta = PROVIDER_METAS[providerId] || PROVIDER_METAS.netflix;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold rounded-md',
    md: 'px-2.5 py-1 text-xs font-bold rounded-lg',
    lg: 'px-3 py-1.5 text-sm font-bold rounded-lg',
  }[size];

  return (
    <span
      id={`provider-badge-${providerId}`}
      className={`inline-flex items-center gap-1.5 shadow-xs border ${meta.bg} ${meta.text} ${meta.border} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {showLabel && <span>{meta.name}</span>}
    </span>
  );
};
