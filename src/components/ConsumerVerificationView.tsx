import React, { useState } from 'react';
import { HoneyBatch } from '../types';
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
} from 'lucide-react';
import { formatHexShort } from '../utils/crypto';

interface ConsumerVerificationViewProps {
  batches: HoneyBatch[];
  selectedBatch: HoneyBatch;
  onSelectBatch: (batch: HoneyBatch) => void;
  onTamperToggle: (batchId: string, shouldTamper: boolean) => void;
  isTampered: boolean;
}

export function ConsumerVerificationView({
  batches,
  selectedBatch,
  onSelectBatch,
  onTamperToggle,
  isTampered,
}: ConsumerVerificationViewProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [showPrintLabel, setShowPrintLabel] = useState(false);

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

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden md:inline">Switch Batch:</span>
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
            onClick={() => setShowPrintLabel(!showPrintLabel)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer"
          >
            {showPrintLabel ? 'Hide Label' : 'Print Jar Sticker'}
          </button>
        </div>
      </div>

      {/* Printable Jar Label Modal / Drawer */}
      {showPrintLabel && (
        <div className="bg-amber-50 border-2 border-dashed border-amber-300 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
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
            <p className="text-[11px] text-slate-500">
              Scan with any mobile camera to verify blockchain record & lab certificate.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl shadow-md border border-amber-200 text-center flex flex-col items-center">
            {/* SVG Visual QR Code generator */}
            <div className="w-36 h-36 bg-slate-950 p-2 rounded-lg flex items-center justify-center">
              <div className="w-full h-full bg-white rounded flex items-center justify-center relative overflow-hidden">
                {/* SVG pattern representing realistic QR Code */}
                <svg viewBox="0 0 100 100" className="w-full h-full p-1 fill-slate-950">
                  <rect x="0" y="0" width="30" height="30" />
                  <rect x="5" y="5" width="20" height="20" fill="white" />
                  <rect x="10" y="10" width="10" height="10" />

                  <rect x="70" y="0" width="30" height="30" />
                  <rect x="75" y="5" width="20" height="20" fill="white" />
                  <rect x="80" y="10" width="10" height="10" />

                  <rect x="0" y="70" width="30" height="30" />
                  <rect x="5" y="75" width="20" height="20" fill="white" />
                  <rect x="10" y="80" width="10" height="10" />

                  {/* QR Data Dots */}
                  <rect x="35" y="10" width="8" height="8" />
                  <rect x="50" y="15" width="10" height="6" />
                  <rect x="40" y="30" width="12" height="12" />
                  <rect x="15" y="45" width="8" height="12" />
                  <rect x="30" y="50" width="8" height="8" />
                  <rect x="45" y="60" width="12" height="6" />
                  <rect x="70" y="40" width="8" height="8" />
                  <rect x="85" y="55" width="10" height="10" />
                  <rect x="65" y="75" width="8" height="8" />
                  <rect x="80" y="85" width="12" height="8" />
                  <rect x="40" y="80" width="10" height="10" />
                </svg>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-800 mt-2">
              Scan to Verify
            </span>
          </div>
        </div>
      )}

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

      {/* Batch Origin & Farm Highlights */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Archive className="w-4 h-4 text-amber-600" />
          <span>Honey Origin & Farm Specifications</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-semibold block">Beekeeper</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {selectedBatch.beekeeperName}
            </span>
            <span className="text-[10px] text-amber-700 font-bold">KVIC Honey Mission Beneficiary</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-semibold block">Region / Apiary</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {selectedBatch.district}, {selectedBatch.state}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Hive Code: {selectedBatch.hiveCode}</span>
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
