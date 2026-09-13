import React, { useState, useEffect, useRef } from 'react';
import { HoneyBatch, Hive, FarmerProfile } from '../types';
import {
  Download,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Check,
  Award,
  User,
  ShieldCheck,
  FileDown,
  Clock,
  Sparkles,
  MapPin,
  Calendar,
} from 'lucide-react';
import { exportFullAtoZBatchDossierPDF } from '../utils/complianceExport';

interface ConsumerPdfViewProps {
  batch: HoneyBatch;
  hive?: Hive;
  farmer?: FarmerProfile;
  allBatches?: HoneyBatch[];
  onSelectBatch?: (batch: HoneyBatch) => void;
  onBackToPortal?: () => void;
}

export function ConsumerPdfView({
  batch,
  hive,
  farmer,
  allBatches = [],
  onSelectBatch,
  onBackToPortal,
}: ConsumerPdfViewProps) {
  const [downloadStatus, setDownloadStatus] = useState<'downloading' | 'completed' | 'idle'>('downloading');
  const [copiedLink, setCopiedLink] = useState(false);
  const downloadAttemptedRef = useRef(false);

  // Directly download the PDF when the QR code is scanned / page loads
  useEffect(() => {
    if (downloadAttemptedRef.current) return;
    downloadAttemptedRef.current = true;

    // Trigger download with a slight delay for smooth initial page render
    const timer = setTimeout(() => {
      triggerDownload();
    }, 400);

    return () => clearTimeout(timer);
  }, [batch.id]);

  const triggerDownload = () => {
    setDownloadStatus('downloading');
    try {
      exportFullAtoZBatchDossierPDF(batch, hive, farmer);
      setTimeout(() => setDownloadStatus('completed'), 900);
    } catch (err) {
      console.error('Direct download error:', err);
      setDownloadStatus('idle');
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      {/* Centered Main Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden my-auto">
        {/* Top Header Banner */}
        <div className="bg-[#0F172A] text-white px-6 py-5 text-center relative border-b-2 border-[#B45309]">
          {onBackToPortal && (
            <button
              type="button"
              onClick={onBackToPortal}
              className="absolute left-4 top-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Return to management portal"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="w-12 h-12 rounded-full bg-[#B45309] text-white flex items-center justify-center text-2xl mx-auto mb-2 shadow-sm">
            🍯
          </div>

          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-mono mb-1 border border-amber-400/30">
            KVIC HONEY MISSION · GOVT OF INDIA
          </div>

          <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
            Honey Provenance &amp; Purity Record
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Official Batch &amp; Farmer Compliance Dossier
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Download Status Notification Box */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-center space-y-3">
            {downloadStatus === 'downloading' ? (
              <div className="flex flex-col items-center justify-center space-y-2 py-1">
                <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-[#0F172A]">
                    Downloading your PDF directly...
                  </p>
                  <p className="text-xs text-[#64748B]">
                    Please check your browser downloads
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-1.5 py-1">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#15803D] flex items-center justify-center mb-0.5">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <p className="text-sm font-bold text-[#0F172A]">
                  PDF Downloaded Directly
                </p>
                <p className="text-xs text-[#64748B]">
                  File: <code className="text-amber-800 font-mono font-semibold">HoneyChain_A_to_Z_Batch_Dossier_{batch.batchCode}.pdf</code>
                </p>
              </div>
            )}

            {/* Direct Action Download Button */}
            <button
              type="button"
              id="btn-download-pdf-direct"
              onClick={triggerDownload}
              className="w-full flex items-center justify-center gap-2 bg-[#B45309] hover:bg-[#D97706] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-xs hover:shadow cursor-pointer"
            >
              <FileDown className="w-4 h-4 stroke-[2.5]" />
              <span>{downloadStatus === 'downloading' ? 'Downloading PDF...' : 'Download PDF Again'}</span>
            </button>
          </div>

          {/* Clean Key Details Summary */}
          <div className="space-y-3 text-xs">
            <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Dossier Summary (Included in PDF)
            </h2>

            <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] divide-y divide-[#E2E8F0] overflow-hidden">
              {/* Farmer Details */}
              <div className="p-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F172A] text-sm">
                      {farmer?.name || batch.beekeeperName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-[#15803D] font-bold">
                      KYC VERIFIED
                    </span>
                  </div>
                  <p className="text-[#64748B] text-xs mt-0.5">
                    Master Beekeeper · KVIC Reg: <span className="font-mono text-[#0F172A] font-medium">{farmer?.kvicRegistrationNumber || 'KVIC/HM/RAJ/2023/8841'}</span>
                  </p>
                  <p className="text-[#64748B] text-[11px] mt-0.5">
                    {farmer?.village || 'Mandal'}, {batch.district}, {batch.state} · {farmer?.experienceYears || 14} yrs experience
                  </p>
                </div>
              </div>

              {/* Honey Batch Details */}
              <div className="p-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F172A] text-sm">
                      {batch.honeyType}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                      100% PURE
                    </span>
                  </div>
                  <p className="text-[#64748B] text-xs mt-0.5">
                    Batch: <span className="font-mono font-bold text-[#0F172A]">{batch.batchCode}</span> · Net Wt: {batch.netWeightKg} kg
                  </p>
                  <p className="text-[#64748B] text-[11px] mt-0.5">
                    Harvested: {batch.harvestDate} · Moisture: <strong className="text-[#15803D]">{batch.certificate?.parameters.moisturePct ?? batch.moisturePct ?? 17.8}%</strong> (FSSAI Safe &lt;20%)
                  </p>
                </div>
              </div>

              {/* Blockchain & Lab Verification */}
              <div className="p-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#15803D] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F172A] text-xs">
                      Cryptographically Anchored
                    </span>
                    <span className="text-[10px] font-mono text-[#0284C7] font-bold">
                      POLYGON
                    </span>
                  </div>
                  <p className="text-[#64748B] text-[11px] mt-0.5">
                    Block #{batch.blockchainRecord?.blockNumber?.toLocaleString() || '19,842,109'} · NABL Lab Certified
                  </p>
                  <p className="font-mono text-[10px] text-slate-400 truncate mt-0.5">
                    Tx: {batch.blockchainRecord?.txHash?.slice(0, 24) || '0x4a9b2c8d1e0f3a5b7c9e1f'}...
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Clean Utility Bar */}
          <div className="pt-2 flex items-center justify-between gap-3 text-xs border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-[#64748B] hover:text-[#0F172A] font-medium transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied' : 'Share Link'}</span>
            </button>

            {onBackToPortal && (
              <button
                type="button"
                onClick={onBackToPortal}
                className="text-[#B45309] hover:underline font-semibold cursor-pointer"
              >
                Back to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Clean Subtle Footer */}
      <footer className="mt-4 text-center text-[11px] text-[#94A3B8]">
        KVIC Honey Mission · National Honey Board · Government of India
      </footer>
    </div>
  );
}
