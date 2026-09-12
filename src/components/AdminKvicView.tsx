import React, { useState } from 'react';
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
  type Section = 'metrics' | 'ledger' | 'alerts';
  const [activeSection, setActiveSection] = useState<Section>('metrics');

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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">
              Khadi and Village Industries Commission (KVIC)
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Honey Mission Administration</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Honey Value Chain Administration & Ledger Audit
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Beneficiary oversight, harvest volume tracking, lab compliance verification, and immutable blockchain ledger logs.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-3.5 py-2 rounded-lg text-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export KVIC CSV</span>
        </button>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-xs overflow-x-auto scrollbar-none gap-1">
        <button
          onClick={() => setActiveSection('metrics')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'metrics'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Cluster Metrics</span>
        </button>

        <button
          onClick={() => setActiveSection('ledger')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'ledger'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Link className="w-3.5 h-3.5" />
          <span>Blockchain Registry</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono ml-0.5">
            #{latestBlockNumber}
          </span>
        </button>

        <button
          onClick={() => setActiveSection('alerts')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'alerts'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Cluster Alerts & Exceptions</span>
          {alerts.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold ml-0.5">
              {alerts.length}
            </span>
          )}
        </button>
      </div>

      {/* SECTION 1: CLUSTER METRICS */}
      {activeSection === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-600" />
                Enrolled Beekeepers
              </span>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-bold text-slate-900">142</span>
                <span className="text-[11px] font-semibold text-emerald-700">+12 this mo</span>
              </div>
              <span className="text-[11px] text-slate-500 block">KVIC Subsidized Beneficiaries</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Active Bee Boxes
              </span>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-bold text-slate-900">850</span>
                <span className="text-[11px] text-slate-500">18 Apiaries</span>
              </div>
              <span className="text-[11px] text-slate-500 block">Langstroth & Newton Boxes</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-amber-600" />
                Harvest Volume
              </span>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-bold text-slate-900">
                  {(totalKg + 1240).toFixed(0)} kg
                </span>
                <span className="text-[11px] font-semibold text-emerald-700">+18% vs 2025</span>
              </div>
              <span className="text-[11px] text-slate-500 block">100% Traceable Raw Honey</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Lab Certified Rate
              </span>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-bold text-slate-900">{certifiedPct}%</span>
                <span className="text-[11px] font-semibold text-emerald-700">NABL Tested</span>
              </div>
              <span className="text-[11px] text-slate-500 block">FSSAI Chemical Standards</span>
            </div>
          </div>

          {/* Additional cluster summary card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900">National Honey Mission Compliance</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                All beneficiary farmers undergo biometric Aadhaar KYC, apiary box GPS geotagging, and refractometer purity testing at farm-gate.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer self-start sm:self-center"
            >
              Download Report
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: BLOCKCHAIN REGISTRY */}
      {activeSection === 'ledger' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Link className="w-4 h-4 text-amber-600" />
                <span>On-Chain Cryptographic Registry (Polygon Amoy)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Immutable event commitments anchored via SHA-256 Merkle root states
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
              <Radio className="w-3.5 h-3.5" />
              <span>Block #{latestBlockNumber.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {batches
              .filter((b) => b.blockchainRecord)
              .map((batch) => (
                <div
                  key={batch.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2"
                >
                  <div className="flex items-center justify-between font-sans">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-sm text-slate-900">
                        {batch.batchCode}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
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
                      <span className="text-amber-800 truncate block">
                        {batch.blockchainRecord?.commitmentHash || '0x7f4a8b1c9d2e3f4a5b6c...'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* SECTION 3: CLUSTER ALERTS */}
      {activeSection === 'alerts' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Cluster Alerts & Exceptions</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
              {alerts.length} Active
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                className={`p-3.5 rounded-lg border ${
                  alt.severity === 'warning'
                    ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                    : alt.severity === 'critical'
                    ? 'bg-rose-50/70 border-rose-300 text-rose-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold">{alt.title}</span>
                  <span className="text-[10px] text-slate-500">{alt.timestamp}</span>
                </div>
                <p className="mt-1 opacity-90">{alt.message}</p>
                <div className="mt-2 pt-2 border-t border-slate-200/50 font-medium text-[11px]">
                  Action: {alt.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
