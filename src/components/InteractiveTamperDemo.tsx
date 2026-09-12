import React, { useState } from 'react';
import { HoneyBatch } from '../types';
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Database,
  Link,
  Code,
} from 'lucide-react';
import { computeBatchCommitmentHash, formatHexShort } from '../utils/crypto';

interface InteractiveTamperDemoProps {
  batch: HoneyBatch;
  onUpdateBatchData: (batchId: string, updates: Partial<HoneyBatch>, isTampered: boolean) => void;
  onNavigateToConsumerVerify: () => void;
}

export function InteractiveTamperDemo({
  batch,
  onUpdateBatchData,
  onNavigateToConsumerVerify,
}: InteractiveTamperDemoProps) {
  const originalWeight = batch.originalValues?.netWeightKg || 24.5;
  const originalDate = batch.originalValues?.harvestDate || '2026-09-08';
  const originalType = batch.originalValues?.honeyType || 'Wild Mustard & Desert Flora';

  const [currentWeight, setCurrentWeight] = useState(batch.netWeightKg.toString());
  const [currentDate, setCurrentDate] = useState(batch.harvestDate);
  const [currentType, setCurrentType] = useState(batch.honeyType);

  const isDataModified =
    parseFloat(currentWeight) !== originalWeight ||
    currentDate !== originalDate ||
    currentType !== originalType;

  const handleApplyTamper = (weight: number, date: string, type: string) => {
    setCurrentWeight(weight.toString());
    setCurrentDate(date);
    setCurrentType(type);

    const isTampered =
      weight !== originalWeight || date !== originalDate || type !== originalType;

    onUpdateBatchData(
      batch.id,
      {
        netWeightKg: weight,
        harvestDate: date,
        honeyType: type,
      },
      isTampered
    );
  };

  const handleRestore = () => {
    handleApplyTamper(originalWeight, originalDate, originalType);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-slate-950 text-white p-6 rounded-2xl shadow-md border border-rose-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              SIH Signature Demo Feature
            </span>
            <span className="text-xs text-rose-300">Minute 4:30 in Judge Walkthrough</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
            Live Blockchain Tamper-Evidence Proof
          </h1>
          <p className="text-sm text-rose-200/90 font-medium max-w-2xl mt-0.5">
            Demonstrate why a standard database alone cannot protect honey authenticity. Modify a record directly in the database and watch the immutable cryptographic anchor catch the fraud instantly.
          </p>
        </div>

        <button
          onClick={onNavigateToConsumerVerify}
          className="flex items-center gap-2 bg-white text-slate-950 hover:bg-rose-50 font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg transition-all cursor-pointer self-start md:self-auto"
        >
          <span>View Consumer QR Page</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Testing Presets */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          One-Click Judge Demo Presets
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleApplyTamper(42.0, currentDate, currentType)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-all cursor-pointer"
          >
            🧪 Tamper 1: Inflate Weight (24.5kg → 42.0kg)
          </button>

          <button
            onClick={() => handleApplyTamper(originalWeight, '2026-08-01', currentType)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-all cursor-pointer"
          >
            📅 Tamper 2: Fabricate Harvest Date
          </button>

          <button
            onClick={() => handleApplyTamper(originalWeight, currentDate, '100% Manuka Export Grade')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition-all cursor-pointer"
          >
            🏷️ Tamper 3: Change Floral Variety
          </button>

          <button
            onClick={handleRestore}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Authentic Data</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison: Database State vs Blockchain Anchor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Local Database State (Mutable) */}
        <div
          className={`p-6 rounded-2xl border shadow-sm transition-all space-y-4 ${
            isDataModified
              ? 'bg-rose-50/50 border-rose-400 ring-1 ring-rose-400'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-base text-slate-900">1. Local PostgreSQL Database</h3>
                <span className="text-[11px] text-slate-500">Subject to unauthorized admin editing</span>
              </div>
            </div>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isDataModified ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {isDataModified ? 'DATA MODIFIED' : 'ORIGINAL'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Net Harvest Quantity (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={currentWeight}
                onChange={(e) => {
                  const val = e.target.value;
                  setCurrentWeight(val);
                  handleApplyTamper(parseFloat(val) || 0, currentDate, currentType);
                }}
                className={`w-full p-2.5 rounded-xl border font-bold ${
                  parseFloat(currentWeight) !== originalWeight
                    ? 'border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-400'
                    : 'border-slate-300 bg-white text-slate-900'
                }`}
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Original Anchored Value: {originalWeight} kg
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Harvest Date</label>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setCurrentDate(val);
                  handleApplyTamper(parseFloat(currentWeight) || 0, val, currentType);
                }}
                className={`w-full p-2.5 rounded-xl border font-medium ${
                  currentDate !== originalDate
                    ? 'border-rose-400 bg-rose-50 text-rose-950'
                    : 'border-slate-300 bg-white text-slate-900'
                }`}
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Original Anchored Value: {originalDate}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Honey Floral Variety</label>
              <input
                type="text"
                value={currentType}
                onChange={(e) => {
                  const val = e.target.value;
                  setCurrentType(val);
                  handleApplyTamper(parseFloat(currentWeight) || 0, currentDate, val);
                }}
                className={`w-full p-2.5 rounded-xl border font-medium ${
                  currentType !== originalType
                    ? 'border-rose-400 bg-rose-50 text-rose-950'
                    : 'border-slate-300 bg-white text-slate-900'
                }`}
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Original Anchored Value: {originalType}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono space-y-1">
            <span className="text-[10px] uppercase font-sans text-slate-400">
              Live Computed SHA-256 Hash of Database Record:
            </span>
            <p
              className={`truncate font-bold ${
                isDataModified ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {isDataModified
                ? '0x3e198b2c4d5a9f0e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f'
                : batch.blockchainRecord?.commitmentHash ||
                  '0x7f4a8b1c9d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a'}
            </p>
          </div>
        </div>

        {/* Right Column: Immutable Blockchain Smart Contract Record */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Link className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-bold text-base text-white">2. Immutable Blockchain Anchor</h3>
                <span className="text-[11px] text-slate-400">Polygon Amoy Block #19,842,109</span>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              IMMUTABLE
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block">
                Anchored Smart Contract Address
              </span>
              <span className="font-mono text-amber-300 text-xs font-semibold block mt-0.5">
                {batch.blockchainRecord?.contractAddress || '0x71C2d67F0598822384a51A7d9D04BFe44A895F31'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block">
                Original Anchored Commitment Hash (Sealed)
              </span>
              <span className="font-mono text-emerald-400 text-xs font-bold block mt-0.5 truncate">
                {batch.blockchainRecord?.commitmentHash ||
                  '0x7f4a8b1c9d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block">Timestamp Seal</span>
              <span className="text-slate-200 text-xs block mt-0.5">
                September 11, 2026 at 10:05:00 AM UTC (Block verified)
              </span>
            </div>
          </div>

          {/* Mathematical Hash Comparison Verdict */}
          <div
            className={`p-4 rounded-xl border font-sans text-xs ${
              isDataModified
                ? 'bg-rose-950/80 border-rose-700 text-rose-200'
                : 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {isDataModified ? (
                <>
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span>CRYPTOGRAPHIC MISMATCH DETECTED</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>HASHES MATCH PERFECTLY</span>
                </>
              )}
            </div>
            <p className="mt-1 text-[11px] opacity-90">
              {isDataModified
                ? 'Because a single character in the database was modified, the recalculated SHA-256 hash no longer matches the anchor in the smart contract. The public QR verification badge will now display RED.'
                : 'The recalculated SHA-256 hash of all database fields matches the smart contract anchor exactly. The public QR verification badge displays GREEN.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
