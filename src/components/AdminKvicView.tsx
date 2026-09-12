import React from 'react';
import { HoneyBatch, Hive, AlertItem } from '../types';
import {
  Building2,
  Users,
  Layers,
  Scale,
  ShieldCheck,
  Link,
  AlertTriangle,
  Download,
  CheckCircle2,
  ExternalLink,
  TrendingUp,
  Radio,
} from 'lucide-react';
import { formatHexShort } from '../utils/crypto';

interface AdminKvicViewProps {
  batches: HoneyBatch[];
  hives: Hive[];
  alerts: AlertItem[];
  latestBlockNumber: number;
}

export function AdminKvicView({
  batches,
  hives,
  alerts,
  latestBlockNumber,
}: AdminKvicViewProps) {
  const totalKg = batches.reduce((acc, b) => acc + b.netWeightKg, 0);
  const certifiedCount = batches.filter((b) => !!b.certificate).length;
  const certifiedPct = Math.round((certifiedCount / (batches.length || 1)) * 100);

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['BatchCode,HoneyType,NetWeightKg,HarvestDate,Beekeeper,Status,OnChainTx']
        .concat(
          batches.map(
            (b) =>
              `${b.batchCode},"${b.honeyType}",${b.netWeightKg},${b.harvestDate},"${b.beekeeperName}",${b.status},${b.blockchainRecord?.txHash || 'PENDING'}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `honeychain_kvic_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              Khadi and Village Industries Commission (KVIC)
            </span>
            <span className="text-xs text-slate-400">Honey Mission Cluster Oversight</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
            Honey Value Chain Administration & Ledger Audit
          </h1>
          <p className="text-sm text-slate-300 font-medium max-w-2xl mt-0.5">
            Real-time beneficiary monitoring, harvest volume analytics, lab certification compliance, and blockchain audit logs.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export KVIC Report (CSV)</span>
        </button>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-600" />
            Enrolled Beekeepers
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">142</span>
            <span className="text-xs font-bold text-emerald-600">+12 this month</span>
          </div>
          <span className="text-[11px] text-slate-500 block">KVIC Subsidized Beneficiaries</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            Active Bee Boxes
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">850</span>
            <span className="text-xs font-semibold text-slate-500">Across 18 Apiaries</span>
          </div>
          <span className="text-[11px] text-slate-500 block">Langstroth & Newton Boxes</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-amber-600" />
            Total Volume Harvested
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {(totalKg + 1240).toFixed(0)} kg
            </span>
            <span className="text-xs font-bold text-emerald-600">+18% vs 2025</span>
          </div>
          <span className="text-[11px] text-slate-500 block">100% Traceable Raw Honey</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Lab Certified Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{certifiedPct}%</span>
            <span className="text-xs font-bold text-emerald-600">NABL Tested</span>
          </div>
          <span className="text-[11px] text-slate-500 block">FSSAI Chemical Standards</span>
        </div>
      </div>

      {/* Grid: Ledger Audit on left, Exceptions & Alerts on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Blockchain Ledger Audit Log */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Link className="w-4 h-4 text-amber-600" />
                <span>On-Chain Cryptographic Registry (Polygon Amoy)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Immutable event commitments anchored via Merkle Tree roots
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Block #{latestBlockNumber.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {batches
              .filter((b) => b.blockchainRecord)
              .map((batch) => (
                <div
                  key={batch.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between font-sans">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-sm text-slate-900">
                        {batch.batchCode}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        BLOCK CONFIRMED
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-500">
                      Block #{batch.blockchainRecord?.blockNumber.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans uppercase block">
                        Tx Hash:
                      </span>
                      <span className="text-slate-900 truncate block">
                        {batch.blockchainRecord?.txHash}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans uppercase block">
                        Merkle Commitment Hash:
                      </span>
                      <span className="text-amber-700 truncate block">
                        {batch.blockchainRecord?.commitmentHash || '0x7f4a8b1c9d2e3f4a5b6c...'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Cluster Exceptions & Alerts */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Cluster Alerts & Flags</span>
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
              {alerts.length} Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                className={`p-3.5 rounded-xl border ${
                  alt.severity === 'warning'
                    ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                    : alt.severity === 'critical'
                    ? 'bg-rose-50/70 border-rose-300 text-rose-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold">{alt.title}</span>
                  <span className="text-[10px] text-slate-400">{alt.timestamp}</span>
                </div>
                <p className="mt-1 opacity-90">{alt.message}</p>
                <div className="mt-2 pt-2 border-t border-slate-200/50 font-semibold text-[11px]">
                  Action: {alt.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
