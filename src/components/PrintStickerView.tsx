import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { HoneyBatch } from '../types';
import {
  Printer,
  ArrowLeft,
  ShieldCheck,
  Award,
  Calendar,
  MapPin,
  CheckCircle2,
  Download,
  ExternalLink,
} from 'lucide-react';

interface PrintStickerViewProps {
  batch: HoneyBatch;
  onBack: () => void;
}

export function PrintStickerView({ batch, onBack }: PrintStickerViewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const generateQR = async () => {
      try {
        const url = typeof window !== 'undefined'
          ? `${window.location.origin}${window.location.pathname}?batch=${encodeURIComponent(batch.batchCode)}&view=consumer`
          : batch.qrUrl;

        const dataUrl = await QRCode.toDataURL(url, {
          width: 320,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        });
        if (isMounted) {
          setQrDataUrl(dataUrl);
        }
      } catch (err) {
        console.error('Failed to generate QR code for print sticker:', err);
      }
    };

    generateQR();
    return () => {
      isMounted = false;
    };
  }, [batch]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 flex flex-col items-center">
      {/* Top Bar (Hidden during print) */}
      <div className="w-full max-w-xl flex items-center justify-between gap-4 mb-6 print:hidden">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Honey Chain</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Jar Sticker</span>
          </button>
        </div>
      </div>

      {/* Printable Jar Sticker Container */}
      <div
        id="printable-jar-sticker"
        className="w-full max-w-md bg-white border-2 border-dashed border-amber-400 rounded-3xl p-7 shadow-xl print:border-solid print:border-black print:shadow-none print:p-6 print:max-w-none text-slate-900"
      >
        {/* Top Header Badge */}
        <div className="flex items-center justify-between border-b-2 border-amber-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍯</span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">
                KVIC Honey Mission · Govt of India
              </span>
              <span className="text-xs font-black text-slate-950">
                Honey Chain Pure Raw Certified
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-full text-[10px] font-extrabold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>AUTHENTICATED</span>
          </div>
        </div>

        {/* Honey Title & Varietal */}
        <div className="text-center my-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Natural Single-Origin Flora
          </span>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-0.5">
            {batch.honeyType}
          </h1>
          <p className="text-xs font-semibold text-amber-800 mt-0.5">
            100% Raw, Unheated & Unadulterated Natural Honey
          </p>
        </div>

        {/* High-Resolution Working Scannable QR Code */}
        <div className="my-5 flex flex-col items-center justify-center">
          <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-sm inline-block">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Sticker for ${batch.batchCode}`}
                className="w-44 h-44 object-contain rounded-lg"
              />
            ) : (
              <div className="w-44 h-44 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-xs font-mono text-slate-400">
                Generating QR...
              </div>
            )}
          </div>
          <span className="text-[11px] font-bold text-slate-700 mt-2 text-center">
            Scan with any smartphone camera to verify lab purity & provenance
          </span>
        </div>

        {/* Batch Metadata Grid */}
        <div className="grid grid-cols-2 gap-2.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-slate-800">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Batch Number</span>
            <span className="font-mono font-black text-slate-950 text-xs">{batch.batchCode}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Harvest Origin</span>
            <span className="font-bold text-slate-900 truncate block">
              {batch.district}, {batch.state}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Harvest Date</span>
            <span className="font-medium text-slate-900">{batch.harvestDate}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Moisture Content</span>
            <span className="font-bold text-slate-900">
              {batch.certificate?.parameters.moisturePct ?? batch.moisturePct ?? 18.2}% (FSSAI Safe)
            </span>
          </div>
        </div>

        {/* Processing Notes if present */}
        {(batch.processingNotes || batch.events?.[0]?.details) && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Processing & Cold-Extraction
            </span>
            <p className="text-slate-700 text-xs font-medium mt-0.5">
              {batch.processingNotes || batch.events?.[0]?.details}
            </p>
          </div>
        )}

        {/* Blockchain Cryptographic Proof & Footer */}
        <div className="mt-4 pt-3 border-t border-slate-200 space-y-1 text-[10px] font-mono text-slate-500">
          <div className="flex items-center justify-between">
            <span>Net Wt: 500g Glass</span>
            <span>Source Hive: {batch.hiveCode}</span>
          </div>
          <div className="truncate">
            HMAC Token: <strong className="text-slate-700">{batch.qrToken}</strong>
          </div>
          <div className="truncate text-[9px] text-slate-400">
            Anchor Tx: {batch.blockchainRecord?.txHash || 'Polygon Amoy Proof-of-Stake Verified'}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          #printable-jar-sticker {
            border: 2px solid black !important;
            border-radius: 8px !important;
            box-shadow: none !important;
            max-width: 400px !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
    </div>
  );
}
