import React, { useState } from 'react';
import { apiFetch } from '../apiClient';
import {
  X,
  ExternalLink,
  Check,
  Copy,
  RefreshCw,
  Sparkles,
  Tv,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Database,
  Upload,
  Download,
  Flame,
  Zap,
} from 'lucide-react';
import { Series } from '../types';
import { getStoredTmdbToken, storeTmdbToken } from '../tmdbToken';
import {
  clearTmdbWriteToken,
  getTmdbListId,
  getTmdbMovieListId,
  getTmdbWriteToken,
  saveTmdbListSettings,
  saveTmdbWriteToken,
} from '../tmdbSettings';

interface TmdbSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistedSeries: Series[];
  onImportFromTmdb?: (seriesIds: string[]) => void;
}

export const TmdbSyncModal: React.FC<TmdbSyncModalProps> = ({
  isOpen,
  onClose,
  watchlistedSeries,
  onImportFromTmdb,
}) => {
  // Stored TMDB settings
  const [tmdbListId, setTmdbListId] = useState<string>(() => {
    return getTmdbListId();
  });
  const [tmdbMovieListId, setTmdbMovieListId] = useState<string>(() => {
    return getTmdbMovieListId();
  });
  const [tmdbApiKey, setTmdbApiKey] = useState<string>(() => {
    return localStorage.getItem('streampulse_tmdb_api_key') || getStoredTmdbToken();
  });
  const [pendingRequestToken, setPendingRequestToken] = useState<string>('');
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'sync' | 'nuvio' | 'shows'>('sync');

  // Clean numeric List ID
  const cleanListId = tmdbListId.trim().replace(/[^0-9]/g, '') || '8687068';
  const cleanMovieListId = tmdbMovieListId.trim().replace(/[^0-9]/g, '');
  const movieCount = watchlistedSeries.filter((series) => series.mediaType === 'movie').length;
  const showCount = watchlistedSeries.length - movieCount;

  // Status states
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{
    success?: boolean;
    message?: string;
    syncedCount?: number;
  } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    saveTmdbListSettings(tmdbListId.trim(), tmdbMovieListId.trim());
    localStorage.setItem('streampulse_tmdb_api_key', tmdbApiKey.trim());
    // Share the token with search/import so a key only has to be pasted once.
    storeTmdbToken(tmdbApiKey);
  };

  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedUrl(id);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  // 1-Click TMDB Web Permission Flow
  const handleStartTmdbAuth = async () => {
    handleSaveSettings();
    setIsAuthorizing(true);
    setSyncStatus(null);
    try {
      const res = await apiFetch('/api/tmdb/auth-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readToken: tmdbApiKey.trim(), redirectTo: window.location.href }),
      });
      const data = await res.json();
      if (res.ok && data.request_token && data.authUrl) {
        setPendingRequestToken(data.request_token);
        // Open TMDB Approval page in new tab
        window.open(data.authUrl, '_blank', 'noopener,noreferrer');
        setSyncStatus({
          success: true,
          message: 'TMDB Approval window opened! Click "Approve" on TMDB, then click "Complete Sync" below.',
        });
      } else {
        setSyncStatus({
          success: false,
          message: data.error || 'Could not start TMDB authorization.',
        });
      }
    } catch (e: any) {
      setSyncStatus({
        success: false,
        message: 'Network error starting TMDB authorization.',
      });
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleCompleteTmdbAuth = async () => {
    if (!pendingRequestToken) {
      handleStartTmdbAuth();
      return;
    }

    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await apiFetch('/api/tmdb/auth-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readToken: tmdbApiKey.trim(),
          requestToken: pendingRequestToken,
          listId: cleanListId,
          movieListId: cleanMovieListId,
          watchlistSeries: watchlistedSeries.map((s) => ({
            id: s.id,
            title: s.title,
            tmdbId: s.tmdbId,
            imdbId: s.imdbId,
            mediaType: s.mediaType,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.userAccessToken) {
          saveTmdbWriteToken(data.userAccessToken);
        }
        setPendingRequestToken('');
        setSyncStatus({
          success: true,
          syncedCount: data.syncedCount || watchlistedSeries.length,
          message: data.message || `Successfully synced ${showCount} shows and ${movieCount} movies to TMDB!`,
        });
      } else {
        setSyncStatus({
          success: false,
          message: data.error || 'Approval not detected yet. Make sure you clicked "Approve" on TMDB and try again.',
        });
      }
    } catch (e: any) {
      setSyncStatus({
        success: false,
        message: 'Network error completing TMDB sync.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncToTmdb = async () => {
    handleSaveSettings();
    if (!tmdbListId.trim()) {
      setSyncStatus({
        success: false,
        message: 'Please enter your TMDB List ID or List URL below.',
      });
      return;
    }

    const savedWriteToken = getTmdbWriteToken();
    if (!savedWriteToken) {
      setSyncStatus({
        success: false,
        message:
          'TMDB needs your permission before StreamPulse can write to a list. Click "1-Click TMDB Authorize" to grant it.',
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const tokenToUse = savedWriteToken;

      const res = await apiFetch('/api/tmdb/sync-to-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listId: cleanListId,
          movieListId: cleanMovieListId,
          apiKey: tokenToUse,
          watchlistSeries: watchlistedSeries.map((s) => ({
            id: s.id,
            title: s.title,
            tmdbId: s.tmdbId,
            imdbId: s.imdbId,
            mediaType: s.mediaType,
          })),
        }),
      });

      const data = await res.json().catch(() => ({ error: 'Could not parse response from server.' }));
      if (res.ok && data.success) {
        setSyncStatus({
          success: true,
          syncedCount: data.syncedCount || watchlistedSeries.length,
          message: data.message || `Successfully synced ${showCount} shows and ${movieCount} movies to TMDB!`,
        });
      } else {
        // A rejected token usually means the approval expired: re-run the 1-click flow.
        if (res.status === 401 || res.status === 403) clearTmdbWriteToken();
        setSyncStatus({
          success: false,
          message: data.error || 'Write authorization needed from TMDB. Click "1-Click TMDB Authorize" below.',
        });
      }
    } catch (e: any) {
      setSyncStatus({
        success: false,
        message: e?.message || 'Network error communicating with TMDB.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateMoviesList = async () => {
    const savedWriteToken = getTmdbWriteToken();
    if (!savedWriteToken) {
      setSyncStatus({
        success: false,
        message:
          'TMDB needs your permission before StreamPulse can write to a list. Click "1-Click TMDB Authorize" to grant it.',
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await apiFetch('/api/tmdb/create-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writeToken: savedWriteToken,
          name: 'StreamPulse Movies',
          description: 'Movies exported from StreamPulse.',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.listId) {
        const newListId = String(data.listId);
        setTmdbMovieListId(newListId);
        saveTmdbListSettings(tmdbListId.trim(), newListId);
        setSyncStatus({
          success: true,
          message: `Created movies list #${newListId} on TMDB.`,
        });
      } else {
        setSyncStatus({
          success: false,
          message: data.error || 'Could not create a movies list on TMDB.',
        });
      }
    } catch (e: any) {
      setSyncStatus({
        success: false,
        message: e?.message || 'Network error creating the TMDB movies list.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      id="tmdb-sync-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="tmdb-sync-modal"
        className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 text-zinc-100 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[90vh] overflow-y-auto"
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
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-500 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-teal-500/20 shrink-0 text-xl tracking-tighter">
            TMDB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                TMDB Direct Integration
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-bold text-[10px] border border-teal-500/30">
                BYPASS MIDDLEWARE
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Connect StreamPulse directly to The Movie Database (TMDB) and Nuvio
            </p>
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800 flex items-center gap-1">
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'sync'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>1. Sync to TMDB List</span>
          </button>

          <button
            onClick={() => setActiveTab('nuvio')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'nuvio'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>2. Connect to Nuvio</span>
          </button>

          <button
            onClick={() => setActiveTab('shows')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'shows'
                ? 'bg-zinc-800 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Show TMDB IDs</span>
          </button>
        </div>

        {/* Tab 1: Sync to TMDB */}
        {activeTab === 'sync' && (
          <div className="space-y-4">
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Shows / TV TMDB List ID or URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 8249152 or https://www.themoviedb.org/list/8249152"
                    value={tmdbListId}
                    onChange={(e) => setTmdbListId(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-teal-500 transition-all font-mono"
                  />
                  <a
                    href="https://www.themoviedb.org/list/new"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-teal-300 border border-teal-500/30 text-xs font-bold shrink-0 transition-all"
                  >
                    <span>Create on TMDB</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Create a public list at <strong>themoviedb.org</strong> and paste its list ID or link here.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Movies TMDB List ID or URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Optional: enter a movies list ID or create one"
                    value={tmdbMovieListId}
                    onChange={(e) => setTmdbMovieListId(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-teal-500 transition-all font-mono"
                  />
                  <button
                    onClick={handleCreateMoviesList}
                    disabled={isSyncing}
                    className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-teal-300 border border-teal-500/30 text-xs font-bold shrink-0 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>Create movies list</span>
                    <Database className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Leave blank to keep sending movies to your shows / TV list.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>TMDB API Read Access Token (required for sync)</span>
                  <span className="text-[10px] text-zinc-400 font-normal">From themoviedb.org/settings/api</span>
                </label>
                <input
                  type="password"
                  placeholder="Paste your TMDB API Read Access Token, then click 1-Click TMDB Authorize"
                  value={tmdbApiKey}
                  onChange={(e) => setTmdbApiKey(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-teal-500 transition-all font-mono"
                />
              </div>

              {/* Sync Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleSyncToTmdb}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-zinc-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-teal-500/20 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : `Sync ${showCount} Shows + ${movieCount} Movies to TMDB`}</span>
                </button>

                {!pendingRequestToken ? (
                  <button
                    onClick={handleStartTmdbAuth}
                    disabled={isAuthorizing}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-indigo-600/20 shrink-0"
                    title="Authorize write permission on TMDB website with 1 click"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-200" />
                    <span>{isAuthorizing ? 'Opening TMDB...' : '1-Click TMDB Authorize'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteTmdbAuth}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/30 animate-pulse shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Click Here: Complete Sync After Approval</span>
                  </button>
                )}

                {cleanListId && (
                  <a
                    href={`https://www.themoviedb.org/list/${cleanListId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all border border-zinc-700 ml-auto"
                  >
                    <span>Open shows list on TMDB</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                  </a>
                )}
                {cleanMovieListId && (
                  <a
                    href={`https://www.themoviedb.org/list/${cleanMovieListId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all border border-zinc-700"
                  >
                    <span>Open movies list on TMDB</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                  </a>
                )}
              </div>

              {/* Status Display */}
              {syncStatus && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
                    syncStatus.success
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {syncStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <p className="font-semibold">{syncStatus.message}</p>
                    {syncStatus.success && (
                      <p className="text-[11px] text-emerald-400/80">
                        Your TMDB list is now populated. You can connect it directly to Nuvio or Stremio in Tab 2!
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 10-Second Quick Add Helper Box */}
              <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quick Add via TMDB Website (No API Key Required)</span>
                  </div>
                  {cleanListId && (
                    <a
                      href={`https://www.themoviedb.org/list/${cleanListId}/edit`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-teal-300 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Open TMDB List Editor</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  On your open TMDB list page (<strong>List #{cleanListId || '8687068'}</strong>), click the <strong>"Edit"</strong> button right under the title. You can search and add any show with 1 click:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {watchlistedSeries.map((s) => (
                    <a
                      key={s.id}
                      href={s.tmdbId ? `https://www.themoviedb.org/tv/${s.tmdbId}` : `https://www.themoviedb.org/search/tv?query=${encodeURIComponent(s.title)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-200 border border-zinc-700/60 transition-colors"
                    >
                      <span className="font-semibold text-white">{s.title}</span>
                      <span className="text-teal-400 text-[10px]">#{s.tmdbId}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-zinc-400 ml-0.5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Connect directly to Nuvio & Stremio */}
        {activeTab === 'nuvio' && (
          <div className="space-y-4">
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                  <Tv className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Direct TMDB Watchlist &rarr; Nuvio / Stremio
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Bypasses all middleman servers — loads directly from your TMDB account
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
                {/* TMDB Account Watchlist (The recommended way) */}
                <div className="p-3.5 bg-zinc-900 rounded-xl border border-teal-500/40 space-y-2">
                  <div className="font-bold text-teal-300 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-400" />
                      <span>Method 1 (Recommended): Connect TMDB Account Watchlist</span>
                    </div>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-semibold">Active</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    Because your shows (Severance, The Last of Us, Stranger Things) are saved in your personal TMDB account watchlist (<strong>themoviedb.org/u/rezz93/watchlist</strong>), you can link Nuvio directly to your TMDB username:
                  </p>
                  
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2 text-[11px]">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Your TMDB Username:</span>
                      <div className="flex items-center gap-1.5 font-mono text-teal-300 font-bold">
                        <span>rezz93</span>
                        <button
                          onClick={() => handleCopy('rezz93', 'username')}
                          className="p-1 hover:text-white"
                        >
                          {copiedUrl === 'username' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Your TMDB Watchlist URL:</span>
                      <a
                        href="https://www.themoviedb.org/u/rezz93/watchlist?media_type=tv"
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-400 hover:underline flex items-center gap-1 font-mono text-[10px]"
                      >
                        <span>themoviedb.org/u/rezz93/watchlist</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="text-[11px] text-zinc-400 space-y-1 pt-1">
                    <p><strong>In Nuvio or Stremio:</strong></p>
                    <ol className="list-decimal list-inside space-y-0.5 text-zinc-300 ml-1">
                      <li>Go to <strong>Addons</strong> &gt; Install <strong>The Movie Database Addon (TMDB Addon)</strong> or <strong>CyberFlix</strong>.</li>
                      <li>In the addon settings, choose <strong>"Connect TMDB Account"</strong> or enter username <strong>`rezz93`</strong>.</li>
                      <li>Enable <strong>"Watchlist (TV)"</strong> catalog.</li>
                      <li>Done! All 3 series now stream with 1 click from your TV home row.</li>
                    </ol>
                  </div>
                </div>

                {/* Custom List Method */}
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-1.5">
                  <div className="font-bold text-zinc-300 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Method 2: Custom List ID (List #8687068)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    If using CyberFlix custom list catalog, you can also paste your TMDB custom list ID:
                  </p>
                  <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-lg border border-zinc-800 font-mono text-[11px] text-zinc-300">
                    <span>8687068</span>
                    <button
                      onClick={() => handleCopy('8687068', 'listid')}
                      className="ml-auto text-zinc-400 hover:text-white"
                    >
                      {copiedUrl === 'listid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Show TMDB IDs */}
        {activeTab === 'shows' && (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            <p className="text-xs text-zinc-400 mb-2">
              Direct TMDB IDs and web links for every series in your StreamPulse library:
            </p>
            <div className="space-y-2">
              {watchlistedSeries.map((series) => (
                <div
                  key={series.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={series.posterUrl}
                      alt={series.title}
                      className="w-8 h-11 object-cover rounded-md shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">{series.title}</div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                        <span>TMDB: <strong className="text-teal-400">{series.tmdbId || 'Found'}</strong></span>
                        {series.imdbId && <span>IMDb: <strong className="text-amber-400">{series.imdbId}</strong></span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={
                        series.tmdbId
                          ? `https://www.themoviedb.org/tv/${series.tmdbId}`
                          : `https://www.themoviedb.org/search/tv?query=${encodeURIComponent(series.title)}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-teal-300 font-semibold text-[11px] border border-teal-500/30 transition-colors"
                    >
                      <span>TMDB Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
