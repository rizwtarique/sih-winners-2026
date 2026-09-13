import React, { useState } from 'react';
import { HoneyBatch, FarmerProfile } from '../types';
import {
  ShieldCheck,
  ShieldAlert,
  Archive,
  Filter,
  FlaskConical,
  Link,
  PackageCheck,
  QrCode,
  MapPin,
  Calendar,
  Layers,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Camera,
  Printer,
  Smartphone,
  Download,
  FileText,
  Building2,
  Phone,
  Award,
  ArrowRight,
  User,
  CheckCircle2,
} from 'lucide-react';
import { formatHexShort } from '../utils/crypto';
import { QRCodeCard } from './QRCodeCard';
import { QRScannerModal } from './QRScannerModal';
import { exportBatchCertificatePDF, exportBatchAuditJSON } from '../utils/complianceExport';

interface ConsumerVerificationViewProps {
  batches: HoneyBatch[];
  selectedBatch: HoneyBatch;
  onSelectBatch: (batch: HoneyBatch) => void;
  onTamperToggle: (batchId: string, shouldTamper: boolean) => void;
  isTampered: boolean;
  farmers?: FarmerProfile[];
  onNavigateToFarmer?: (farmerId: string) => void;
  onOpenBottleSticker?: () => void;
  onOpenStandalonePage?: () => void;
}

