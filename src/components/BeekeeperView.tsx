import React, { useState, useEffect } from 'react';
import {
  Hive,
  HoneyBatch,
  SensorReading,
  HiveStatus,
} from '../types';
import {
  Thermometer,
  Droplets,
  Scale,
  Activity,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  Archive,
  QrCode,
  TrendingUp,
  Cpu,
  Sparkles,
  RefreshCw,
  Info,
  Layers,
  MapPin,
  FileDown,
  FileSpreadsheet,
  Map,
} from 'lucide-react';
import { HiveTelemetryChart } from './HiveTelemetryChart';
import { AIHiveHealthSummary } from './AIHiveHealthSummary';
import { ComplianceExportModal } from './ComplianceExportModal';
import { QRLabelModal } from './QRLabelModal';

interface BeekeeperViewProps {
  hives: Hive[];
  batches: HoneyBatch[];
  onLogHarvest: (newBatch: Partial<HoneyBatch>) => void;
  onSelectBatchForQR: (batch: HoneyBatch) => void;
  onAnchorBatch: (batchId: string) => void;
  onToggleSimulatedStream: () => void;
  isStreamActive: boolean;
  initialSelectedHiveId?: string;
  onNavigateToApiaryMap?: () => void;
}

export function BeekeeperView({
  hives,
  batches,
  onLogHarvest,
  onSelectBatchForQR,
  onAnchorBatch,
  onToggleSimulatedStream,
  isStreamActive,
  initialSelectedHiveId,
  onNavigateToApiaryMap,
}: BeekeeperViewProps) {
  const [selectedHiveId, setSelectedHiveId] = useState<string>(
    initialSelectedHiveId || hives[0]?.id || ''
  );
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);
  const [qrModalBatch, setQrModalBatch] = useState<HoneyBatch | null>(null);

  // Sync selectedHiveId if initialSelectedHiveId changes
  useEffect(() => {
    if (initialSelectedHiveId) {
      setSelectedHiveId(initialSelectedHiveId);
    }
  }, [initialSelectedHiveId]);

  // Harvest form state
  const [harvestHiveId, setHarvestHiveId] = useState(hives[0]?.id || '');
  const [honeyType, setHoneyType] = useState('Wild Mustard & Desert Flora');
  const [netWeightKg, setNetWeightKg] = useState('22.5');
  const [framesCount, setFramesCount] = useState('8');
  const [moisture, setMoisture] = useState('18.2');
  const [notes, setNotes] = useState('Centrifugal cold extraction, 80-mesh filtered');

  const selectedHive = hives.find((h) => h.id === selectedHiveId) || hives[0];

  const handleHarvestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hive = hives.find((h) => h.id === harvestHiveId) || hives[0];
    const weightNum = parseFloat(netWeightKg) || 20.0;
    const framesNum = parseInt(framesCount) || 8;
    const moistureNum = parseFloat(moisture) || 18.2;

    onLogHarvest({
      hiveId: hive.id,
      hiveCode: hive.hiveCode,
      apiaryLocation: hive.apiaryName + ', ' + hive.location,
      district: hive.location.split(',')[0].trim(),
      state: hive.location.split(',')[1]?.trim() || 'Rajasthan',
      honeyType,
      grossWeightKg: Number((weightNum + 2.4).toFixed(1)),
      netWeightKg: weightNum,
      framesHarvested: framesNum,
      harvestDate: new Date().toISOString().split('T')[0],
      status: 'HARVESTED',
      moisturePct: moistureNum,
      processingNotes: notes,
      events: [
        {
          id: `ev-${Date.now()}`,
          eventType: 'HARVEST',
          title: 'Harvest Extracted',
          occurredAt: new Date().toLocaleString(),
          actorName: 'Registered Beekeeper',
          actorRole: 'Apiary Producer',
          location: hive.location,
          details: `Extracted ${weightNum} kg from ${framesNum} capped frames. ${notes}`,
          eventHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          iconName: 'Archive',
        },
      ],
    });

    setIsHarvestModalOpen(false);
  };

  const getStatusBadge = (status: HiveStatus) => {
    switch (status) {
      case 'healthy':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            Healthy
          </span>
        );
      case 'watch':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Watch Alert
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            Critical
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            Offline
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-950 text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              KVIC Honey Mission Beneficiary
            </span>
            <span className="text-xs font-semibold text-slate-900/80">#RAJ-1044</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1 tracking-tight">
            Beekeeper Apiary & IoT Monitor
          </h1>
          <p className="text-sm text-slate-900/90 font-medium max-w-2xl mt-0.5">
            Real-time hive telemetry, AI colony health warnings, harvest batch records, and blockchain certification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onToggleSimulatedStream}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-sm cursor-pointer ${
              isStreamActive
                ? 'bg-slate-950 text-white hover:bg-slate-900'
                : 'bg-white text-slate-900 hover:bg-slate-100'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isStreamActive ? 'animate-spin' : ''}`} />
            <span>{isStreamActive ? 'IoT Live Telemetry: Active' : 'IoT Live Stream: Paused'}</span>
          </button>

          <button
            id="open-compliance-export-btn"
            onClick={() => setIsComplianceModalOpen(true)}
            className="flex items-center gap-2 bg-slate-950/90 hover:bg-slate-950 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs shadow-sm transition-all cursor-pointer border border-slate-900"
          >
            <FileDown className="w-4 h-4 text-amber-400" />
            <span>Export Compliance</span>
          </button>

          {onNavigateToApiaryMap && (
            <button
              id="view-apiary-map-btn"
              onClick={onNavigateToApiaryMap}
              className="flex items-center gap-2 bg-slate-950 text-amber-400 hover:bg-slate-900 font-bold px-3.5 py-2.5 rounded-xl text-xs shadow-sm transition-all cursor-pointer border border-slate-900"
            >
              <Map className="w-4 h-4" />
              <span>Apiary Grid Map</span>
            </button>
          )}

          <button
            onClick={() => setIsHarvestModalOpen(true)}
            className="flex items-center gap-2 bg-slate-950 text-amber-400 hover:bg-slate-900 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log New Harvest</span>
          </button>
        </div>
      </div>

      {/* Grid Layout: Hives list on left, detailed telemetry on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Hive Cards */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Monitored Bee Boxes ({hives.length})</span>
            </h2>
            {onNavigateToApiaryMap && (
              <button
                onClick={onNavigateToApiaryMap}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Map className="w-3.5 h-3.5" />
                <span>Spatial Map</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {hives.map((hive) => {
              const isSelected = hive.id === selectedHive.id;
              return (
                <div
                  key={hive.id}
                  onClick={() => setSelectedHiveId(hive.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/60 border-amber-400 shadow-sm ring-1 ring-amber-400'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{hive.hiveCode}</span>
                        {getStatusBadge(hive.status)}
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {hive.location}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {hive.boxType.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Temp</span>
                      <span className="text-xs font-bold text-slate-800">
                        {hive.currentReading.temperature.toFixed(1)}°C
                      </span>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Humidity</span>
                      <span className="text-xs font-bold text-slate-800">
                        {hive.currentReading.humidity.toFixed(1)}%
                      </span>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Weight</span>
                      <span className="text-xs font-bold text-slate-800">
                        {hive.currentReading.weightKg.toFixed(1)} kg
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Yield Forecast Summary Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                Yield Prediction (Next Harvest)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {selectedHive.yieldPrediction.confidenceWord} Confidence
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {selectedHive.yieldPrediction.estimatedNextHarvestKg.toFixed(1)} kg
              </span>
              <span className="text-xs text-slate-500">
                (Baseline: {selectedHive.yieldPrediction.baselineHistoricalKg.toFixed(1)} kg)
              </span>
            </div>

            <ul className="text-xs text-slate-600 space-y-1">
              {selectedHive.yieldPrediction.factorsNoted.map((factor, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Selected Hive Deep-Dive Telemetry & AI Diagnosis */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Sensor Readout Strip */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{selectedHive.hiveCode} Telemetry</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                    Seq #{selectedHive.currentReading.seqNo}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    {selectedHive.currentReading.source} SENSORS
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Apiary: {selectedHive.apiaryName} · Updated: {selectedHive.lastSync}
                </p>
              </div>

              {getStatusBadge(selectedHive.status)}
            </div>

            {/* 4 Sensor Gauges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Temperature */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                    Brood Temp
                  </span>
                  <span className="text-[10px] text-slate-400">DHT22</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">
                    {selectedHive.currentReading.temperature.toFixed(1)}
                  </span>
                  <span className="text-sm font-bold text-slate-600">°C</span>
                </div>
                <div className="mt-2 text-[11px] font-medium text-slate-500 flex items-center justify-between">
                  <span>Safe: 32 - 36°C</span>
                  {selectedHive.currentReading.temperature > 36.5 ? (
                    <span className="text-rose-600 font-bold">Spike</span>
                  ) : (
                    <span className="text-emerald-600 font-bold">Normal</span>
                  )}
                </div>
              </div>

              {/* Humidity */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    Humidity
                  </span>
                  <span className="text-[10px] text-slate-400">RH%</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">
                    {selectedHive.currentReading.humidity.toFixed(1)}
                  </span>
                  <span className="text-sm font-bold text-slate-600">%</span>
                </div>
                <div className="mt-2 text-[11px] font-medium text-slate-500 flex items-center justify-between">
                  <span>Safe: 50 - 65%</span>
                  {selectedHive.currentReading.humidity > 68 ? (
                    <span className="text-amber-600 font-bold">Fanning</span>
                  ) : (
                    <span className="text-emerald-600 font-bold">Normal</span>
                  )}
                </div>
              </div>

              {/* Weight */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span className="flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-amber-600" />
                    Gross Weight
                  </span>
                  <span className="text-[10px] text-slate-400">HX711</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">
                    {selectedHive.currentReading.weightKg.toFixed(1)}
                  </span>
                  <span className="text-sm font-bold text-slate-600">kg</span>
                </div>
                <div className="mt-2 text-[11px] font-medium text-slate-500 flex items-center justify-between">
                  <span>Target: &gt;45kg</span>
                  <span className="text-emerald-600 font-bold">+350g/d</span>
                </div>
              </div>

              {/* Acoustics / Sound */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-indigo-500" />
                    Acoustics
                  </span>
                  <span className="text-[10px] text-slate-400">Mic</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">
                    {selectedHive.currentReading.soundDb.toFixed(0)}
                  </span>
                  <span className="text-sm font-bold text-slate-600">dB</span>
                </div>
                <div className="mt-2 text-[11px] font-medium text-slate-500 flex items-center justify-between">
                  <span>Normal: 35-50</span>
                  {selectedHive.currentReading.soundDb > 55 ? (
                    <span className="text-amber-600 font-bold">Piping</span>
                  ) : (
                    <span className="text-emerald-600 font-bold">Stable</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 24-Hour Telemetry Trend Charts (Recharts visualization for each hive) */}
          <HiveTelemetryChart
            hives={hives}
            selectedHive={selectedHive}
            onSelectHive={(id) => setSelectedHiveId(id)}
            onExportCompliance={() => setIsComplianceModalOpen(true)}
          />

          {/* AI Hive Health Summary (Gemini API Powered) */}
          <AIHiveHealthSummary hive={selectedHive} />

          {/* AI Colony Doctor & Health Assessment (PRD Section 22 / Rule 11) */}
          <div
            className={`p-5 rounded-2xl border shadow-sm space-y-4 ${
              selectedHive.status === 'healthy'
                ? 'bg-gradient-to-br from-emerald-50/70 to-white border-emerald-200'
                : 'bg-gradient-to-br from-amber-50/80 to-white border-amber-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">
                      AI Colony Health Assessment
                    </h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                      Isolation Forest + Rule Model
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Evaluated against 14-day rolling telemetry baseline
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Health Index:</span>
                <span
                  className={`text-base font-black px-2.5 py-0.5 rounded-lg ${
                    selectedHive.healthAssessment.overallScore >= 80
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {selectedHive.healthAssessment.overallScore}/100
                </span>
              </div>
            </div>

            {/* Diagnostic headline */}
            <div className="bg-white/80 p-3 rounded-xl border border-slate-200/80">
              <p className="font-semibold text-sm text-slate-900 flex items-start gap-2">
                {selectedHive.status === 'healthy' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                )}
                <span>{selectedHive.healthAssessment.predictionHeadline}</span>
              </p>
            </div>

            {/* Explanatory Factors Grid */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Observed Telemetry Factors
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedHive.healthAssessment.factors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs"
                  >
                    <span className="font-medium text-slate-700">{factor.name}</span>
                    <span
                      className={`font-bold ${
                        factor.impact === 'positive'
                          ? 'text-emerald-700'
                          : factor.impact === 'warning'
                          ? 'text-amber-700'
                          : 'text-slate-800'
                      }`}
                    >
                      {factor.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Action */}
            <div className="bg-slate-900 text-white p-3.5 rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide block">
                  Recommended Beekeeper Action
                </span>
                <p className="text-xs text-slate-200 mt-0.5">
                  {selectedHive.healthAssessment.recommendedAction}
                </p>
              </div>
            </div>

            {/* Rule 11 Disclaimer */}
            <p className="text-[11px] text-slate-500 italic">
              * Note (Rule 11): AI diagnostics are advisory estimates based on sensor models. Always inspect physical hive frames before medical intervention.
            </p>
          </div>

          {/* Registered Honey Batches Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Archive className="w-4 h-4 text-amber-600" />
                  <span>Harvested Honey Batches ({batches.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Traceable units linked to physical jars & QR code verification
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsComplianceModalOpen(true)}
                  className="text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 shadow-2xs cursor-pointer transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export Logs</span>
                </button>

                <button
                  onClick={() => setIsHarvestModalOpen(true)}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                >
                  + New Harvest
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {batch.batchCode}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        {batch.honeyType}
                      </span>
                      <span
                        data-testid="batch-moisture-badge"
                        className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200"
                      >
                        Moisture: {batch.moisturePct !== undefined ? batch.moisturePct : (batch.certificate?.parameters.moisturePct ?? 18.2)}%
                      </span>
                      {batch.blockchainRecord?.status === 'CONFIRMED' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ON-CHAIN ANCHORED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          PENDING ANCHOR
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-1.5">
                      <span>Harvested: {batch.harvestDate}</span>
                      <span>·</span>
                      <span>Net Weight: {batch.netWeightKg} kg</span>
                      <span>·</span>
                      <span>{batch.framesHarvested} Frames</span>
                      <span>·</span>
                      <span className="font-medium text-slate-700" data-testid="batch-moisture-text">
                        Moisture: {batch.moisturePct !== undefined ? batch.moisturePct : (batch.certificate?.parameters.moisturePct ?? 18.2)}%
                      </span>
                      <span>·</span>
                      <span>{batch.hiveCode}</span>
                    </p>

                    {(batch.processingNotes || batch.events?.find((e) => e.eventType === 'HARVEST')?.details) && (
                      <p className="text-xs text-slate-700 font-medium">
                        <span className="text-slate-500 font-bold">Processing:</span>{' '}
                        {batch.processingNotes || batch.events?.find((e) => e.eventType === 'HARVEST')?.details}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Anchor button if not yet anchored */}
                    {batch.blockchainRecord?.status !== 'CONFIRMED' && (
                      <button
                        onClick={() => onAnchorBatch(batch.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm cursor-pointer"
                      >
                        Anchor to Blockchain
                      </button>
                    )}

                    <button
                      onClick={() => setQrModalBatch(batch)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-400" />
                      <span>View QR Label</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: View & Print QR Packaging Label */}
      {qrModalBatch && (
        <QRLabelModal
          isOpen={!!qrModalBatch}
          onClose={() => setQrModalBatch(null)}
          batch={qrModalBatch}
          onSimulateScan={(batch) => {
            setQrModalBatch(null);
            onSelectBatchForQR(batch);
          }}
        />
      )}

      {/* Modal: Log New Harvest */}
      {isHarvestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Archive className="w-5 h-5 text-amber-600" />
                <span>Log New Honey Harvest</span>
              </h3>
              <button
                onClick={() => setIsHarvestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleHarvestSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Source Hive</label>
                <select
                  value={harvestHiveId}
                  onChange={(e) => setHarvestHiveId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900"
                >
                  {hives.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.hiveCode} — {h.apiaryName} ({h.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Honey Floral Type</label>
                  <select
                    value={honeyType}
                    onChange={(e) => setHoneyType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900"
                  >
                    <option value="Wild Mustard & Desert Flora">Wild Mustard & Desert Flora</option>
                    <option value="Wild Acacia & Blossom">Wild Acacia & Blossom</option>
                    <option value="Multi-floral Forest Honey">Multi-floral Forest Honey</option>
                    <option value="Sunflower Nectar">Sunflower Nectar</option>
                    <option value="Eucalyptus Raw Honey">Eucalyptus Raw Honey</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Net Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="100"
                    value={netWeightKg}
                    onChange={(e) => setNetWeightKg(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Capped Frames Harvested</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={framesCount}
                    onChange={(e) => setFramesCount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Moisture Gauge Check (%)</label>
                  <input
                    type="text"
                    value={moisture}
                    onChange={(e) => setMoisture(e.target.value)}
                    placeholder="18.2"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Processing Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                ></textarea>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-slate-800 text-[11px] flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Logging this harvest will auto-generate Batch Code (e.g. HC-2026-XXXX) and an immutable
                  Harvest Event in the local append-only event store.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsHarvestModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-slate-950 shadow-md cursor-pointer"
                >
                  Create Honey Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Export Regulatory Compliance (PDF / CSV) */}
      <ComplianceExportModal
        isOpen={isComplianceModalOpen}
        onClose={() => setIsComplianceModalOpen(false)}
        hives={hives}
        batches={batches}
        currentSelectedHiveId={selectedHiveId}
      />
    </div>
  );
}
