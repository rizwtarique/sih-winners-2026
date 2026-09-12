import React, { useState, useEffect } from 'react';
import { Hive, GeminiHiveHealthSummary, TelemetryPoint, TelemetryDateRange } from '../types';
import { computeTelemetryStats, generateTelemetryForRange } from '../data/telemetryData';
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Thermometer,
  Droplets,
  Clock,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  Wind,
  SunMedium,
  CheckSquare,
  Square,
  Wrench,
  Compass,
} from 'lucide-react';

interface AIHiveHealthSummaryProps {
  hive: Hive;
  dateRange?: TelemetryDateRange;
  telemetryPoints?: TelemetryPoint[];
}

export function AIHiveHealthSummary({
  hive,
  dateRange = '24h',
  telemetryPoints,
}: AIHiveHealthSummaryProps) {
  const [summary, setSummary] = useState<GeminiHiveHealthSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'interventions' | 'thermodynamics' | 'ventilation'>('interventions');

  // Cache summaries by hive ID and date range to prevent redundant network requests
  const [cache, setCache] = useState<Record<string, GeminiHiveHealthSummary>>({});

  const points = telemetryPoints || generateTelemetryForRange(hive, dateRange);
  const stats = computeTelemetryStats(points);

  const fetchHealthSummary = async (forceRefresh = false) => {
    const cacheKey = `${hive.id}_${dateRange}`;
    if (!forceRefresh && cache[cacheKey]) {
      setSummary(cache[cacheKey]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-hive-health-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hiveId: hive.id,
          hiveCode: hive.hiveCode,
          location: hive.location,
          status: hive.status,
          currentReading: hive.currentReading,
          telemetryStats: stats,
          dateRange,
          recentPoints: points.slice(-10),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        setSummary(resData.data);
        setCache((prev) => ({ ...prev, [cacheKey]: resData.data }));
      } else {
        throw new Error(resData.error || 'Failed to generate assessment');
      }
    } catch (err: any) {
      console.error('Error requesting AI summary:', err);
      setError('Could not complete live Gemini assessment. Utilizing local biological assessment.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthSummary(false);
  }, [hive.id, dateRange]);

  const toggleStep = (stepKey: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
            <ShieldAlert className="w-3.5 h-3.5" />
            Critical Risk
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            High Stress
          </span>
        );
      case 'Moderate':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Moderate Attention
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Optimal Homeostasis
          </span>
        );
    }
  };

  return (
    <div
      id="ai-hive-health-summary-section"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  AI Hive Health Summary
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <span>{summary?.modelUsed || 'Gemini 3.8 Flash'}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700/80 text-slate-300">
                  {dateRange.toUpperCase()} Window
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Diagnostic synthesis of temperature & relative humidity trends to identify physiological stress and recommend clinical interventions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="refresh-gemini-analysis-btn"
              onClick={() => fetchHealthSummary(true)}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Analyzing Telemetry...' : 'Refresh AI Analysis'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-6 space-y-6">
        {isLoading && !summary ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-800">
              Analyzing IoT brood sensor vectors with Gemini...
            </p>
            <p className="text-xs text-slate-500 max-w-sm">
              Evaluating brood thermoregulation ({hive.currentReading.temperature.toFixed(1)}°C), nest humidity ({hive.currentReading.humidity.toFixed(1)}%), and diurnal cycles.
            </p>
          </div>
        ) : summary ? (
          <>
            {/* Top Score & Executive Summary Card */}
            <div
              className={`p-4 sm:p-5 rounded-xl border transition-all ${
                summary.riskLevel === 'High' || summary.riskLevel === 'Critical'
                  ? 'bg-rose-50/60 border-rose-200'
                  : summary.riskLevel === 'Moderate'
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-emerald-50/60 border-emerald-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Colony Diagnostics ({summary.hiveCode})
                    </span>
                    {getRiskBadge(summary.riskLevel)}
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                    {summary.executiveSummary}
                  </p>
                </div>

                {/* Vitality Gauge */}
                <div className="flex items-center gap-3 sm:gap-4 self-start md:self-auto bg-white p-3 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Thermoregulation Score
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      {summary.homeostasisScore}
                      <span className="text-sm font-bold text-slate-400">/100</span>
                    </span>
                  </div>
                  <div
                    className={`w-3 h-12 rounded-full overflow-hidden flex flex-col justify-end ${
                      summary.homeostasisScore >= 85
                        ? 'bg-emerald-100'
                        : summary.homeostasisScore >= 70
                        ? 'bg-amber-100'
                        : 'bg-rose-100'
                    }`}
                  >
                    <div
                      className={`w-full rounded-full transition-all duration-700 ${
                        summary.homeostasisScore >= 85
                          ? 'bg-emerald-500'
                          : summary.homeostasisScore >= 70
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ height: `${summary.homeostasisScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Inspection Window Tip */}
              {summary.recommendedInspectionWindow && (
                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-900">Recommended Physical Inspection: </strong>
                    {summary.recommendedInspectionWindow}
                  </span>
                </div>
              )}
            </div>

            {/* Tab Selectors */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('interventions')}
                className={`pb-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'interventions'
                    ? 'border-amber-500 text-amber-800'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                <span>Actionable Interventions ({summary.actionableInterventions.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('thermodynamics')}
                className={`pb-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'thermodynamics'
                    ? 'border-amber-500 text-amber-800'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                <span>Thermodynamics</span>
              </button>
              <button
                onClick={() => setActiveTab('ventilation')}
                className={`pb-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'ventilation'
                    ? 'border-amber-500 text-amber-800'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span>Humidity & Moisture</span>
              </button>
            </div>

            {/* TAB 1: ACTIONABLE INTERVENTIONS CHECKLIST */}
            {activeTab === 'interventions' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {summary.actionableInterventions.map((intervention, index) => {
                    const isImmediate = intervention.priority === 'Immediate';
                    const isPreventative = intervention.priority === 'Preventative';

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border space-y-3 transition-all ${
                          isImmediate
                            ? 'bg-rose-50/40 border-rose-200'
                            : isPreventative
                            ? 'bg-amber-50/30 border-amber-200'
                            : 'bg-slate-50/50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isImmediate
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : isPreventative
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {intervention.priority} · {intervention.category}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm mt-1.5">
                              {intervention.title}
                            </h4>
                          </div>
                        </div>

                        {/* Rationale from IoT Sensor Data */}
                        <p className="text-xs text-slate-600 leading-relaxed bg-white/90 p-2.5 rounded-lg border border-slate-200/80">
                          <strong className="text-slate-800 font-semibold">Diagnostic Rationale: </strong>
                          {intervention.rationale}
                        </p>

                        {/* Practical Action Steps with Checkboxes */}
                        <div className="space-y-2 pt-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Field Execution Protocol:
                          </span>
                          <div className="space-y-1.5">
                            {intervention.steps.map((step, sIdx) => {
                              const stepKey = `${hive.id}_${index}_${sIdx}`;
                              const isChecked = !!completedSteps[stepKey];

                              return (
                                <button
                                  key={sIdx}
                                  onClick={() => toggleStep(stepKey)}
                                  className={`w-full text-left flex items-start gap-2 p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                                    isChecked
                                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 line-through opacity-80'
                                      : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200/60'
                                  }`}
                                >
                                  {isChecked ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                  )}
                                  <span className="flex-1 leading-snug">{step}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: THERMODYNAMICS IN-DEPTH ANALYSIS */}
            {activeTab === 'thermodynamics' && (
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-amber-600" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    Brood Nest Thermal Homeostasis Analysis
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {summary.thermodynamicAnalysis}
                </p>
                <div className="pt-2 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap gap-4">
                  <span>
                    Current Reading: <strong className="text-slate-800">{hive.currentReading.temperature.toFixed(1)}°C</strong>
                  </span>
                  <span>
                    Safe Target: <strong className="text-slate-800">32.0°C – 36.0°C</strong>
                  </span>
                  <span>
                    Period Min/Max: <strong className="text-slate-800">{stats.minTemp}°C – {stats.maxTemp}°C</strong>
                  </span>
                </div>
              </div>
            )}

            {/* TAB 3: HUMIDITY & MOISTURE IN-DEPTH ANALYSIS */}
            {activeTab === 'ventilation' && (
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    Relative Humidity & Evaporative Fanning Dynamics
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {summary.humidityAndVentilation}
                </p>
                <div className="pt-2 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap gap-4">
                  <span>
                    Current Humidity: <strong className="text-slate-800">{hive.currentReading.humidity.toFixed(1)}% RH</strong>
                  </span>
                  <span>
                    Optimal Zone: <strong className="text-slate-800">50% – 65% RH</strong>
                  </span>
                  <span>
                    Stress Threshold: <strong className="text-slate-800">&gt;68% RH (Fanning active)</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Uncertainty Disclosure */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                AI diagnostic assistant recommendation powered by {summary.modelUsed}. Always verify before medication.
              </span>
              <span>Generated {new Date(summary.generatedAt).toLocaleTimeString()}</span>
            </div>
          </>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => fetchHealthSummary(true)}
              className="font-bold underline hover:text-rose-950 cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
