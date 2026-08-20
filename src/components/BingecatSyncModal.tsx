import React, { useState, useEffect } from 'react';
import { apiFetch } from '../apiClient';
import {
  X,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  Layers,
  CheckCircle2,
  Tv,
  Puzzle,
  FileJson,
  ListPlus,
} from 'lucide-react';

interface BingecatSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistCount: number;
}

export const BingecatSyncModal: React.FC<BingecatSyncModalProps> = ({
  isOpen,
  onClose,
  watchlistCount,
}) => {
  const [addonUrl, setAddonUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'addon' | 'json'>('addon');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      setAddonUrl(`${origin}/bingecat/manifest.json`);
    }
  }, []);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(addonUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2200);
    }
  };

  const handleDownloadJson = async () => {
    setIsDownloading(true);
    try {
      const res = await apiFetch('/api/bingecat/export.json');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'streampulse-bingecat-watchlist.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export json', e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyJson = async () => {
    try {
      const res = await apiFetch('/api/bingecat/export.json');
      const data = await res.json();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2200);
      }
    } catch (e) {
      console.error('Failed to copy json', e);
    }
  };

  return (
    <div
      id="bingecat-sync-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="bingecat-sync-modal"
        className="relative w-full max-w-xl bg-zinc-900 border border-zinc-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 text-zinc-100 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
            <Puzzle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Bingecat Addon & Sync
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                TMDB & STREMIO READY
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Integrate your StreamPulse series & season radar directly into Bingecat
            </p>
          </div>
        </div>

        {/* Sync Mode Switcher */}
        <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800 flex items-center gap-1">
          <button
            onClick={() => setActiveTab('addon')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'addon'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Puzzle className="w-3.5 h-3.5" />
            <span>Option 1: Addon URL (Automatic Catalog)</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'json'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Option 2: "My Lists" JSON Import</span>
          </button>
        </div>

        {/* Tab 1: Direct Addon URL */}
        {activeTab === 'addon' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-300 font-semibold">
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  Your Bingecat Addon Manifest URL:
                </span>
                {copiedUrl && <span className="text-emerald-400 font-bold">Copied!</span>}
              </div>

              <div className="flex items-center gap-2 bg-zinc-950 p-2 pl-3 rounded-xl border border-zinc-800 focus-within:border-indigo-500 transition-all">
                <input
                  type="text"
                  readOnly
                  value={addonUrl}
                  className="bg-transparent text-xs text-zinc-200 w-full outline-hidden font-mono truncate"
                />
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 transition-all cursor-pointer shadow-sm"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copied' : 'Copy Addon Link'}</span>
                </button>
              </div>
            </div>

            {/* Step by Step instructions matched to User screenshot */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>How to install in Bingecat (from your settings screen):</span>
              </h4>

              <ol className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-indigo-700/60">
                    1
                  </span>
                  <span>
                    Click the <strong>"Copy Addon Link"</strong> button above.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-indigo-700/60">
                    2
                  </span>
                  <span>
                    In your Bingecat settings screen, click <strong>"Install Addon"</strong> at the top bar (or open the <strong>"Addon / Other"</strong> tab).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-indigo-700/60">
                    3
                  </span>
                  <span>
                    Paste your copied manifest URL and click <strong>Install</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-emerald-700/60">
                    ✓
                  </span>
                  <span>
                    <strong>Done!</strong> Bingecat will automatically display your StreamPulse Watchlist and New Season Premieres on your home screen and library.
                  </span>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 2: "My Lists" JSON Import */}
        {activeTab === 'json' && (
          <div className="space-y-4">
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <ListPlus className="w-4 h-4 text-amber-400" />
                  <span>Formatted TMDB Watchlist Export ({watchlistCount} shows)</span>
                </h4>
                {copiedJson && <span className="text-emerald-400 font-bold text-xs">JSON Copied!</span>}
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                This export includes verified <strong>IMDb IDs</strong> and <strong>TMDB IDs</strong> for every show on your watchlist, ensuring immediate playback and metadata matching inside Bingecat's <strong>"My Lists"</strong> tab.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleDownloadJson}
                  disabled={isDownloading}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloading ? 'Preparing...' : 'Download Watchlist JSON'}</span>
                </button>

                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all cursor-pointer border border-zinc-700"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? 'Copied to Clipboard' : 'Copy JSON to Clipboard'}</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 space-y-1">
              <span className="font-semibold text-zinc-300">How to use in Bingecat:</span>
              <p className="text-[11px]">
                In Bingecat, navigate to <strong>My Lists</strong> &gt; <strong>Create List</strong> or <strong>Import</strong> &gt; paste or upload this file.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
