import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Smartphone,
  FlaskConical,
  Building2,
  AlertTriangle,
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Radio,
  Map,
  Camera,
  Award,
} from 'lucide-react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  onOpenDemoGuide: () => void;
  onOpenQRScanner?: () => void;
  unreadAlertCount: number;
  latestBlockNumber: number;
}

export function Navbar({
  currentView,
  onSelectView,
  onOpenDemoGuide,
  onOpenQRScanner,
  unreadAlertCount,
  latestBlockNumber,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top micro-bar: Network & Hackathon context */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60">
            <span>SIH 2026</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-300">Problem Statement SIH26021</span>
          </span>
          <span className="hidden sm:inline text-slate-400">
            Ministry of MSME & KVIC Honey Mission
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-mono">Polygon Amoy Block #{latestBlockNumber.toLocaleString()}</span>
          </div>
          <span className="hidden md:inline text-slate-600">|</span>
          <div className="hidden md:flex items-center gap-1 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Smart Contract: HoneyChainRegistry</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand identity */}
        <div
          onClick={() => onSelectView('beekeeper')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-inner group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-white tracking-tight">Honey Chain</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PROVENANCE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
              Hive-to-Jar Traceability & Smart Beekeeping
            </p>
          </div>
        </div>

        {/* View Switcher / Portals */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onSelectView('beekeeper')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'beekeeper'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Beekeeper & IoT</span>
          </button>

          <button
            onClick={() => onSelectView('apiary-map')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'apiary-map'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Apiary Map</span>
          </button>

          <button
            onClick={() => onSelectView('consumer')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'consumer'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Consumer QR Verify</span>
          </button>

          <button
            onClick={() => onSelectView('farmer-passport')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'farmer-passport'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Farmer Passport & QR</span>
          </button>

          <button
            onClick={() => onSelectView('lab')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'lab'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Lab Quality</span>
          </button>

          <button
            onClick={() => onSelectView('admin')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>KVIC Cluster Admin</span>
          </button>

          <button
            onClick={() => onSelectView('tamper-demo')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'tamper-demo'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-rose-300 hover:text-white hover:bg-rose-950/40 border border-rose-800/40'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Tamper Proof Test</span>
          </button>

          <button
            onClick={() => onSelectView('learning-hub')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'learning-hub'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-indigo-300 hover:text-white hover:bg-indigo-950/40'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Architecture & Explainer</span>
          </button>
        </nav>

        {/* Action button: 6-Minute SIH Demo & QR Scanner */}
        <div className="flex items-center gap-2">
          {onOpenQRScanner && (
            <button
              onClick={onOpenQRScanner}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-amber-400 border border-slate-700 font-bold px-3 py-2 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
              title="Scan Honey Jar QR with Camera or Image"
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>
          )}

          <button
            onClick={onOpenDemoGuide}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs shadow-lg shadow-amber-950/30 transition-all cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span className="hidden sm:inline">6-Min SIH</span> Demo Guide
          </button>
        </div>
      </div>

      {/* Mobile view sub-tabs */}
      <div className="lg:hidden flex overflow-x-auto gap-1 px-3 py-2 bg-slate-950 border-t border-slate-800 scrollbar-none">
        <button
          onClick={() => onSelectView('beekeeper')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            currentView === 'beekeeper' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
          }`}
        >
          🐝 Beekeeper
        </button>
        <button
          onClick={() => onSelectView('apiary-map')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            currentView === 'apiary-map' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
          }`}
        >
          🗺️ Apiary Map
        </button>
        <button
          onClick={() => onSelectView('consumer')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            currentView === 'consumer' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
          }`}
        >
          📱 QR Verify
        </button>
        <button
          onClick={() => onSelectView('farmer-passport')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            currentView === 'farmer-passport' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
          }`}
        >
          👨‍🌾 Farmer QR
        </button>
        <button
          onClick={() => onSelectView('lab')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            currentView === 'lab' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
          }`}
        >
          🧪 Lab
        </button>
        <button
          onClick={() => onSelectView('admin')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            currentView === 'admin' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
          }`}
        >
          🏛️ KVIC Admin
        </button>
        <button
          onClick={() => onSelectView('tamper-demo')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            currentView === 'tamper-demo' ? 'bg-rose-600 text-white' : 'text-rose-300'
          }`}
        >
          ⚡ Tamper Test
        </button>
        <button
          onClick={() => onSelectView('learning-hub')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            currentView === 'learning-hub' ? 'bg-indigo-600 text-white' : 'text-indigo-300'
          }`}
        >
          📚 Explainer
        </button>
      </div>
    </header>
  );
}
