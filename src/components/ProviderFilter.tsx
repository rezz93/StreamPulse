import React from 'react';
import { StreamingProvider, StreamingProviderId } from '../types';
import { Tv, Sparkles } from 'lucide-react';

interface ProviderFilterProps {
  providers: StreamingProvider[];
  selectedProvider: StreamingProviderId;
  onSelectProvider: (id: StreamingProviderId) => void;
  countsByProvider?: Record<string, number>;
}

export const ProviderFilter: React.FC<ProviderFilterProps> = ({
  providers,
  selectedProvider,
  onSelectProvider,
  countsByProvider = {},
}) => {
  return (
    <div id="provider-filter-container" className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max">
        {providers.map((prov) => {
          const isSelected = selectedProvider === prov.id;
          const count = countsByProvider[prov.id];

          return (
            <button
              key={prov.id}
              id={`provider-btn-${prov.id}`}
              onClick={() => onSelectProvider(prov.id)}
              className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                isSelected
                  ? 'bg-zinc-800 text-white border-zinc-500 shadow-md ring-1 ring-white/20'
                  : 'bg-zinc-900/90 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {prov.id === 'all' ? (
                <Tv className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
              ) : (
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: prov.accentColor }}
                />
              )}

              <span>{prov.name}</span>

              {count !== undefined && count > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    isSelected ? 'bg-zinc-700 text-zinc-100' : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-300'
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
