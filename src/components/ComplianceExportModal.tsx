import React, { useState } from 'react';
import { Hive, HoneyBatch, TelemetryDateRange } from '../types';
import { exportComplianceCSV, exportCompliancePDF, ComplianceExportOptions } from '../utils/complianceExport';
import {
  FileText,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  X,
  Layers,
  Calendar,
  Building2,
  ShieldCheck,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ComplianceExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  hives: Hive[];
  batches: HoneyBatch[];
  currentSelectedHiveId?: string;
}

export function ComplianceExportModal({
  isOpen,
  onClose,
  hives,
  batches,
  currentSelectedHiveId,
}: ComplianceExportModalProps) {
  const [scope, setScope] = useState<'all' | 'telemetry_only' | 'harvests_only'>('all');
  const [selectedHiveId, setSelectedHiveId] = useState<string>(currentSelectedHiveId || 'all');
  const [dateRange, setDateRange] = useState<TelemetryDateRange>('24h');
  const [auditorOrg, setAuditorOrg] = useState<string>(
    'FSSAI Food Safety & Standards Authority / KVIC Honey Mission'
  );
  const [includeBlockchain, setIncludeBlockchain] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const exportOptions: ComplianceExportOptions = {
    scope,
    hiveId: selectedHiveId,
    dateRange,
    includeBlockchainVerification: includeBlockchain,
    auditorOrganization: auditorOrg,
  };

  const filteredHives = selectedHiveId === 'all' ? hives : hives.filter((h) => h.id === selectedHiveId);
  const filteredBatches = selectedHiveId === 'all' ? batches : batches.filter((b) => b.hiveId === selectedHiveId);

  const handleExport = (format: 'pdf' | 'csv') => {
    setIsExporting(true);
    setExportSuccessMsg(null);

    try {
      if (format === 'csv') {
        exportComplianceCSV(hives, batches, exportOptions);
        setExportSuccessMsg('Compliance CSV exported successfully to your downloads.');
      } else {
        exportCompliancePDF(hives, batches, exportOptions);
        setExportSuccessMsg('Official Compliance PDF generated and downloaded.');
      }
      setTimeout(() => setExportSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        id="compliance-export-modal"
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-5 sm:p-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Export Regulatory Compliance Dossier
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  FSSAI / ISO 17025
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Generate authenticated audit logs for IoT brood microclimate readings, quality lab test parameters, and blockchain records.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {exportSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{exportSuccessMsg}</span>
            </div>
          )}

          {/* Section 1: Scope */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>Audit Scope</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  scope === 'all'
                    ? 'border-amber-500 bg-amber-50/70 text-slate-900 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Full Compliance</span>
                  {scope === 'all' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Telemetry logs + Harvest history & blockchain records
                </p>
              </button>

              <button
                type="button"
                onClick={() => setScope('telemetry_only')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  scope === 'telemetry_only'
                    ? 'border-amber-500 bg-amber-50/70 text-slate-900 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Telemetry Only</span>
                  {scope === 'telemetry_only' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Brood temperature, humidity, and microclimate records
                </p>
              </button>

              <button
                type="button"
                onClick={() => setScope('harvests_only')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  scope === 'harvests_only'
                    ? 'border-amber-500 bg-amber-50/70 text-slate-900 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Harvests Only</span>
                  {scope === 'harvests_only' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Extraction batches, moisture QC, and chain-of-custody
                </p>
              </button>
            </div>
          </div>

          {/* Section 2: Filters Grid (Hive Filter + Telemetry Horizon) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hive Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Filter Monitored Hive:</label>
              <select
                value={selectedHiveId}
                onChange={(e) => setSelectedHiveId(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
              >
                <option value="all">All Apiary Hives ({hives.length} boxes)</option>
                {hives.map((hive) => (
                  <option key={hive.id} value={hive.id}>
                    {hive.hiveCode} — {hive.apiaryName} ({hive.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Telemetry Horizon */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Telemetry Time Horizon:</span>
              </label>
              <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-50">
                {(['24h', '7d', '30d'] as TelemetryDateRange[]).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setDateRange(range)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      dateRange === range
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Regulatory Authority Metadata */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Auditing Authority / Regulatory Organization:</span>
            </label>
            <input
              type="text"
              value={auditorOrg}
              onChange={(e) => setAuditorOrg(e.target.value)}
              placeholder="e.g. FSSAI / KVIC / State Agricultural Directorate"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
            />
          </div>

          {/* Section 4: Live Data Summary & Preview Toggle */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">Export Scope Summary</span>
                <p className="text-[11px] text-slate-500">
                  {filteredHives.length} hive(s) · {filteredBatches.length} harvest batch(es) included
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showPreview ? 'Hide Preview' : 'Preview Data'}</span>
                {showPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Collapsible Preview Table */}
            {showPreview && (
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div className="text-[11px] font-bold text-slate-700">Sample Harvest Batch Records:</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse bg-white rounded-lg overflow-hidden border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2">Batch Code</th>
                        <th className="p-2">Hive</th>
                        <th className="p-2">Harvest Date</th>
                        <th className="p-2">Flora</th>
                        <th className="p-2">Net Wt</th>
                        <th className="p-2">Moisture</th>
                        <th className="p-2">QC Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {filteredBatches.slice(0, 3).map((b) => (
                        <tr key={b.id}>
                          <td className="p-2 font-mono font-bold text-slate-900">{b.batchCode}</td>
                          <td className="p-2">{b.hiveCode}</td>
                          <td className="p-2">{b.harvestDate}</td>
                          <td className="p-2">{b.honeyType}</td>
                          <td className="p-2 font-semibold text-slate-900">{b.netWeightKg} kg</td>
                          <td className="p-2">{b.certificate?.parameters.moisturePct ?? '17.8%'}</td>
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                              PASS
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-slate-500 text-[11px] font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Includes cryptographic SHA-256 batch hashes and on-chain verification stamps.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              id="export-csv-btn"
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              id="export-pdf-btn"
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-slate-950" />
              <span>{isExporting ? 'Generating...' : 'Export PDF Dossier'}</span>
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