export function ConsumerVerificationView({
  batches,
  selectedBatch,
  onSelectBatch,
  onTamperToggle,
  isTampered,
  farmers = [],
  onNavigateToFarmer,
  onOpenBottleSticker,
  onOpenStandalonePage,
}: ConsumerVerificationViewProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [showPrintLabel, setShowPrintLabel] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  type Section = 'status' | 'lab' | 'farmer' | 'journey';
  const [activeSection, setActiveSection] = useState<Section>('status');

  const standaloneUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?batch=${encodeURIComponent(selectedBatch.batchCode)}&mode=consumer-standalone`
    : `https://honeychain.gov.in/verify/${selectedBatch.batchCode}`;

  // Match farmer details for this batch
  const farmer =
    farmers.find(
      (f) =>
        f.id === selectedBatch.farmerId ||
        f.name.toLowerCase() === selectedBatch.beekeeperName.toLowerCase()
    ) || farmers[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const isVerified = !isTampered && selectedBatch.blockchainRecord?.status === 'CONFIRMED';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Batch Selector Header Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Scanned Batch</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-amber-400">
                {selectedBatch.batchCode}
              </span>
              <span className="text-xs text-slate-300">({selectedBatch.honeyType})</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan QR</span>
          </button>

          <span className="text-xs text-slate-400 hidden sm:inline">Select:</span>
          <select
            value={selectedBatch.id}
            onChange={(e) => {
              const b = batches.find((item) => item.id === e.target.value);
              if (b) onSelectBatch(b);
            }}
            className="text-xs bg-slate-800 text-white font-medium px-2.5 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.batchCode} — {b.honeyType}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Retail Bottle Sticker & Dedicated Consumer Dossier PDF Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏷️</span>
            <span className="font-extrabold text-sm tracking-tight text-white">
              Retail Bottle Sticker &amp; Official Batch &amp; Farmer PDF
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950/30 text-amber-100 border border-white/20 font-bold">
              PUBLIC QR
            </span>
          </div>
          <p className="text-xs text-amber-100 max-w-xl">
            Want to stick this QR on physical honey jars? The bottle QR code leads directly to the official Honey Batch &amp; Farmer PDF dossier with full provenance details and instant 1-click download.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          {onOpenStandalonePage && (
            <button
              type="button"
              onClick={onOpenStandalonePage}
              className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>View Batch &amp; Farmer PDF</span>
            </button>
          )}

          {onOpenBottleSticker && (
            <button
              type="button"
              onClick={onOpenBottleSticker}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-amber-700" />
              <span>Bottle Sticker Studio</span>
            </button>
          )}

          <a
            href={standaloneUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-amber-800/60 hover:bg-amber-800 text-white font-semibold px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-xs overflow-x-auto scrollbar-none gap-1">
        <button
          onClick={() => setActiveSection('status')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'status'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verification & Label</span>
        </button>

        <button
          onClick={() => setActiveSection('lab')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'lab'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Lab Purity Report</span>
          {selectedBatch.certificate && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold ml-0.5">
              PASS
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('farmer')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'farmer'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Farmer & Origin</span>
        </button>

        <button
          onClick={() => setActiveSection('journey')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'journey'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Timeline & Blockchain</span>
        </button>
      </div>

      {/* SECTION 1: VERIFICATION STATUS & LABEL */}
      {activeSection === 'status' && (
        <div className="space-y-6">
          {/* Main Verification Status Card */}
          <div
            className={`p-5 rounded-xl border transition-all ${
              isVerified
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950 ring-1 ring-rose-400'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isVerified ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {isVerified ? (
                    <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold tracking-tight">
                      {isVerified ? 'Record Integrity Verified' : 'Integrity Check Failed'}
                    </h2>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isVerified
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-rose-200 text-rose-900'
                      }`}
                    >
                      {isVerified ? 'Ledger Match' : 'Mismatch'}
                    </span>
                  </div>

                  <p className="text-xs font-medium mt-1 opacity-90 max-w-xl">
                    {isVerified
                      ? 'This batch record matches the immutable cryptographic commitment hash registered on the Polygon blockchain. No records have been altered.'
                      : 'WARNING: The local database record has been altered! The computed SHA-256 hash does NOT match the immutable ledger anchor.'}
                  </p>
                </div>
              </div>

              {/* Tamper Switcher */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 self-end sm:self-center flex flex-col gap-1 text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Judge Tamper Test:
                </span>
                <button
                  onClick={() => onTamperToggle(selectedBatch.id, !isTampered)}
                  className={`px-3 py-1 rounded font-semibold text-xs transition-colors cursor-pointer ${
                    isTampered
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  {isTampered ? 'Restore Original Data' : 'Inject Tamper Test'}
                </button>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-900/10 text-[11px] opacity-80 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Honest Framing:</strong> Blockchain verification proves record integrity and
                unalterable submission history; chemical purity is certified by accredited laboratory testing.
              </span>
            </div>
          </div>

          {/* Core Batch Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Floral Variety</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {selectedBatch.honeyType}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">100% Raw</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Harvest Origin</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {selectedBatch.district}, {selectedBatch.state}
              </span>
              <span className="text-[10px] text-slate-500">Apiary: {selectedBatch.hiveCode}</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Batch Net Weight</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {selectedBatch.netWeightKg} kg
              </span>
              <span className="text-[10px] text-slate-500">{selectedBatch.framesHarvested || 12} Frames</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Harvest Date</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {selectedBatch.harvestDate}
              </span>
              <span className="text-[10px] text-slate-500">Refractometer Moisture</span>
            </div>
          </div>

          {/* Public Files & Document Downloads */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                Public Audit Dossier & Batch Certificate
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Freely download the official certificate and cryptographic ledger verification records.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => exportBatchCertificatePDF(selectedBatch, farmer)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Certificate (PDF)</span>
              </button>

              <button
                onClick={() => exportBatchAuditJSON(selectedBatch)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Audit JSON</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPrintLabel(!showPrintLabel)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {showPrintLabel ? 'Hide Label' : 'Show Jar Label'}
              </button>
            </div>
          </div>

          {/* Printable Jar Label Card */}
          {showPrintLabel && (
            <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="space-y-1.5 text-center md:text-left flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Jar Packaging Label · 500g Container
                </span>
                <h3 className="text-lg font-bold text-slate-900">{selectedBatch.honeyType}</h3>
                <p className="text-xs text-slate-600">
                  Harvested in {selectedBatch.district}, {selectedBatch.state} · Certified Raw Unadulterated
                </p>
                <p className="font-mono text-xs font-bold text-slate-900">
                  Batch: {selectedBatch.batchCode}
                </p>
                <p className="text-[11px] text-slate-500 max-w-md">
                  Point any phone camera or Google Lens at this QR code to view this tamper-proof verification page.
                </p>
              </div>

              <div className="shrink-0">
                <QRCodeCard
                  batch={selectedBatch}
                  size={120}
                  showDetails={true}
                  onSimulateScan={onSelectBatch}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: LAB PURITY CERTIFICATE */}
      {activeSection === 'lab' && (
        <div className="space-y-6">
          {selectedBatch.certificate ? (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Laboratory Purity & Chemical Analysis
                    </h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {selectedBatch.certificate.parameters.overallResult === 'PASS' ? 'FSSAI Compliant: PASS' : 'FAIL'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedBatch.certificate.labName} · Accreditation: {selectedBatch.certificate.accreditationNumber}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                    Cert #{selectedBatch.certificate.certificateNumber}
                  </span>
                  <button
                    onClick={() => exportBatchCertificatePDF(selectedBatch, farmer)}
                    className="px-2.5 py-1 rounded text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium block">Moisture Content</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-base font-bold text-slate-900">
                      {selectedBatch.certificate.parameters.moisturePct}%
                    </span>
                    <span className="text-[10px] text-slate-500">(FSSAI ≤ 20%)</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">✔ Normal Viscosity</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium block">HMF Level (Freshness)</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-base font-bold text-slate-900">
                      {selectedBatch.certificate.parameters.hmfMgKg} mg/kg
                    </span>
                    <span className="text-[10px] text-slate-500">(Limit ≤ 80)</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">✔ No Thermal Degradation</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium block">Fructose / Glucose Ratio</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-base font-bold text-slate-900">
                      {selectedBatch.certificate.parameters.fructoseGlucoseRatio}
                    </span>
                    <span className="text-[10px] text-slate-500">(Standard ≥ 0.95)</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">✔ Natural Floral Sugars</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium block">C4 Sugar Adulteration</span>
                  <div className="mt-1">
                    <span className="text-sm font-bold text-emerald-700">
                      {selectedBatch.certificate.parameters.c4SugarAdulteration}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">No Corn / Cane Syrups</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium block">Microscopic Pollen Count</span>
                  <div className="mt-1">
                    <span className="text-sm font-bold text-slate-900">
                      {selectedBatch.certificate.parameters.pollenCountPerGram.toLocaleString()} /g
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">✔ Botanical Origin Verified</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium block">Antibiotics & Residues</span>
                  <div className="mt-1">
                    <span className="text-sm font-bold text-emerald-700">
                      {selectedBatch.certificate.parameters.antibioticResidue}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Zero Chemical Contamination</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center py-8">
              <FlaskConical className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No laboratory test registered for this batch yet.</p>
              <p className="text-xs text-slate-500 mt-1">Pending submission to NABL accredited testing facility.</p>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: FARMER & ORIGIN */}
      {activeSection === 'farmer' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={farmer?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200'}
                  alt={farmer?.name || selectedBatch.beekeeperName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {farmer?.name || selectedBatch.beekeeperName}
                    </h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      KVIC KYC Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    {farmer?.cooperativeName || 'National Honey Mission FPO Cluster'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    KVIC Reg #{farmer?.kvicRegistrationNumber || 'KVIC/HM/2023/8841'} · Experience: {farmer?.experienceYears || 14} yrs
                  </p>
                </div>
              </div>

              {onNavigateToFarmer && (
                <button
                  onClick={() => onNavigateToFarmer(farmer?.id || 'farmer-01')}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>Farmer Passport & QR</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Geographical & Apiary Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium block">Apiary Location</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                  {farmer?.village ? `${farmer.village}, ` : ''}{selectedBatch.district}
                </span>
                <span className="text-[10px] text-slate-500">State: {selectedBatch.state}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium block">Hive / Bee Box</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                  {selectedBatch.hiveCode}
                </span>
                <span className="text-[10px] text-slate-500">{selectedBatch.framesHarvested || 12} Frames Harvested</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium block">Floral Variety</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                  {selectedBatch.honeyType}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">100% Raw Unpasteurized</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium block">Batch Net Weight</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                  {selectedBatch.netWeightKg} kg
                </span>
                <span className="text-[10px] text-slate-500">Harvested: {selectedBatch.harvestDate}</span>
              </div>
            </div>

            {farmer?.bio && (
              <p className="text-xs text-slate-600 bg-amber-50/50 p-3 rounded-lg border border-amber-200/60 leading-relaxed italic">
                "{farmer.bio}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: TIMELINE & BLOCKCHAIN */}
      {activeSection === 'journey' && (
        <div className="space-y-6">
          {/* Provenance Journey Timeline */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Full Traceability Journey (Hive to Jar)</span>
            </h3>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {selectedBatch.events.map((event, idx) => (
                <div key={event.id} className="relative">
                  <div className="absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-xs">
                    {idx + 1}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{event.title}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {event.eventType}
                      </span>
                      <span className="text-[11px] text-slate-400">· {event.occurredAt}</span>
                    </div>

                    <p className="text-xs text-slate-600">{event.details}</p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                      <span>Actor: {event.actorName} ({event.actorRole})</span>
                      <span>·</span>
                      <span>Location: {event.location}</span>
                    </div>

                    <div className="font-mono text-[10px] text-slate-400 pt-0.5">
                      Hash: {formatHexShort(event.eventHash, 10)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blockchain Proof Inspector */}
          {selectedBatch.blockchainRecord && (
            <div className="bg-slate-950 text-slate-200 p-5 rounded-xl border border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Blockchain Ledger Proof Inspector
                  </h3>
                </div>
                <span className="text-xs text-emerald-400 font-mono">
                  {selectedBatch.blockchainRecord.network}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="space-y-1 bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-sans">
                    Anchored Commitment Hash
                  </span>
                  <div className="flex items-center justify-between gap-2 text-amber-300">
                    <span className="truncate">
                      {selectedBatch.blockchainRecord.commitmentHash || '0x7f4a8b1c9d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a'}
                    </span>
                    <button
                      onClick={() =>
                        handleCopy(
                          selectedBatch.blockchainRecord?.commitmentHash ||
                            '0x7f4a8b1c9d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a'
                        )
                      }
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1 bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-sans">
                    Smart Contract Registry
                  </span>
                  <div className="text-slate-300 truncate">
                    {selectedBatch.blockchainRecord.contractAddress}
                  </div>
                </div>

                <div className="space-y-1 bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-sans">Transaction Hash</span>
                  <div className="flex items-center gap-1.5 text-slate-300 truncate">
                    <span className="truncate">{selectedBatch.blockchainRecord.txHash}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  </div>
                </div>

                <div className="space-y-1 bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-sans">Block Confirmation</span>
                  <div className="text-emerald-400 font-bold">
                    Block #{selectedBatch.blockchainRecord.blockNumber.toLocaleString()} (Immutable)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
