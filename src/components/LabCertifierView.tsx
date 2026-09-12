import React, { useState } from 'react';
import { HoneyBatch, QualityCertificate } from '../types';
import {
  FlaskConical,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  Archive,
} from 'lucide-react';

interface LabCertifierViewProps {
  batches: HoneyBatch[];
  onIssueCertificate: (batchId: string, cert: QualityCertificate) => void;
}

export function LabCertifierView({ batches, onIssueCertificate }: LabCertifierViewProps) {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    batches.find((b) => !b.certificate)?.id || batches[0]?.id || ''
  );

  // Lab form parameters
  const [moisture, setMoisture] = useState('17.9');
  const [hmf, setHmf] = useState('12.5');
  const [fgRatio, setFgRatio] = useState('1.12');
  const [sucrose, setSucrose] = useState('1.9');
  const [pollenCount, setPollenCount] = useState('26500');
  const [c4Adulteration, setC4Adulteration] = useState<'Negative' | 'Positive'>('Negative');
  const [overallResult, setOverallResult] = useState<'PASS' | 'FAIL'>('PASS');
  const [labNotes, setLabNotes] = useState(
    'No C4 or C3 exogenous sugars detected via EA-IRMS. Pure unheated natural blossom honey.'
  );

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];

  const handleCertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCert: QualityCertificate = {
      id: `cert-${Date.now()}`,
      certificateNumber: `NABL/FSSAI-2026-HN-${Math.floor(1000 + Math.random() * 9000)}`,
      batchId: selectedBatch.id,
      labName: 'National Food Analytical Research & Quality Testing Laboratory',
      accreditationNumber: 'ISO/IEC 17025:2017 Certified (NABL TC-5892)',
      analystName: 'Dr. Sunita Sharma, Senior Analytical Chemist',
      issuedAt: new Date().toISOString().split('T')[0],
      standardName: 'FSSAI Food Safety and Standards (Honey) 2020 / Codex Alimentarius',
      parameters: {
        moisturePct: parseFloat(moisture) || 18.0,
        hmfMgKg: parseFloat(hmf) || 15.0,
        fructoseGlucoseRatio: parseFloat(fgRatio) || 1.1,
        sucrosePct: parseFloat(sucrose) || 2.0,
        pollenCountPerGram: parseInt(pollenCount) || 25000,
        c4SugarAdulteration: c4Adulteration,
        antibioticResidue: 'None Detected',
        overallResult,
      },
      documentHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      status: 'VALID',
    };

    onIssueCertificate(selectedBatch.id, newCert);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-blue-100 text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              NABL Accredited Quality Laboratory Portal
            </span>
            <span className="text-xs text-blue-200">ISO/IEC 17025:2017</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
            Honey Quality & Adulteration Testing
          </h1>
          <p className="text-sm text-blue-100 font-medium max-w-2xl mt-0.5">
            Authenticate batch samples against FSSAI honey standards, verify isotopic C4/rice syrup adulteration, and issue blockchain-anchored certificates.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20 text-xs text-blue-100 font-medium">
          <p>Rule 8: Purity is verified by chemical laboratory test.</p>
          <p>The blockchain anchors the certificate hash so it cannot be swapped.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Batches Selection */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Archive className="w-4 h-4 text-indigo-600" />
            <span>Select Batch for Testing</span>
          </h2>

          <div className="space-y-3">
            {batches.map((batch) => {
              const isSelected = batch.id === selectedBatch.id;
              const isCertPass = batch.certificate?.parameters.overallResult === 'PASS' || batch.status === 'CERTIFIED';
              const isCertFail = batch.certificate?.parameters.overallResult === 'FAIL' || batch.status === 'FAILED';
              return (
                <div
                  key={batch.id}
                  onClick={() => setSelectedBatchId(batch.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/60 border-indigo-400 shadow-sm ring-1 ring-indigo-400'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {batch.batchCode}
                      </span>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">{batch.honeyType}</p>
                    </div>

                    {isCertFail ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                        FAILED
                      </span>
                    ) : isCertPass ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        CERTIFIED
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                        PENDING TEST
                      </span>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                    <span>{batch.netWeightKg} kg</span>
                    <span>{batch.district}, {batch.state}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificate Entry / Details */}
        <div className="lg:col-span-8 space-y-6">
          {selectedBatch.certificate ? (
            /* Already Certified View */
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    {selectedBatch.certificate.parameters.overallResult === 'PASS' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                    )}
                    <h3 className="text-base font-bold text-slate-900">
                      Certificate Issued for {selectedBatch.batchCode}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cert #{selectedBatch.certificate.certificateNumber} · Issued on {selectedBatch.certificate.issuedAt}
                  </p>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    selectedBatch.certificate.parameters.overallResult === 'PASS'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  Status: {selectedBatch.certificate.parameters.overallResult}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium block">Moisture Content</span>
                  <span className="text-lg font-bold text-slate-900 block mt-1">
                    {selectedBatch.certificate.parameters.moisturePct}%
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">Standard ≤ 20%</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium block">HMF Level</span>
                  <span className="text-lg font-bold text-slate-900 block mt-1">
                    {selectedBatch.certificate.parameters.hmfMgKg} mg/kg
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">Limit ≤ 80 mg/kg</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium block">Fructose/Glucose</span>
                  <span className="text-lg font-bold text-slate-900 block mt-1">
                    {selectedBatch.certificate.parameters.fructoseGlucoseRatio}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">Standard ≥ 0.95</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium block">C4 Sugar Adulteration</span>
                  <span className="text-sm font-bold text-emerald-700 block mt-1">
                    {selectedBatch.certificate.parameters.c4SugarAdulteration}
                  </span>
                  <span className="text-[10px] text-slate-500">EA-IRMS Isotopic test</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium block">Pollen Count</span>
                  <span className="text-sm font-bold text-slate-900 block mt-1">
                    {selectedBatch.certificate.parameters.pollenCountPerGram.toLocaleString()} /g
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">Authentic Raw Nectar</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium block">Antibiotics</span>
                  <span className="text-sm font-bold text-emerald-700 block mt-1">
                    {selectedBatch.certificate.parameters.antibioticResidue}
                  </span>
                  <span className="text-[10px] text-slate-500">No chemical traces</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono space-y-1">
                <span className="text-[10px] uppercase font-sans text-slate-400">
                  Certificate Document SHA-256 Hash (Anchored on Ledger)
                </span>
                <p className="truncate text-amber-400">{selectedBatch.certificate.documentHash}</p>
              </div>
            </div>
          ) : (
            /* Upload / Fill Certificate Form */
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-indigo-600" />
                  <span>Issue Quality Certificate for {selectedBatch.batchCode}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Enter laboratory chromatography and refractometry findings
                </p>
              </div>

              <form onSubmit={handleCertSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Moisture Content (%) · Refractometer
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="10"
                      max="30"
                      value={moisture}
                      onChange={(e) => setMoisture(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                      required
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">FSSAI Requirement ≤ 20.0%</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      HMF Level (mg/kg) · HPLC / Spectrophotometer
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="120"
                      value={hmf}
                      onChange={(e) => setHmf(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                      required
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">FSSAI Standard ≤ 80 mg/kg</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Fructose to Glucose Ratio (F/G)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.5"
                      max="2.0"
                      value={fgRatio}
                      onChange={(e) => setFgRatio(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                      required
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Standard ≥ 0.95</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      C4 Sugar Adulteration Test (EA-IRMS)
                    </label>
                    <select
                      value={c4Adulteration}
                      onChange={(e) => setC4Adulteration(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900"
                    >
                      <option value="Negative">Negative (Pure - No C4 Cane/Corn Syrups)</option>
                      <option value="Positive">Positive (Adulterated with C4 sugars)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Pollen Grain Count (Grains / gram)
                    </label>
                    <input
                      type="number"
                      value={pollenCount}
                      onChange={(e) => setPollenCount(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Overall Lab Verdict</label>
                    <select
                      value={overallResult}
                      onChange={(e) => setOverallResult(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
                    >
                      <option value="PASS">PASS (Certified Authentic FSSAI Honey)</option>
                      <option value="FAIL">FAIL (Non-Compliant / Rejected)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Analyst Findings & Remarks</label>
                  <textarea
                    value={labNotes}
                    onChange={(e) => setLabNotes(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Issue Certificate & Anchor to Ledger</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
