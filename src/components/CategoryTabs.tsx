import React from 'react';
import { SeriesCategory } from '../types';
import { Play, Calendar, Sparkles, Archive, Bookmark } from 'lucide-react';

interface CategoryTabsProps {
  activeCategory: SeriesCategory;
  onSelectCategory: (category: SeriesCategory) => void;
  watchlistCount: number;
  newSeasonsCount: number;
  upcomingCount: number;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  onSelectCategory,
  watchlistCount,
  newSeasonsCount,
  upcomingCount,
}) => {
  const tabs: Array<{
    id: SeriesCategory;
    label: string;
    description: string;
    icon: React.ElementType;
    badge?: number;
    badgeHighlight?: boolean;
  }> = [
    {
      id: 'now_playing',
      label: 'Now Streaming',
      description: 'Active & trending seasons',
      icon: Play,
    },
    {
      id: 'upcoming',
      label: 'Upcoming Premieres',
      description: 'Release dates & countdowns',
      icon: Calendar,
      badge: upcomingCount,
    },
    {
      id: 'new_seasons',
      label: 'New Season Radar',
      description: 'Renewals & production intel',
      icon: Sparkles,
      badge: newSeasonsCount,
      badgeHighlight: true,
    },
    {
      id: 'classics',
      label: 'Classic & Older Series',
      description: 'By decade (80s, 90s, 00s, 10s)',
      icon: Archive,
    },
    {
      id: 'watchlist',
      label: 'My Watchlist',
      description: 'Tracked shows & season alerts',
      icon: Bookmark,
      badge: watchlistCount > 0 ? watchlistCount : undefined,
    },
  ];

  return (
    <div id="category-tabs-container" className="w-full border-b border-zinc-800 bg-zinc-950/40 backdrop-blur-md">
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1">
        {tabs.map((tab) => {
          const isActive = activeCategory === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => onSelectCategory(tab.id)}
              className={`group relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-800/90 text-zinc-100 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive
                    ? tab.id === 'new_seasons'
                      ? 'text-amber-400'
                      : 'text-indigo-400'
                    : 'text-zinc-500 group-hover:text-zinc-300'
                }`}
              />

              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-medium">{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        tab.badgeHighlight
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
              </div>

              {isActive && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
