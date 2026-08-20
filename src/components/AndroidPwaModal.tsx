import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Smartphone,
  X,
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
  Sparkles,
  Users,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface AndroidPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUrl?: string;
}

export const AndroidPwaModal: React.FC<AndroidPwaModalProps> = ({
  isOpen,
  onClose,
  defaultUrl,
}) => {
  // Pre-release/Shared link vs Dev link
  const SHARED_APP_URL = 'https://ais-pre-vysbxtuht4wcon3b3tonzb-116799203877.us-east1.run.app';
  const DEV_APP_URL = 'https://ais-dev-vysbxtuht4wcon3b3tonzb-116799203877.us-east1.run.app';

  const [linkMode, setLinkMode] = useState<'shared' | 'owner'>('shared');
  const [copied, setCopied] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  const activeUrl = linkMode === 'shared' ? SHARED_APP_URL : (defaultUrl || DEV_APP_URL);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div
      id="android-pwa-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="android-pwa-modal"
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 text-zinc-100 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[90vh] overflow-y-auto"
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
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Android PWA & Mobile QR
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                PWA READY
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Install and run StreamPulse standalone on any Android phone or tablet
            </p>
          </div>
        </div>

        {/* Link Mode Switcher */}
        <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800 flex items-center gap-1">
          <button
            onClick={() => setLinkMode('shared')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              linkMode === 'shared'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Shared / Family Link (Wife & Guests)</span>
          </button>

          <button
            onClick={() => setLinkMode('owner')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              linkMode === 'owner'
                ? 'bg-zinc-800 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Owner Dev Preview</span>
          </button>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-zinc-200 shadow-inner">
          <div className="p-2 bg-white rounded-xl">
            <QRCodeSVG
              value={activeUrl}
              size={190}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#09090b"
            />
          </div>

          <p className="text-xs font-bold text-zinc-800 mt-2 text-center">
            {linkMode === 'shared'
              ? 'Scan with Android Camera (for Invited Family / Shared Users)'
              : 'Scan with Android Camera (for Owner Account)'}
          </p>
        </div>

        {/* Why 404 happens note for Shared Users */}
        {linkMode === 'shared' ? (
          <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1.5 text-xs text-indigo-200">
            <div className="flex items-center gap-2 font-bold text-indigo-300">
              <Share2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>For Your Wife's Tablet / Shared Access:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-300">
              1. Ensure you clicked <strong>Share</strong> in AI Studio top bar and published the snapshot for her Google email.
              <br />
              2. Her tablet will access the <code>ais-pre-...</code> URL (scanned above) which is authorized for shared users. (The <code>ais-dev-...</code> developer link is blocked by Cloud Run for non-owner accounts).
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Note:</strong> The Owner Dev link only opens when signed in to your primary Google account. Sending this link to others will result in a 404.
            </p>
          </div>
        )}

        {/* Direct Install prompt button if supported */}
        {deferredPrompt && !isInstalled && (
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Install StreamPulse to Android Home Screen</span>
          </button>
        )}

        {/* URL Sharing / Copy Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>{linkMode === 'shared' ? 'Shared User URL to send via Messenger:' : 'Dev URL:'}</span>
            {copied && <span className="text-emerald-400 font-bold">Copied to clipboard!</span>}
          </div>

          <div className="flex items-center gap-2 bg-zinc-950 p-1.5 pl-3 rounded-xl border border-zinc-800">
            <input
              type="text"
              readOnly
              value={activeUrl}
              className="bg-transparent text-xs text-zinc-300 w-full outline-hidden font-mono truncate"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold shrink-0 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* 3-Step Android Installation Guide */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>How to install on Android in 3 steps:</span>
          </h4>

          <ol className="space-y-2 text-xs text-zinc-300">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-zinc-800 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-zinc-700">
                1
              </span>
              <span>
                <strong>Scan the QR code</strong> (or open the shared link sent via Messenger) in <strong>Google Chrome</strong> on the tablet.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-zinc-800 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-zinc-700">
                2
              </span>
              <span>
                Tap the <strong>⋮ (three dots)</strong> menu in the upper right of Chrome.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-zinc-800 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-zinc-700">
                3
              </span>
              <span>
                Tap <strong>"Install app"</strong> (or "Add to Home screen").
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
