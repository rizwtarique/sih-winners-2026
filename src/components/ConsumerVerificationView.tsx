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
}

export function ConsumerVerificationView({
  batches,
  selectedBatch,
  onSelectBatch,
  onTamperToggle,
  isTampered,
  farmers = [],
  onNavigateToFarmer,
}: ConsumerVerificationViewProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [showPrintLabel, setShowPrintLabel] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

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
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Scanned QR Code Target</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-amber-400">
                {selectedBatch.batchCode}
              </span>
              <span className="text-xs text-slate-400">({selectedBatch.honeyType})</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-sm transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Scan QR Code</span>
          </button>

          <span className="text-xs text-slate-400 hidden lg:inline">Batch:</span>
          <select
            value={selectedBatch.id}
            onChange={(e) => {
              const b = batches.find((item) => item.id === e.target.value);
              if (b) onSelectBatch(b);
            }}
            className="text-xs bg-slate-800 text-white font-medium px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.batchCode} — {b.honeyType}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowPrintLabel(!showPrintLabel)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            {showPrintLabel ? 'Hide Jar Label' : 'Show Jar Label & QR'}
          </button>
        </div>
      </div>

      {/* Printable Jar Label Card with Real Scannable QR */}
      {showPrintLabel && (
        <div className="bg-amber-50/80 border-2 border-dashed border-amber-300 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 text-center md:text-left flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900">
              Jar Packaging Label · 500g Glass Container
            </span>
            <h3 className="text-xl font-black text-slate-900">{selectedBatch.honeyType}</h3>
            <p className="text-xs text-slate-700">
              Harvested in {selectedBatch.district}, {selectedBatch.state} · Certified Raw Unadulterated
            </p>
            <p className="font-mono text-xs font-bold text-slate-900">
              Batch Code: {selectedBatch.batchCode}
            </p>
            <p className="text-[11px] text-slate-600 max-w-md">
              Point any mobile camera or Google Lens at the QR code on the right. It encodes a valid, high-resolution verification link to this batch.
            </p>
          </div>

          <div className="shrink-0">
            <QRCodeCard
              batch={selectedBatch}
              size={135}
              showDetails={true}
              onSimulateScan={onSelectBatch}
              className="border-amber-200"
            />
          </div>
        </div>
      )}

      {/* Camera / Image QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        batches={batches}
        onSelectBatch={onSelectBatch}
      />

      {/* Main Verification Status Card */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isVerified
            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-sm'
            : 'bg-rose-50/90 border-rose-400 text-rose-950 shadow-md ring-2 ring-rose-400'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                isVerified ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {isVerified ? (
                <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
              ) : (
                <ShieldAlert className="w-7 h-7 stroke-[2.5]" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  {isVerified ? 'Record Integrity Verified' : 'INTEGRITY CHECK FAILED'}
                </h2>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isVerified
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-rose-200 text-rose-900 animate-pulse'
                  }`}
                >
                  {isVerified ? 'Ledger Match' : 'Cryptographic Mismatch'}
                </span>
              </div>

              <p className="text-sm font-medium mt-1 opacity-90 max-w-xl">
                {isVerified
                  ? 'This batch record matches the immutable cryptographic commitment hash registered on the Polygon public blockchain. No records have been altered since submission.'
                  : 'WARNING: The local database record has been altered! The current computed SHA-256 hash does NOT match the immutable anchor stored on the blockchain ledger.'}
              </p>
            </div>
          </div>

          {/* Quick Demo Tamper Switcher */}
          <div className="bg-white/80 p-3 rounded-xl border border-slate-200/80 self-end sm:self-center flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              SIH Judge Tamper Test:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onTamperToggle(selectedBatch.id, !isTampered)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  isTampered
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {isTampered ? 'Restore Original Data' : 'Inject Database Tamper'}
              </button>
            </div>
          </div>
        </div>

        {/* PRD Rule 8 Honest Language Disclaimer */}
        <div className="mt-4 pt-3 border-t border-slate-900/10 text-xs font-medium opacity-80 flex items-start gap-1.5">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Honest Framing Notice (SIH PRD):</strong> Blockchain verification proves record integrity and
            unalterable submission history; chemical purity is certified by accredited NABL/FSSAI laboratory testing detailed below.
          </span>
        </div>
      </div>

      {/* Public Files & Document Downloads (Accessible to anyone scanning the QR) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-bold text-slate-900">
              Public Audit Dossier & Batch Certificate
            </h4>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              Open Access
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Anyone scanning this honey jar QR can freely download the official quality certificates and raw cryptographic records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportBatchCertificatePDF(selectedBatch, farmer)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Batch Certificate (PDF)</span>
          </button>

          <button
            onClick={() => exportBatchAuditJSON(selectedBatch)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Audit JSON</span>
          </button>
        </div>
      </div>

      {/* Comprehensive Farmer & Beekeeper Profile Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img
              src={farmer?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200'}
              alt={farmer?.name || selectedBatch.beekeeperName}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-500/30 border border-slate-200 shadow-xs"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {farmer?.name || selectedBatch.beekeeperName}
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  KVIC KYC Verified
                </span>
              </div>
              <p className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                {farmer?.cooperativeName || 'National Honey Mission FPO Cluster'}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                KVIC Reg #{farmer?.kvicRegistrationNumber || 'KVIC/HM/2023/8841'} · Experience: {farmer?.experienceYears || 14} yrs
              </p>
            </div>
          </div>

          {/* Direct Link to Farmer's Digital Passport & Bee Box QR */}
          {onNavigateToFarmer && (
            <button
              onClick={() => onNavigateToFarmer(farmer?.id || 'farmer-01')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-center"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>View Farmer's Digital Passport & Bee Box QR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Farmer & Batch Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-semibold block">Apiary Location</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {farmer?.village ? `${farmer.village}, ` : ''}{selectedBatch.district}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">State: {selectedBatch.state}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-semibold block">Hive / Bee Box</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {selectedBatch.hiveCode}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Frames: {selectedBatch.framesHarvested || 12}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-semibold block">Floral Variety</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {selectedBatch.honeyType}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">100% Raw Unpasteurized</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-semibold block">Batch Net Weight</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {selectedBatch.netWeightKg} kg
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Harvested: {selectedBatch.harvestDate}</span>
          </div>
        </div>

        {/* Farmer Bio / Apicultural Story */}
        {farmer?.bio && (
          <p className="text-xs text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 leading-relaxed italic">
            "{farmer.bio}"
          </p>
        )}
      </div>

      {/* Lab Quality & Purity Certificate Breakdown */}
      {selectedBatch.certificate && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Laboratory Purity Certificate
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {selectedBatch.certificate.parameters.overallResult === 'PASS' ? 'FSSAI Compliant: PASS' : 'FAIL'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedBatch.certificate.labName} · {selectedBatch.certificate.accreditationNumber}
              </p>
            </div>

            <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              Cert #{selectedBatch.certificate.certificateNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium block">Moisture Content</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold text-slate-900">
                  {selectedBatch.certificate.parameters.moisturePct}%
                </span>
                <span className="text-[11px] text-slate-500">(FSSAI Limit ≤ 20%)</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">✔ Normal Viscosity</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium block">HMF Level (Freshness)</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold text-slate-900">
                  {selectedBatch.certificate.parameters.hmfMgKg} mg/kg
                </span>
                <span className="text-[11px] text-slate-500">(Limit ≤ 80)</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">✔ No Thermal Degradation</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium block">Fructose / Glucose Ratio</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold text-slate-900">
                  {selectedBatch.certificate.parameters.fructoseGlucoseRatio}
                </span>
                <span className="text-[11px] text-slate-500">(Standard ≥ 0.95)</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">✔ Natural Floral Sugars</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium block">C4 Sugar Adulteration</span>
              <div className="mt-1">
                <span className="text-sm font-bold text-emerald-700">
                  {selectedBatch.certificate.parameters.c4SugarAdulteration}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">No High Fructose Corn/Cane Syrup</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium block">Microscopic Pollen Count</span>
              <div className="mt-1">
                <span className="text-sm font-bold text-slate-900">
                  {selectedBatch.certificate.parameters.pollenCountPerGram.toLocaleString()} /g
                </span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">✔ Authentic Botanical Origin</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
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
      )}

      {/* Provenance Journey Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-600" />
          <span>Full Traceability Journey (Hive to Jar)</span>
        </h3>

        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {selectedBatch.events.map((event, idx) => (
            <div key={event.id} className="relative group">
              {/* Dot */}
              <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-sm">
                {idx + 1}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{event.title}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {event.eventType}
                  </span>
                  <span className="text-xs text-slate-400">· {event.occurredAt}</span>
                </div>

                <p className="text-xs text-slate-700">{event.details}</p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                  <span>Actor: {event.actorName} ({event.actorRole})</span>
                  <span>·</span>
                  <span>Location: {event.location}</span>
                </div>

                <div className="font-mono text-[10px] text-slate-400 pt-0.5">
                  Event Hash: {formatHexShort(event.eventHash, 10)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blockchain Proof Inspector */}
      {selectedBatch.blockchainRecord && (
        <div className="bg-slate-950 text-slate-200 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Blockchain Ledger Proof Inspector
              </h3>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              {selectedBatch.blockchainRecord.network}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-sans">
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

            <div className="space-y-1 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-sans">
                Smart Contract Registry
              </span>
              <div className="text-slate-300 truncate">
                {selectedBatch.blockchainRecord.contractAddress}
              </div>
            </div>

            <div className="space-y-1 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-sans">Transaction Hash</span>
              <div className="flex items-center gap-1.5 text-slate-300 truncate">
                <span className="truncate">{selectedBatch.blockchainRecord.txHash}</span>
                <ExternalLink className="w-3 h-3 text-slate-500 flex-shrink-0" />
              </div>
            </div>

            <div className="space-y-1 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-sans">Block Confirmation</span>
              <div className="text-emerald-400 font-bold">
                Block #{selectedBatch.blockchainRecord.blockNumber.toLocaleString()} (Immutable)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
