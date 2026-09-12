import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Download,
  Tv,
  Puzzle,
  Sparkles,
  Film,
  Bookmark,
  FileSpreadsheet,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { Series } from '../types';
import { IS_STATIC_BUILD } from '../apiClient';

interface NuvioStremioModalProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistSeries: Series[];
}

export const NuvioStremioModal: React.FC<NuvioStremioModalProps> = ({
  isOpen,
  onClose,
  watchlistSeries,
}) => {
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [copiedImdbIds, setCopiedImdbIds] = useState(false);

  // Derive environment and URLs
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') : '';
  const isAiStudioSandbox = typeof window !== 'undefined' && (window.location.hostname.includes('run.app') || window.location.hostname.includes('localhost'));

  // Public GitHub Pages URL where the addon is publicly accessible without Google login cookies
  const publicGhPagesManifest = 'https://rezz93.github.io/StreamPulse/manifest.json';
  
  // Custom or active environment URL
  const activeEnvironmentManifest = IS_STATIC_BUILD || (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))
    ? `${origin}${pathname}/manifest.json`
    : `${origin}/manifest.json`;

  const [selectedUrlType, setSelectedUrlType] = useState<'public' | 'custom'>(
    isAiStudioSandbox ? 'public' : 'custom'
  );

  if (!isOpen) return null;

  const manifestUrl = selectedUrlType === 'public' ? publicGhPagesManifest : activeEnvironmentManifest;
  const stremioProtocolUrl = manifestUrl.replace(/^https?:\/\//, 'stremio://');

  const handleCopyManifest = (urlToCopy = manifestUrl) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2200);
  };

  const handleCopyImdbList = () => {
    const list = watchlistSeries
      .map((s) => s.imdbId)
      .filter(Boolean)
      .join('\n');
    navigator.clipboard.writeText(list || 'tt11280740\ntt3581920\ntt4574334');
    setCopiedImdbIds(true);
    setTimeout(() => setCopiedImdbIds(false), 2200);
  };

  const handleDownloadCsv = () => {
    const headers = ['Title', 'Year', 'IMDb_ID', 'Type', 'Provider', 'Rating'];
    const rows = watchlistSeries.map((s) => [
      `"${s.title.replace(/"/g, '""')}"`,
      s.firstAirYear,
      s.imdbId || '',
      s.mediaType === 'movie' ? 'movie' : 'show',
      `"${s.primaryProvider}"`,
      s.rating,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'streampulse-trakt-nuvio-watchlist.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJson = () => {
    const data = {
      source: 'StreamPulse',
      generatedAt: new Date().toISOString(),
      itemCount: watchlistSeries.length,
      items: watchlistSeries.map((s) => ({
        title: s.title,
        year: s.firstAirYear,
        imdbId: s.imdbId,
        type: s.mediaType === 'movie' ? 'movie' : 'series',
        provider: s.primaryProvider,
        rating: s.rating,
        renewalState: s.renewalState,
        nextSeasonReleaseDate: s.nextSeasonReleaseDate,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'streampulse-watchlist.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="nuvio-stremio-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800/90 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-amber-500 flex items-center justify-center text-white shadow-lg ring-2 ring-indigo-500/20">
              <Puzzle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white tracking-tight">
                  Nuvio & Stremio Addon
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                  LIVE V3 PROTOCOL
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                StreamPulse acts as an installable addon to show your radar & watchlist on TV and mobile.
              </p>
            </div>
          </div>
          <button
            id="close-nuvio-modal"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer border border-zinc-800"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Manifest URL Box */}
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-indigo-500/30 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              ADDON MANIFEST URL
            </span>
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedUrlType('public')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedUrlType === 'public'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                GitHub Pages (Public)
              </button>
              <button
                type="button"
                onClick={() => setSelectedUrlType('custom')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedUrlType === 'custom'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Current Host
              </button>
            </div>
          </div>

          {/* AI Studio / Private Sandbox Warning */}
          {isAiStudioSandbox && selectedUrlType === 'custom' && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed">
              <strong>⚠️ Why private preview URLs fail in Nuvio:</strong> URLs ending in <code className="bg-zinc-900 px-1 py-0.5 rounded text-amber-300">...run.app</code> require your browser's Google AI Studio login cookie. When Nuvio accesses that address, Google returns an HTML sign-in page (<code className="bg-zinc-900 px-1 py-0.5 rounded text-amber-300">&lt;!doctype html&gt;</code>). Switch to <strong>GitHub Pages (Public)</strong> above for a public URL that Nuvio can reach directly!
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex-1 px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-xs text-zinc-200 truncate select-all">
              {manifestUrl}
            </div>
            <button
              id="btn-copy-manifest"
              onClick={() => handleCopyManifest(manifestUrl)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                copiedManifest
                  ? 'bg-emerald-500 text-zinc-950 ring-2 ring-emerald-400'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {copiedManifest ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy URL</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href={stremioProtocolUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              <span>1-Click Install in Stremio</span>
            </a>
            <span className="text-[11px] text-zinc-400">
              or paste the copied URL directly into Nuvio's Addon tab
            </span>
          </div>
        </div>

        {/* Step-by-Step for Nuvio */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            How to Install into Nuvio (TV, Mobile & Desktop)
          </h4>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-zinc-300">
            <li className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
              <div className="font-bold text-amber-300">1. Copy URL</div>
              <p className="text-zinc-400 text-[11px]">
                Click the <strong>Copy URL</strong> button above to copy your manifest link.
              </p>
            </li>
            <li className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
              <div className="font-bold text-indigo-300">2. Open Nuvio Addons</div>
              <p className="text-zinc-400 text-[11px]">
                In Nuvio, tap the <strong>Addons icon</strong> (puzzle piece) in the main navigation.
              </p>
            </li>
            <li className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
              <div className="font-bold text-purple-300">3. Add by URL</div>
              <p className="text-zinc-400 text-[11px]">
                Select <strong>"Install from URL"</strong> or paste in the search/addon bar.
              </p>
            </li>
            <li className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
              <div className="font-bold text-emerald-300">4. Enjoy StreamPulse Shelves</div>
              <p className="text-zinc-400 text-[11px]">
                Your Home screen gets 5 curated rows with instant stream resolution via IMDb IDs!
              </p>
            </li>
          </ol>
        </div>

        {/* Shelves included */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Catalogs Registered in Stremio & Nuvio
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Upcoming Premieres (Series)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium flex items-center gap-1.5">
              <Tv className="w-3 h-3" /> Renewed Season Radar (Series)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium flex items-center gap-1.5">
              <Film className="w-3 h-3" /> Top Rated Shows (Series)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 font-medium flex items-center gap-1.5">
              <Film className="w-3 h-3" /> Featured Cinema & Hits (Movies)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium flex items-center gap-1.5">
              <Bookmark className="w-3 h-3" /> Series Watchlist
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-medium flex items-center gap-1.5">
              <Bookmark className="w-3 h-3" /> Movies Watchlist
            </span>
          </div>
        </div>

        {/* Alternative: Trakt & CSV Watchlist Export */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Trakt.tv & Media Importer Export</span>
            </div>
            <span className="text-[11px] text-zinc-400">
              {watchlistSeries.length} items currently in your list
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Since Nuvio synchronizes natively with Trakt, you can also download your StreamPulse watchlist as a standard CSV or JSON file and import it directly into Trakt or any library organizer.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              id="btn-export-trakt-csv"
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Download Trakt CSV</span>
            </button>
            <button
              id="btn-export-watchlist-json"
              onClick={handleDownloadJson}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Download JSON</span>
            </button>
            <button
              id="btn-copy-imdb-ids"
              onClick={handleCopyImdbList}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedImdbIds ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">IMDb IDs Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy IMDb IDs List</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            id="btn-done-nuvio-modal"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
