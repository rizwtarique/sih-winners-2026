import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  LineChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Hive, TelemetryPoint, TelemetryDateRange } from '../types';
import { generateTelemetryForRange, computeTelemetryStats } from '../data/telemetryData';
import {
  Thermometer,
  Droplets,
  TrendingUp,
  Activity,
  Layers,
  Info,
  Clock,
  Calendar,
  Scale,
  FileDown,
} from 'lucide-react';

interface HiveTelemetryChartProps {
  hives: Hive[];
  selectedHive: Hive;
  onSelectHive: (hiveId: string) => void;
  onExportCompliance?: () => void;
}

type ChartViewMode = 'dual' | 'temp' | 'humidity' | 'comparison';

export function HiveTelemetryChart({
  hives,
  selectedHive,
  onSelectHive,
  onExportCompliance,
}: HiveTelemetryChartProps) {
  const [dateRange, setDateRange] = useState<TelemetryDateRange>('24h');
  const [viewMode, setViewMode] = useState<ChartViewMode>('dual');
  const [comparisonMetric, setComparisonMetric] = useState<'temp' | 'humidity'>('temp');

  // Compute telemetry data for selected hive across chosen date range
  const selectedHiveData = useMemo(() => {
    return generateTelemetryForRange(selectedHive, dateRange);
  }, [selectedHive, selectedHive.currentReading, dateRange]);

  // Compute data for all hives for comparison view
  const comparisonData = useMemo(() => {
    const hiveDataMap = hives.map((h) => ({
      hive: h,
      data: generateTelemetryForRange(h, dateRange),
    }));

    // Merge by index
    return selectedHiveData.map((item, idx) => {
      const merged: Record<string, any> = {
        time: item.time,
        fullLabel: item.fullLabel,
        hour: item.hour,
        date: item.date,
      };
      hiveDataMap.forEach(({ hive, data }) => {
        const d = data[idx] || item;
        merged[`temp_${hive.id}`] = d.temperature;
        merged[`humidity_${hive.id}`] = d.humidity;
        merged[`weight_${hive.id}`] = d.weightKg;
      });
      return merged;
    });
  }, [hives, selectedHiveData, dateRange]);

  // Descriptive statistics for the selected hive
  const stats = useMemo(() => {
    return computeTelemetryStats(selectedHiveData);
  }, [selectedHiveData]);

  // Dynamic XAxis interval based on date range
  const xAxisInterval = useMemo(() => {
    if (dateRange === '24h') return 2;
    if (dateRange === '7d') return 0; // Show all 7 days
    return 4; // 30 days: show every ~5 days
  }, [dateRange]);

  // Custom Tooltip for Dual and Single views
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const dataPoint: TelemetryPoint = payload[0]?.payload;
    if (!dataPoint) return null;

    const isSpike = dataPoint.temperature > 36.5;
    const isCold = dataPoint.temperature < 32.0;
    const isHighHumidity = dataPoint.humidity > 68.0;

    const headerTitle =
      dateRange === '24h'
        ? dataPoint.time === 'Now'
          ? 'Current Reading (Live)'
          : dataPoint.fullLabel || `${dataPoint.time} (Hour ${dataPoint.hour})`
        : dataPoint.fullLabel || dataPoint.time;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl border border-slate-700/80 shadow-xl text-xs space-y-2 min-w-[220px] z-50">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
          <span className="font-bold font-mono text-amber-400 flex items-center gap-1.5">
            {dateRange === '24h' ? (
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
            )}
            {headerTitle}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {selectedHive.hiveCode}
          </span>
        </div>

        <div className="space-y-1.5">
          {/* Temperature row */}
          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              Brood Temperature:
            </span>
            <span className="font-bold text-slate-100 font-mono">
              {dataPoint.temperature?.toFixed(1)}°C
            </span>
          </div>

          {/* Temperature status pill */}
          <div className="text-[10px] pl-4">
            {isSpike ? (
              <span className="text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800 font-semibold">
                ⚠️ Thermal Spike (+{(dataPoint.temperature - 36.0).toFixed(1)}°C)
              </span>
            ) : isCold ? (
              <span className="text-blue-300 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-800 font-semibold">
                ❄️ Below Brood Baseline
              </span>
            ) : (
              <span className="text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800 font-semibold">
                ✓ Optimal Brood Nest (32-36°C)
              </span>
            )}
          </div>

          {/* Humidity row */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-300 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              Relative Humidity:
            </span>
            <span className="font-bold text-slate-100 font-mono">
              {dataPoint.humidity?.toFixed(1)}%
            </span>
          </div>

          {/* Humidity status pill */}
          <div className="text-[10px] pl-4">
            {isHighHumidity ? (
              <span className="text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800 font-semibold">
                ⚠️ Elevated (Fanning Cooling)
              </span>
            ) : (
              <span className="text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded font-medium">
                ✓ Normal Hive RH (50-65%)
              </span>
            )}
          </div>

          {/* Gross Weight row */}
          {dataPoint.weightKg !== undefined && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/70">
              <span className="text-slate-300 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-amber-500" />
                Colony Weight:
              </span>
              <span className="font-bold text-amber-300 font-mono">
                {dataPoint.weightKg.toFixed(1)} kg
              </span>
            </div>
          )}

          {/* Ambient comparison */}
          {dataPoint.ambientTemp !== undefined && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
              <span>Outside Ambient:</span>
              <span className="font-mono text-slate-300">{dataPoint.ambientTemp}°C</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Custom Tooltip for Comparison View
  const ComparisonTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl border border-slate-700/80 shadow-xl text-xs space-y-1.5 min-w-[210px] z-50">
        <div className="font-bold font-mono text-amber-400 pb-1 border-b border-slate-800 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{label}</span>
        </div>
        {payload.map((entry: any, i: number) => {
          const hive = hives.find((h) => entry.dataKey?.includes(h.id));
          return (
            <div key={i} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: entry.color }}
                ></span>
                {hive?.hiveCode || entry.name}:
              </span>
              <span className="font-mono font-bold text-white">
                {entry.value?.toFixed(1)}
                {comparisonMetric === 'temp' ? '°C' : '%'}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const hiveColors = ['#f59e0b', '#ef4444', '#10b981', '#6366f1'];

  const rangeTitle =
    dateRange === '24h'
      ? '24-Hour'
      : dateRange === '7d'
      ? '7-Day'
      : '30-Day';

  const rangeBadge =
    dateRange === '24h'
      ? 'Hourly (24 pts)'
      : dateRange === '7d'
      ? 'Daily (7 days)'
      : 'Monthly (30 days)';

  return (
    <div
      id="hive-telemetry-recharts-card"
      className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5"
    >
      {/* Top Header: Title, Date Range Selector, and View Mode Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>{rangeTitle} Hive Environmental Telemetry</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                  {rangeBadge}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Brood nest temperature (°C) & relative humidity (%) trending with biological homeostasis thresholds
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Date Range Toggle + View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Selector Segmented Buttons */}
          <div
            id="telemetry-date-range-toggle"
            className="bg-slate-100 p-1 rounded-xl flex items-center gap-0.5 text-xs font-semibold text-slate-700 border border-slate-200/60"
          >
            <button
              id="range-toggle-24h"
              onClick={() => setDateRange('24h')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                dateRange === '24h'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'hover:text-slate-900 text-slate-600 hover:bg-slate-200/60'
              }`}
              title="View past 24 hours in hourly increments"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>24h</span>
            </button>
            <button
              id="range-toggle-7d"
              onClick={() => setDateRange('7d')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                dateRange === '7d'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'hover:text-slate-900 text-slate-600 hover:bg-slate-200/60'
              }`}
              title="View past 7 days daily trends"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>7 Days</span>
            </button>
            <button
              id="range-toggle-30d"
              onClick={() => setDateRange('30d')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                dateRange === '30d'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'hover:text-slate-900 text-slate-600 hover:bg-slate-200/60'
              }`}
              title="View past 30 days monthly progression"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>30 Days</span>
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-0.5 text-xs font-semibold text-slate-700 border border-slate-200/60">
            <button
              onClick={() => setViewMode('dual')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'dual'
                  ? 'bg-white text-slate-950 font-bold shadow-xs'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              Dual Axis (Temp & RH%)
            </button>
            <button
              onClick={() => setViewMode('temp')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'temp'
                  ? 'bg-white text-amber-700 font-bold shadow-xs'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              <Thermometer className="w-3 h-3 text-amber-600" />
              <span>Temp</span>
            </button>
            <button
              onClick={() => setViewMode('humidity')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'humidity'
                  ? 'bg-white text-blue-700 font-bold shadow-xs'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              <Droplets className="w-3 h-3 text-blue-600" />
              <span>Humidity</span>
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'comparison'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              <Layers className="w-3 h-3 text-indigo-600" />
              <span>Compare</span>
            </button>
          </div>

          {/* Quick Export Trigger Button */}
          {onExportCompliance && (
            <button
              onClick={onExportCompliance}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
              title="Export telemetry logs as PDF or CSV"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Export Audit Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* Hive Switcher Pills Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1 mr-1">
            Active Hive:
          </span>
          {hives.map((hive) => {
            const isSelected = hive.id === selectedHive.id;
            return (
              <button
                key={hive.id}
                onClick={() => onSelectHive(hive.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    hive.status === 'healthy'
                      ? 'bg-emerald-500'
                      : hive.status === 'watch'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                ></span>
                <span>{hive.hiveCode}</span>
                <span className="text-[10px] font-normal opacity-80">
                  ({hive.currentReading.temperature.toFixed(1)}°C)
                </span>
              </button>
            );
          })}
        </div>

        {/* Mode-specific sub controls */}
        {viewMode === 'comparison' && (
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <span className="text-slate-500 text-[11px] px-1.5">Metric:</span>
            <button
              onClick={() => setComparisonMetric('temp')}
              className={`px-2 py-1 rounded text-xs transition-all ${
                comparisonMetric === 'temp'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Temperature
            </button>
            <button
              onClick={() => setComparisonMetric('humidity')}
              className={`px-2 py-1 rounded text-xs transition-all ${
                comparisonMetric === 'humidity'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Humidity
            </button>
          </div>
        )}
      </div>

      {/* Recharts Canvas Section */}
      <div className="relative w-full">
        {/* VIEW 1: DUAL AXIS COMPOSED CHART (TEMP + HUMIDITY) */}
        {viewMode === 'dual' && (
          <div className="w-full h-80 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={selectedHiveData}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="tempGradientDual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="humGradientDual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

                {/* Safe Brood Nest Limits on Left Axis */}
                <ReferenceLine
                  y={36.0}
                  yAxisId="tempAxis"
                  stroke="#10b981"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Safe Max (36°C)',
                    fill: '#059669',
                    fontSize: 10,
                    position: 'insideTopLeft',
                  }}
                />
                <ReferenceLine
                  y={32.0}
                  yAxisId="tempAxis"
                  stroke="#10b981"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Safe Min (32°C)',
                    fill: '#059669',
                    fontSize: 10,
                    position: 'insideBottomLeft',
                  }}
                />

                {/* Heat Stress Alert Threshold */}
                <ReferenceLine
                  y={36.5}
                  yAxisId="tempAxis"
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Stress >36.5°C',
                    fill: '#ef4444',
                    fontSize: 10,
                    position: 'right',
                  }}
                />

                <XAxis
                  dataKey="time"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  interval={xAxisInterval}
                />

                {/* Left Y-Axis: Temperature (°C) */}
                <YAxis
                  yAxisId="tempAxis"
                  domain={[30, 40]}
                  tick={{ fill: '#d97706', fontSize: 11, fontWeight: 'bold' }}
                  tickLine={false}
                  axisLine={{ stroke: '#fde68a' }}
                  unit="°C"
                  width={42}
                />

                {/* Right Y-Axis: Humidity (%) */}
                <YAxis
                  yAxisId="humAxis"
                  orientation="right"
                  domain={[40, 80]}
                  tick={{ fill: '#0284c7', fontSize: 11, fontWeight: 'bold' }}
                  tickLine={false}
                  axisLine={{ stroke: '#bae6fd' }}
                  unit="%"
                  width={38}
                />

                <Tooltip content={<CustomTooltip />} />

                <Legend
                  verticalAlign="top"
                  height={32}
                  formatter={(value) => (
                    <span className="text-xs font-bold text-slate-700 capitalize mr-3">
                      {value === 'temperature'
                        ? 'Brood Temp (°C - Left Axis)'
                        : 'Relative Humidity (% - Right Axis)'}
                    </span>
                  )}
                />

                {/* Temperature Area + Line */}
                <Area
                  yAxisId="tempAxis"
                  type="monotone"
                  dataKey="temperature"
                  name="temperature"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  fill="url(#tempGradientDual)"
                  dot={{ r: dateRange === '30d' ? 1.5 : 2.5, fill: '#d97706' }}
                  activeDot={{ r: 5, fill: '#b45309', stroke: '#fff', strokeWidth: 2 }}
                />

                {/* Humidity Line */}
                <Line
                  yAxisId="humAxis"
                  type="monotone"
                  dataKey="humidity"
                  name="humidity"
                  stroke="#0284c7"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  dot={{ r: dateRange === '30d' ? 1.5 : 2.5, fill: '#0284c7' }}
                  activeDot={{ r: 5, fill: '#0369a1', stroke: '#fff', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* VIEW 2: TEMPERATURE FOCUS WITH SAFE BAND & AMBIENT COMPARISON */}
        {viewMode === 'temp' && (
          <div className="w-full h-80 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={selectedHiveData}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="tempGradientSolo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

                {/* Reference Lines for Safe Brood Zone (32 - 36°C) */}
                <ReferenceLine
                  y={36.0}
                  stroke="#10b981"
                  strokeDasharray="2 2"
                  label={{
                    value: 'Upper Ideal Brood Limit (36.0°C)',
                    fill: '#059669',
                    fontSize: 10,
                    position: 'insideTopLeft',
                  }}
                />

                <ReferenceLine
                  y={32.0}
                  stroke="#10b981"
                  strokeDasharray="2 2"
                  label={{
                    value: 'Lower Ideal Brood Limit (32.0°C)',
                    fill: '#059669',
                    fontSize: 10,
                    position: 'insideBottomLeft',
                  }}
                />

                <ReferenceLine
                  y={36.5}
                  stroke="#dc2626"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  label={{
                    value: 'Critical Thermal Stress Spike (36.5°C)',
                    fill: '#dc2626',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />

                <XAxis
                  dataKey="time"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  interval={xAxisInterval}
                />

                <YAxis
                  domain={[30, 40]}
                  tick={{ fill: '#d97706', fontSize: 11, fontWeight: 'bold' }}
                  tickLine={false}
                  axisLine={{ stroke: '#fde68a' }}
                  unit="°C"
                  width={42}
                />

                <Tooltip content={<CustomTooltip />} />

                <Legend
                  verticalAlign="top"
                  height={32}
                  formatter={(value) => (
                    <span className="text-xs font-bold text-slate-700 capitalize mr-3">
                      {value === 'temperature'
                        ? `${selectedHive.hiveCode} Internal Brood Nest (°C)`
                        : 'Outside Ambient Temperature (°C)'}
                    </span>
                  )}
                />

                {/* Outside Ambient Reference Line */}
                <Line
                  type="monotone"
                  dataKey="ambientTemp"
                  name="ambientTemp"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                />

                {/* Internal Brood Temperature */}
                <Area
                  type="monotone"
                  dataKey="temperature"
                  name="temperature"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  fill="url(#tempGradientSolo)"
                  dot={{ r: dateRange === '30d' ? 2 : 3, fill: '#d97706' }}
                  activeDot={{ r: 6, fill: '#b45309', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* VIEW 3: HUMIDITY FOCUS WITH OPTIMAL ZONE */}
        {viewMode === 'humidity' && (
          <div className="w-full h-80 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={selectedHiveData}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="humGradientSolo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

                {/* Ideal Hive Humidity Range: 50% - 65% */}
                <ReferenceLine
                  y={65}
                  stroke="#0284c7"
                  strokeDasharray="2 2"
                  label={{
                    value: 'Ideal RH Upper (65%)',
                    fill: '#0284c7',
                    fontSize: 10,
                    position: 'insideTopLeft',
                  }}
                />
                <ReferenceLine
                  y={50}
                  stroke="#0284c7"
                  strokeDasharray="2 2"
                  label={{
                    value: 'Ideal RH Lower (50%)',
                    fill: '#0284c7',
                    fontSize: 10,
                    position: 'insideBottomLeft',
                  }}
                />

                <ReferenceLine
                  y={68}
                  stroke="#d97706"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Elevated Fanning Evaporation (>68%)',
                    fill: '#d97706',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />

                <XAxis
                  dataKey="time"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  interval={xAxisInterval}
                />

                <YAxis
                  domain={[40, 80]}
                  tick={{ fill: '#0284c7', fontSize: 11, fontWeight: 'bold' }}
                  tickLine={false}
                  axisLine={{ stroke: '#bae6fd' }}
                  unit="%"
                  width={38}
                />

                <Tooltip content={<CustomTooltip />} />

                <Legend
                  verticalAlign="top"
                  height={32}
                  formatter={() => (
                    <span className="text-xs font-bold text-slate-700 capitalize mr-3">
                      {selectedHive.hiveCode} Relative Humidity (RH%)
                    </span>
                  )}
                />

                <Area
                  type="monotone"
                  dataKey="humidity"
                  name="humidity"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fill="url(#humGradientSolo)"
                  dot={{ r: dateRange === '30d' ? 2 : 3, fill: '#0284c7' }}
                  activeDot={{ r: 6, fill: '#0369a1', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* VIEW 4: MULTI-HIVE COMPARISON */}
        {viewMode === 'comparison' && (
          <div className="w-full h-80 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={comparisonData}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

                {comparisonMetric === 'temp' && (
                  <>
                    <ReferenceLine
                      y={36.0}
                      stroke="#10b981"
                      strokeDasharray="2 2"
                      label={{
                        value: 'Safe Max (36°C)',
                        fill: '#059669',
                        fontSize: 10,
                        position: 'insideTopLeft',
                      }}
                    />
                    <ReferenceLine
                      y={32.0}
                      stroke="#10b981"
                      strokeDasharray="2 2"
                      label={{
                        value: 'Safe Min (32°C)',
                        fill: '#059669',
                        fontSize: 10,
                        position: 'insideBottomLeft',
                      }}
                    />
                  </>
                )}

                <XAxis
                  dataKey="time"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  interval={xAxisInterval}
                />

                <YAxis
                  domain={comparisonMetric === 'temp' ? [30, 40] : [40, 80]}
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  unit={comparisonMetric === 'temp' ? '°C' : '%'}
                  width={42}
                />

                <Tooltip content={<ComparisonTooltip />} />

                <Legend
                  verticalAlign="top"
                  height={32}
                  formatter={(value) => {
                    const hive = hives.find((h) => value?.includes(h.id));
                    return (
                      <span className="text-xs font-bold text-slate-800 capitalize mr-3">
                        {hive?.hiveCode || value} ({hive?.location.split(',')[0]})
                      </span>
                    );
                  }}
                />

                {hives.map((hive, idx) => {
                  const dataKey =
                    comparisonMetric === 'temp'
                      ? `temp_${hive.id}`
                      : `humidity_${hive.id}`;
                  const color = hiveColors[idx % hiveColors.length];
                  return (
                    <Line
                      key={hive.id}
                      type="monotone"
                      dataKey={dataKey}
                      name={dataKey}
                      stroke={color}
                      strokeWidth={hive.id === selectedHive.id ? 3 : 1.8}
                      strokeDasharray={hive.status === 'watch' ? '4 2' : undefined}
                      dot={{ r: dateRange === '30d' ? 1.5 : 2 }}
                      activeDot={{ r: 5 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Dynamic Statistical Summary Strip for Selected Date Range */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
        {/* Min / Max Temperature */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
            {rangeTitle} Brood Temp Range
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-slate-900">
              {stats.minTemp}°C - {stats.maxTemp}°C
            </span>
            <span className="text-[10px] text-slate-500">
              (Δ {stats.tempDelta}°C)
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block">
            Avg: <strong className="text-slate-800">{stats.avgTemp}°C</strong>
          </span>
        </div>

        {/* Min / Max Humidity */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            {rangeTitle} Relative Humidity
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-slate-900">
              {stats.minHumidity}% - {stats.maxHumidity}%
            </span>
            <span className="text-[10px] text-slate-500">
              (Δ {stats.humidityDelta}%)
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block">
            Avg: <strong className="text-slate-800">{stats.avgHumidity}%</strong>
          </span>
        </div>

        {/* Homeostasis Stability Index */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            Brood Homeostasis
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-base font-bold ${
                stats.optimalTempPct >= 90
                  ? 'text-emerald-700'
                  : stats.optimalTempPct >= 75
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {stats.optimalTempPct}%
            </span>
            <span className="text-[10px] text-slate-500">in safe 32-36°C</span>
          </div>
          <span className="text-[10px] text-slate-500 block">
            {stats.thermalSpikeCount > 0 ? (
              <span className="text-rose-600 font-bold">
                {stats.thermalSpikeCount} {dateRange === '24h' ? 'hours' : 'days'} heat stress
              </span>
            ) : (
              <span className="text-emerald-600 font-bold">100% thermally stable</span>
            )}
          </span>
        </div>

        {/* Colony Weight & Nectar Inflow */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
            <Scale className="w-3.5 h-3.5 text-amber-600" />
            {rangeTitle} Weight Flux
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-base font-bold ${
                stats.weightDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {stats.weightDelta >= 0 ? '+' : ''}
              {stats.weightDelta} kg
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              ({stats.startWeight}kg → {stats.endWeight}kg)
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block truncate">
            {dateRange === '24h'
              ? 'HX711 Telemetry Channel (QoS 1)'
              : 'Nectar flow & honey accumulation rate'}
          </span>
        </div>
      </div>
    </div>
  );
}
