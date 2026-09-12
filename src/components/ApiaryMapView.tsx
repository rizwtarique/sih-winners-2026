import React, { useState, useMemo } from 'react';
import {
  Hive,
  AlertItem,
  HiveStatus,
  AppView,
} from '../types';
import {
  MapPin,
  Compass,
  Thermometer,
  Droplets,
  Scale,
  Activity,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  WifiOff,
  Sun,
  Wind,
  Layers,
  Radio,
  Sprout,
  Waves,
  Eye,
  ArrowUpRight,
  TrendingUp,
  X,
  Sparkles,
  Archive,
  RefreshCw,
  Info,
} from 'lucide-react';

interface ApiaryMapViewProps {
  hives: Hive[];
  alerts: AlertItem[];
  onSelectHiveForTelemetry: (hiveId: string) => void;
  onLogHarvestForHive?: (hive: Hive) => void;
  onNavigateToView?: (view: AppView) => void;
}

type LayerMode = 'status' | 'thermal' | 'weight' | 'acoustics';

export function ApiaryMapView({
  hives,
  alerts,
  onSelectHiveForTelemetry,
  onLogHarvestForHive,
  onNavigateToView,
}: ApiaryMapViewProps) {
  const [selectedYard, setSelectedYard] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | HiveStatus>('all');
  const [activeLayer, setActiveLayer] = useState<LayerMode>('status');
  const [inspectedHiveId, setInspectedHiveId] = useState<string>(hives[0]?.id || '');
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);

  // Available Apiary Yards
  const apiaryYards = useMemo(() => {
    const yardSet = new Set<string>();
    hives.forEach((h) => yardSet.add(h.apiaryName));
    return Array.from(yardSet);
  }, [hives]);

  // Filter hives based on selected yard and status filter
  const filteredHives = useMemo(() => {
    return hives.filter((h) => {
      const matchYard = selectedYard === 'all' || h.apiaryName === selectedYard;
      const matchStatus = statusFilter === 'all' || h.status === statusFilter;
      return matchYard && matchStatus;
    });
  }, [hives, selectedYard, statusFilter]);

  // Currently inspected hive
  const inspectedHive = useMemo(() => {
    return hives.find((h) => h.id === inspectedHiveId) || filteredHives[0] || hives[0];
  }, [hives, inspectedHiveId, filteredHives]);

  // Alerts mapped by hiveId
  const alertsByHiveId = useMemo(() => {
    const map = new Map<string, AlertItem[]>();
    alerts.forEach((alert) => {
      if (alert.hiveId) {
        const list = map.get(alert.hiveId) || [];
        list.push(alert);
        map.set(alert.hiveId, list);
      }
    });
    return map;
  }, [alerts]);

  // Status metrics
  const yardStats = useMemo(() => {
    const total = hives.filter((h) => selectedYard === 'all' || h.apiaryName === selectedYard);
    const healthy = total.filter((h) => h.status === 'healthy').length;
    const watch = total.filter((h) => h.status === 'watch').length;
    const critical = total.filter((h) => h.status === 'critical').length;
    const offline = total.filter((h) => h.status === 'offline').length;
    const totalAlerts = total.reduce((acc, h) => acc + (alertsByHiveId.get(h.id)?.length || 0), 0);
    return {
      totalCount: total.length,
      healthy,
      watch,
      critical,
      offline,
      totalAlerts,
    };
  }, [hives, selectedYard, alertsByHiveId]);

  // Helper for Status Icon
  const renderStatusIcon = (status: HiveStatus, sizeClass = 'w-4 h-4') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className={`${sizeClass} text-emerald-600`} />;
      case 'watch':
        return <AlertTriangle className={`${sizeClass} text-amber-600`} />;
      case 'critical':
        return <AlertOctagon className={`${sizeClass} text-rose-600 animate-pulse`} />;
      case 'offline':
      default:
        return <WifiOff className={`${sizeClass} text-slate-400`} />;
    }
  };

  // Helper for Status Badge styling
  const getStatusBadge = (status: HiveStatus) => {
    switch (status) {
      case 'healthy':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Healthy
          </span>
        );
      case 'watch':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            Watch Alert
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
            Critical
          </span>
        );
      case 'offline':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            Offline
          </span>
        );
    }
  };

  // Heatmap background color based on active layer
  const getCardOverlayStyle = (hive: Hive) => {
    if (activeLayer === 'thermal') {
      const temp = hive.currentReading.temperature;
      if (temp > 37.0) return 'bg-rose-50/80 border-rose-300';
      if (temp >= 32.0 && temp <= 36.5) return 'bg-emerald-50/60 border-emerald-300';
      return 'bg-blue-50/70 border-blue-300';
    }
    if (activeLayer === 'weight') {
      const weight = hive.currentReading.weightKg;
      if (weight >= 50) return 'bg-amber-50/90 border-amber-400';
      if (weight >= 42) return 'bg-amber-50/50 border-amber-200';
      return 'bg-slate-50/60 border-slate-200';
    }
    if (activeLayer === 'acoustics') {
      const db = hive.currentReading.soundDb;
      if (db > 55) return 'bg-rose-50/70 border-rose-300';
      if (db > 45) return 'bg-amber-50/60 border-amber-200';
      return 'bg-emerald-50/60 border-emerald-200';
    }

    // Standard status layer
    if (hive.status === 'critical') return 'bg-rose-50/70 border-rose-400 ring-1 ring-rose-300';
    if (hive.status === 'watch') return 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-200';
    if (hive.status === 'offline') return 'bg-slate-50 border-slate-300 opacity-80';
    return 'bg-white border-slate-200 hover:border-amber-300';
  };

  return (
    <div id="apiary-map-container" className="space-y-6">
      {/* Top Banner & Apiary Location Selector */}
      <div
        id="apiary-map-header"
        className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>GEOGRAPHIC YARD VISUALIZATION</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              WGS84 GPS · 421m AMSL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 tracking-tight">
            Apiary Spatial Map & Colony Grid
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Topographic grid layout of monitored hives, solar microclimate sectors, real-time status icons, and active apicultural health alerts.
          </p>
        </div>

        {/* Apiary Yard Switcher Dropdown */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950/70 p-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-300">Yard:</span>
          </div>
          <select
            id="apiary-yard-select"
            value={selectedYard}
            onChange={(e) => setSelectedYard(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none cursor-pointer"
          >
            <option value="all">Consolidated View (All Yards)</option>
            {apiaryYards.map((yard) => (
              <option key={yard} value={yard}>
                {yard}
              </option>
            ))}
          </select>

          {onNavigateToView && (
            <button
              id="back-to-beekeeper-btn"
              onClick={() => onNavigateToView('beekeeper')}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <span>Beekeeper Telemetry</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Environmental Context & Metric Summary Bar */}
      <div
        id="apiary-metrics-bar"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Monitored Hives
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-slate-900">{yardStats.totalCount}</span>
            <span className="text-xs text-slate-500">boxes active</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Healthy
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-emerald-700">{yardStats.healthy}</span>
            <span className="text-xs text-slate-500">homeostatic</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Watch Alerts
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-amber-700">{yardStats.watch}</span>
            <span className="text-xs text-slate-500">elevation flags</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Critical Alerts
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-rose-700">{yardStats.critical}</span>
            <span className="text-xs text-slate-500">immediate action</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            Solar Insolation
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base font-black text-slate-900">780 W/m²</span>
            <span className="text-[11px] text-amber-600 font-medium">South Face</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-cyan-600" />
            Ambient Weather
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base font-black text-slate-900">32.4°C</span>
            <span className="text-[11px] text-slate-500 font-medium">8 km/h SSE</span>
          </div>
        </div>
      </div>

      {/* Control Strip: Layer Mode & Status Filters */}
      <div
        id="apiary-map-controls"
        className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        {/* Layer Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            Layer:
          </span>
          <button
            id="layer-btn-status"
            onClick={() => setActiveLayer('status')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeLayer === 'status'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Status & Alerts
          </button>
          <button
            id="layer-btn-thermal"
            onClick={() => setActiveLayer('thermal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeLayer === 'thermal'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Thermal Microclimate
          </button>
          <button
            id="layer-btn-weight"
            onClick={() => setActiveLayer('weight')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeLayer === 'weight'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Honey Super Load
          </button>
          <button
            id="layer-btn-acoustics"
            onClick={() => setActiveLayer('acoustics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeLayer === 'acoustics'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Acoustic Density (dB)
          </button>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-1">Filter:</span>
          <button
            id="filter-status-all"
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({yardStats.totalCount})
          </button>
          <button
            id="filter-status-healthy"
            onClick={() => setStatusFilter('healthy')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'healthy'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Healthy ({yardStats.healthy})
          </button>
          <button
            id="filter-status-watch"
            onClick={() => setStatusFilter('watch')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'watch'
                ? 'bg-amber-700 text-white'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            Watch ({yardStats.watch})
          </button>
          <button
            id="filter-status-critical"
            onClick={() => setStatusFilter('critical')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'critical'
                ? 'bg-rose-700 text-white'
                : 'bg-rose-50 text-rose-900 hover:bg-rose-100'
            }`}
          >
            Critical ({yardStats.critical})
          </button>
        </div>
      </div>

      {/* Main Geographic Grid Layout & Side Inspector Drawer */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Apiary Terrain & Geographic Grid (Left / Center) */}
        <div
          id="apiary-grid-stage"
          className={`${
            isInspectorOpen ? 'xl:col-span-8' : 'xl:col-span-12'
          } bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6`}
        >
          {/* Geographic Yard Header with Compass & Orientation Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
                <Compass className="w-5 h-5 text-amber-700 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedYard === 'all'
                    ? 'KVIC Regional Apiary Plots · Spatial Coordinate Layout'
                    : selectedYard}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Hive entrances face South-East (110° - 145°) to capture morning solar thermal lift
                </p>
              </div>
            </div>

            {/* Microclimate Terrain Legend */}
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                <span>Flora Buffer</span>
              </span>
              <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                <Waves className="w-3.5 h-3.5 text-cyan-600" />
                <span>Water Station</span>
              </span>
              <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                <Radio className="w-3.5 h-3.5 text-amber-600" />
                <span>LoRaWAN Gateway</span>
              </span>
            </div>
          </div>

          {/* North Windbreak Barrier Indicator */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-medium">
              <Sprout className="w-4 h-4 text-emerald-700" />
              <span>
                <strong>NORTH WINDBREAK:</strong> Dense 3.5m Acacia & Desert Shrub Buffer (Blocks chilly northern gusts)
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
              0° NORTH
            </span>
          </div>

          {/* Topographic Plot Grid Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHives.map((hive) => {
              const isSelected = hive.id === inspectedHive.id;
              const hiveAlerts = alertsByHiveId.get(hive.id) || [];
              const primaryAlert = hiveAlerts[0];
              const grid = hive.gridPosition || {
                plotCode: 'PL-XX',
                zone: 'Central Parcel',
                orientation: 'South (180°)',
                shadeCover: 'Partial Shade',
              };
              const coords = hive.coordinates || {
                lat: 25.347,
                lng: 74.636,
                elevationMeters: 421,
              };

              return (
                <div
                  key={hive.id}
                  id={`hive-grid-card-${hive.id}`}
                  onClick={() => {
                    setInspectedHiveId(hive.id);
                    setIsInspectorOpen(true);
                  }}
                  className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${getCardOverlayStyle(
                    hive
                  )} ${
                    isSelected
                      ? 'ring-2 ring-amber-500 border-amber-500 shadow-md scale-[1.01]'
                      : 'hover:shadow-sm'
                  }`}
                >
                  {/* Top Row: Plot ID + Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider bg-slate-900 text-amber-300 px-2 py-0.5 rounded">
                          {grid.plotCode}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900 tracking-tight">
                          {hive.hiveCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {grid.zone}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {getStatusBadge(hive.status)}
                    </div>
                  </div>

                  {/* Geographic Coordinates & Orientation */}
                  <div className="mt-2 text-[11px] font-mono text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {grid.orientation}
                    </span>
                  </div>

                  {/* Live IoT Sensor Strip */}
                  <div className="grid grid-cols-4 gap-1.5 mt-2.5 pt-2 border-t border-slate-100/80 text-center">
                    <div className="bg-white/80 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">
                        Temp
                      </span>
                      <span
                        className={`text-xs font-black ${
                          hive.currentReading.temperature > 37.0
                            ? 'text-rose-600'
                            : hive.currentReading.temperature < 31.0
                            ? 'text-blue-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {hive.currentReading.temperature.toFixed(1)}°C
                      </span>
                    </div>

                    <div className="bg-white/80 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">
                        Humidity
                      </span>
                      <span
                        className={`text-xs font-black ${
                          hive.currentReading.humidity > 70
                            ? 'text-amber-700'
                            : 'text-slate-800'
                        }`}
                      >
                        {hive.currentReading.humidity.toFixed(0)}%
                      </span>
                    </div>

                    <div className="bg-white/80 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">
                        Weight
                      </span>
                      <span className="text-xs font-black text-slate-800">
                        {hive.currentReading.weightKg.toFixed(1)}k
                      </span>
                    </div>

                    <div className="bg-white/80 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">
                        Sound
                      </span>
                      <span
                        className={`text-xs font-black ${
                          hive.currentReading.soundDb > 55
                            ? 'text-rose-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {hive.currentReading.soundDb.toFixed(0)}dB
                      </span>
                    </div>
                  </div>

                  {/* Prominent Active Health Alert Banner (if alert exists) */}
                  {primaryAlert ? (
                    <div
                      className={`mt-3 p-2 rounded-lg text-xs font-semibold flex items-start gap-2 border ${
                        primaryAlert.severity === 'critical'
                          ? 'bg-rose-100/90 text-rose-950 border-rose-300'
                          : primaryAlert.severity === 'warning'
                          ? 'bg-amber-100/90 text-amber-950 border-amber-300'
                          : 'bg-blue-50 text-blue-900 border-blue-200'
                      }`}
                    >
                      {primaryAlert.severity === 'critical' ? (
                        <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div className="leading-tight">
                        <span className="font-bold block">{primaryAlert.title}</span>
                        <span className="text-[11px] font-normal line-clamp-1 opacity-90">
                          {primaryAlert.recommendedAction || primaryAlert.message}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 p-2 rounded-lg text-[11px] bg-emerald-50/70 text-emerald-900 border border-emerald-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Homeostatic equilibrium</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700">
                        Score {hive.healthAssessment.overallScore}/100
                      </span>
                    </div>
                  )}

                  {/* Micro Footer Indicator */}
                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span>{grid.shadeCover}</span>
                    <span className="text-amber-700 font-bold hover:underline flex items-center gap-0.5">
                      Inspect Plot <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Landscape Yard Elements in Grid (Infrastructure nodes) */}
            <div className="p-4 rounded-xl border border-dashed border-cyan-300 bg-cyan-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan-900 font-bold text-xs">
                  <Waves className="w-4 h-4 text-cyan-600" />
                  <span>Apiary Water Source & Float Basins</span>
                </div>
                <p className="text-[11px] text-cyan-800 mt-1">
                  Fresh evaporative cooling water reservoir located 12m from hive entrances to support worker droplet fanning.
                </p>
              </div>
              <div className="mt-3 text-[10px] font-mono text-cyan-700 font-semibold">
                Plot REF-W1 · Flow: Clean Static Float
              </div>
            </div>

            <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Radio className="w-4 h-4 text-amber-600" />
                  <span>LoRaWAN Gateway Mast</span>
                </div>
                <p className="text-[11px] text-amber-800 mt-1">
                  868 MHz multi-channel packet forwarder covering 5km apiary radius. Solar-charged LiFePO4 battery storage.
                </p>
              </div>
              <div className="mt-3 text-[10px] font-mono text-amber-700 font-semibold">
                Plot REF-GW1 · RSSI: -68 dBm (Strong)
              </div>
            </div>

            <div className="p-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  <span>Wild Acacia & Mustard Forage Corridor</span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-1">
                  Active floral nectar flow with 2.8km foraging radius. Zero agricultural pesticide zone certified by KVIC.
                </p>
              </div>
              <div className="mt-3 text-[10px] font-mono text-emerald-700 font-semibold">
                Flora Sector Alpha · Peak Morning Bloom
              </div>
            </div>
          </div>

          {/* South Solar Path Footnote */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-amber-950">
            <div className="flex items-center gap-2 font-medium">
              <Sun className="w-4 h-4 text-amber-600" />
              <span>
                <strong>SOUTH SOLAR TRAJECTORY:</strong> Full exposure maximizes winter morning warming and promotes early worker foraging flights.
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
              180° SOUTH
            </span>
          </div>
        </div>

        {/* Selected Hive Geographic Detail & Health Alert Inspector (Right Column) */}
        {isInspectorOpen && inspectedHive && (
          <div
            id="hive-inspector-panel"
            className="xl:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5 sticky top-20"
          >
            {/* Inspector Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg text-slate-900">
                    {inspectedHive.hiveCode}
                  </span>
                  {getStatusBadge(inspectedHive.status)}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {inspectedHive.location}
                </p>
              </div>

              <button
                onClick={() => setIsInspectorOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Close Inspector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Geographic & Biological Metadata */}
            <div className="bg-slate-50 p-3.5 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Grid Plot Code:</span>
                <span className="font-mono font-bold text-slate-800">
                  {inspectedHive.gridPosition?.plotCode || 'PL-A1'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">GPS Latitude:</span>
                <span className="font-mono font-bold text-slate-800">
                  {inspectedHive.coordinates?.lat.toFixed(5)}° N
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">GPS Longitude:</span>
                <span className="font-mono font-bold text-slate-800">
                  {inspectedHive.coordinates?.lng.toFixed(5)}° E
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Elevation:</span>
                <span className="font-mono font-bold text-slate-800">
                  {inspectedHive.coordinates?.elevationMeters || 421} m AMSL
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Queen Age & Box:</span>
                <span className="font-bold text-slate-800">
                  {inspectedHive.queenYear} Marked · {inspectedHive.boxType.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* Telemetry Quadrant */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-600" />
                Live Sensor Telemetry
              </h4>
              <div className="grid grid-cols-2 gap-2.5 text-center">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center justify-center gap-1">
                    <Thermometer className="w-3 h-3 text-amber-600" />
                    Brood Temp
                  </span>
                  <span className="text-sm font-black text-slate-900 block mt-0.5">
                    {inspectedHive.currentReading.temperature.toFixed(1)}°C
                  </span>
                  <span className="text-[10px] text-slate-400">Normal: 32-36°C</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center justify-center gap-1">
                    <Droplets className="w-3 h-3 text-cyan-600" />
                    Relative Humidity
                  </span>
                  <span className="text-sm font-black text-slate-900 block mt-0.5">
                    {inspectedHive.currentReading.humidity.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-400">Normal: 50-65%</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center justify-center gap-1">
                    <Scale className="w-3 h-3 text-emerald-600" />
                    Total Weight
                  </span>
                  <span className="text-sm font-black text-slate-900 block mt-0.5">
                    {inspectedHive.currentReading.weightKg.toFixed(1)} kg
                  </span>
                  <span className="text-[10px] text-slate-400">Nectar trend: +350g</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center justify-center gap-1">
                    <Activity className="w-3 h-3 text-indigo-600" />
                    Sound Amplitude
                  </span>
                  <span className="text-sm font-black text-slate-900 block mt-0.5">
                    {inspectedHive.currentReading.soundDb.toFixed(1)} dB
                  </span>
                  <span className="text-[10px] text-slate-400">Queen baseline</span>
                </div>
              </div>
            </div>

            {/* Current Health Alerts for this Hive */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Active Health Alerts ({alertsByHiveId.get(inspectedHive.id)?.length || 0})
                </span>
                <span className="text-[10px] text-slate-400 font-normal">IoT Automated</span>
              </h4>

              <div className="space-y-2">
                {(alertsByHiveId.get(inspectedHive.id) || []).length > 0 ? (
                  alertsByHiveId.get(inspectedHive.id)!.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-xl border text-xs ${
                        alert.severity === 'critical'
                          ? 'bg-rose-50 border-rose-200 text-rose-950'
                          : alert.severity === 'warning'
                          ? 'bg-amber-50 border-amber-200 text-amber-950'
                          : 'bg-blue-50 border-blue-200 text-blue-950'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{alert.title}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/70">
                          {alert.severity}
                        </span>
                      </div>
                      <p className="mt-1 leading-relaxed opacity-90">{alert.message}</p>
                      {alert.recommendedAction && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60 font-medium">
                          <strong>Recommended Action:</strong> {alert.recommendedAction}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-900 text-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Zero Active Health Anomalies</span>
                    </div>
                    <p className="mt-1 text-emerald-800">
                      Colony {inspectedHive.hiveCode} has maintainted stable thermoregulation within biological parameters for over 14 consecutive days.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Diagnosis Synopsis */}
            <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1 text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Colony Assessment
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  Score {inspectedHive.healthAssessment.overallScore}/100
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {inspectedHive.healthAssessment.predictionHeadline}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-2">
              <button
                id="inspect-view-telemetry-btn"
                onClick={() => onSelectHiveForTelemetry(inspectedHive.id)}
                className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Activity className="w-4 h-4 text-amber-400" />
                <span>View Full Telemetry & AI Diagnosis</span>
              </button>

              {onLogHarvestForHive && (
                <button
                  id="inspect-log-harvest-btn"
                  onClick={() => onLogHarvestForHive(inspectedHive)}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Log Harvest for {inspectedHive.hiveCode}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
