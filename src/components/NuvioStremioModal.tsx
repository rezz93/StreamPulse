import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  Settings,
  Radio,
} from 'lucide-react';
import { Series } from '../types';
import { IS_STATIC_BUILD, getBackendSyncUrl, syncWatchlistToServer } from '../apiClient';

interface NuvioStremioModalProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist: string[];
  watchlistSeries: Series[];
}

export const NuvioStremioModal: React.FC<NuvioStremioModalProps> = ({
  isOpen,
  onClose,
  watchlist,
  watchlistSeries,
}) => {
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [copiedImdbIds, setCopiedImdbIds] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [customServerUrl, setCustomServerUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('streampulse_custom_backend_url') || '';
      setCustomServerUrl(saved);
      const lastSynced = localStorage.getItem('streampulse_watchlist_synced_at');
      if (lastSynced) {
        try {
          const date = new Date(lastSynced);
          setSyncStatus(`Last synced: ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
        } catch {
          // ignore
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Breakdown counts
  const moviesCount = watchlistSeries.filter((s) => s.mediaType === 'movie').length;
  const seriesCount = watchlistSeries.filter((s) => s.mediaType !== 'movie').length;

  // Derive environment and URLs
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') : '';
  const isAiStudioSandbox =
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('run.app') || window.location.hostname.includes('localhost'));

  const activeBackendUrl = getBackendSyncUrl();

  // Personalized URL embedding the current watchlist in path
  const encodedWatchlist = encodeURIComponent(watchlist.join(','));
  const personalizedManifestUrl = `${activeBackendUrl}/w=${encodedWatchlist}/manifest.json`;
  const liveManifestUrl = `${activeBackendUrl}/manifest.json`;
  const publicGhPagesManifest = 'https://rezz93.github.io/StreamPulse/manifest.json';

  const [selectedUrlType, setSelectedUrlType] = useState<'personalized' | 'live' | 'public'>(
    isAiStudioSandbox ? 'personalized' : 'live'
  );

  let activeUrl = liveManifestUrl;
  if (selectedUrlType === 'personalized') {
    activeUrl = personalizedManifestUrl;
  } else if (selectedUrlType === 'public') {
    activeUrl = publicGhPagesManifest;
  }

  const stremioProtocolUrl = activeUrl.replace(/^https?:\/\//, 'stremio://');

  const handleCopyManifest = (urlToCopy = activeUrl) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2200);
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const res = await syncWatchlistToServer(watchlist, watchlistSeries);
      if (res.success) {
        setSyncStatus(`✓ Synced ${res.count} titles (${moviesCount} movies, ${seriesCount} series) with Stremio`);
      } else {
        setSyncStatus(`Watchlist saved locally (${res.count} titles)`);
      }
    } catch {
      setSyncStatus(`Watchlist saved locally (${watchlist.length} titles)`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveCustomServer = () => {
    if (typeof window !== 'undefined') {
      const clean = customServerUrl.trim().replace(/\/$/, '');
      if (clean) {
        localStorage.setItem('streampulse_custom_backend_url', clean);
      } else {
        localStorage.removeItem('streampulse_custom_backend_url');
      }
      setShowServerConfig(false);
      handleSyncNow();
    }
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
    link.setAttribute('download', 'streampulse-trakt-watchlist.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJson = () => {
    const data = {
      source: 'StreamPulse',
      generatedAt: new Date().toISOString(),
      itemCount: watchlistSeries.length,
      moviesCount,
      seriesCount,
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
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                  LIVE SYNC ADDON
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Separate catalogs for <strong>Movies Watchlist</strong> and <strong>Series Watchlist</strong> with instant stream resolution.
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

        {/* Live Watchlist Sync Box */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-emerald-500/30 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Watchlist Sync Status
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-300 font-semibold bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                {watchlist.length} Total: <span className="text-indigo-400 font-bold">{moviesCount} Movies</span> • <span className="text-purple-400 font-bold">{seriesCount} Series</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            <p className="text-xs text-zinc-400">
              {syncStatus || 'When you add or remove titles in the app, your Stremio catalogs update automatically.'}
            </p>
            <button
              id="btn-sync-watchlist-now"
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Watchlist Now'}</span>
            </button>
          </div>
        </div>

        {/* Manifest URL Selector Box */}
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-indigo-500/30 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              STREMIO ADDON MANIFEST
            </span>
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedUrlType('personalized')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedUrlType === 'personalized'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Personalized
              </button>
              <button
                type="button"
                onClick={() => setSelectedUrlType('live')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedUrlType === 'live'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Live Server
              </button>
              <button
                type="button"
                onClick={() => setSelectedUrlType('public')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedUrlType === 'public'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                GitHub Pages
              </button>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400">
            {selectedUrlType === 'personalized' &&
              'Includes your current watchlist directly in the addon configuration URL, guaranteeing that Stremio displays your exact movies and series immediately.'}
            {selectedUrlType === 'live' &&
              'Connects to your active backend server with live real-time auto-sync whenever you change your watchlist in the app.'}
            {selectedUrlType === 'public' &&
              'Connects to the public GitHub Pages static deployment for general community catalogs.'}
          </p>

          <div className="flex items-center gap-2">
            <div className="flex-1 px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-xs text-zinc-200 truncate select-all">
              {activeUrl}
            </div>
            <button
              id="btn-copy-manifest"
              onClick={() => handleCopyManifest(activeUrl)}
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

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <a
                href={stremioProtocolUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                <span>1-Click Install in Stremio</span>
              </a>
              <span className="text-[11px] text-zinc-400">
                or paste into Stremio / Nuvio addon search
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowServerConfig(!showServerConfig)}
              className="text-[11px] text-zinc-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <Settings className="w-3 h-3" />
              <span>Server Config</span>
            </button>
          </div>

          {/* Custom Backend URL Configuration drawer */}
          {showServerConfig && (
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2 text-xs">
              <div className="font-semibold text-zinc-300">Custom Sync Server URL</div>
              <p className="text-[11px] text-zinc-400">
                If you deploy StreamPulse to your own Cloud Run, Render, or Railway instance, enter its URL here to enable automatic two-way watchlist sync from any web client:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={customServerUrl}
                  onChange={(e) => setCustomServerUrl(e.target.value)}
                  placeholder="https://my-backend.domain.com"
                  className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  onClick={handleSaveCustomServer}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Save & Sync
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Catalogs Registered in Stremio */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Catalogs Registered in Addon
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-semibold flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" /> StreamPulse: Movies Watchlist
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5" /> StreamPulse: Series Watchlist
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 font-medium flex items-center gap-1.5">
              <Film className="w-3 h-3" /> Featured Cinema & Hits (Movies)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium flex items-center gap-1.5">
              <Tv className="w-3 h-3" /> Renewed Season Radar (Series)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Upcoming Premieres (Series)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium flex items-center gap-1.5">
              <Film className="w-3 h-3" /> Top Rated Shows (Series)
            </span>
          </div>
        </div>

        {/* Trakt & CSV Watchlist Export */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Trakt.tv & Media Importer Export</span>
            </div>
            <span className="text-[11px] text-zinc-400">
              {watchlistSeries.length} items in your list
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Download your StreamPulse watchlist as a standard CSV or JSON file to import into Trakt.tv or other media organizers.
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
