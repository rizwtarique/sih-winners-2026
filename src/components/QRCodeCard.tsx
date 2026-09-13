import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { HoneyBatch } from '../types';
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Sparkles,
  ShieldCheck,
  Printer,
  Smartphone,
} from 'lucide-react';

interface QRCodeCardProps {
  batch: HoneyBatch;
  size?: number;
  showDetails?: boolean;
  onSimulateScan?: (batch: HoneyBatch) => void;
  className?: string;
}

export function QRCodeCard({
  batch,
  size = 180,
  showDetails = true,
  onSimulateScan,
  className = '',
}: QRCodeCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [useLiveUrl, setUseLiveUrl] = useState<boolean>(true);

  // Compute the URL that will be encoded into the QR code
  const getVerificationUrl = () => {
    if (typeof window !== 'undefined' && useLiveUrl) {
      const base = `${window.location.origin}${window.location.pathname}`;
      return `${base}?batch=${encodeURIComponent(batch.batchCode)}&mode=consumer-standalone`;
    }
    return batch.qrUrl || `https://honeychain.gov.in/verify/${batch.batchCode}`;
  };

  const currentUrl = getVerificationUrl();

  useEffect(() => {
    let isMounted = true;
    const generateQR = async () => {
      try {
        const url = getVerificationUrl();
        const dataUrl = await QRCode.toDataURL(url, {
          width: size * 2, // 2x for retina display clarity
          margin: 1,
          color: {
            dark: '#0f172a', // Slate 900
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        });
        if (isMounted) {
          setQrDataUrl(dataUrl);
        }
      } catch (err) {
        console.error('Failed to generate QR code:', err);
      }
    };

    generateQR();
    return () => {
      isMounted = false;
    };
  }, [batch.batchCode, batch.qrUrl, size, useLiveUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `honeychain-qr-${batch.batchCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    const printUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?view=print-sticker&batch=${encodeURIComponent(batch.batchCode)}`
      : '';

    if (printUrl) {
      const printWindow = window.open(printUrl, '_blank');
      if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
        window.location.href = printUrl;
      }
    }
  };

  return (
    <div className={`flex flex-col items-center bg-white rounded-2xl p-4 border border-slate-200 shadow-sm ${className}`}>
      {/* Visual QR Code Container */}
      <div className="relative group p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`QR Code for ${batch.batchCode}`}
            style={{ width: `${size}px`, height: `${size}px` }}
            className="rounded-lg object-contain transition-transform group-hover:scale-102"
          />
        ) : (
          <div
            style={{ width: `${size}px`, height: `${size}px` }}
            className="flex items-center justify-center bg-slate-100 rounded-lg animate-pulse text-slate-400"
          >
            <QrCode className="w-8 h-8 animate-spin" />
          </div>
        )}

        {/* Center Logo Shield Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white shadow-md flex items-center justify-center text-slate-950 font-black text-xs">
            🐝
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="w-full mt-3 space-y-2 text-center">
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                {batch.batchCode}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Valid QR
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-center gap-1">
              <Smartphone className="w-3 h-3 text-amber-600" />
              <span>Real scannable link — point phone camera to test!</span>
            </p>
          </div>

          {/* Target URL Display & Toggle */}
          <div className="text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200 text-left font-mono break-all text-slate-600">
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200 text-[10px]">
              <span className="font-sans font-bold text-slate-500">Target URL:</span>
              <button
                type="button"
                onClick={() => setUseLiveUrl(!useLiveUrl)}
                className="text-amber-700 hover:text-amber-900 font-sans font-semibold underline cursor-pointer"
              >
                {useLiveUrl ? 'Use Gov Registry URL' : 'Use Live Preview Link'}
              </button>
            </div>
            <span className="text-slate-700 line-clamp-2">{currentUrl}</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadQR}
              className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Save PNG</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Sticker</span>
            </button>

            {onSimulateScan && (
              <button
                type="button"
                onClick={() => onSimulateScan(batch)}
                className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Test Scan</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
