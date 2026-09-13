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
  Printer,
  QrCode,
  Tag,
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
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white">
      {/* Top contextual bar */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-amber-300 font-medium px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
            <span>SIH 2026</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">Problem SIH26021</span>
          </span>
          <span className="hidden sm:inline text-slate-400">
            Ministry of MSME & KVIC Honey Mission
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Radio className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">Polygon Block #{latestBlockNumber.toLocaleString()}</span>
          </div>
          <span className="hidden md:inline text-slate-700">|</span>
          <div className="hidden md:flex items-center gap-1.5 text-slate-300 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>HoneyChainRegistry</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Brand identity */}
        <div
          onClick={() => onSelectView('beekeeper')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-tight">Honey Chain</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Provenance
              </span>
            </div>
          </div>
        </div>

        {/* Primary View Switcher */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onSelectView('beekeeper')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              currentView === 'beekeeper'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Apiary & IoT</span>
          </button>

          <button
            onClick={() => onSelectView('apiary-map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              currentView === 'apiary-map'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Apiary Map</span>
          </button>

          <button
            onClick={() => onSelectView('bottle-sticker')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              currentView === 'bottle-sticker' || currentView === 'print-sticker'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
            title="Generate Printable Honey Bottle QR Stickers"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Bottle Sticker</span>
          </button>

          <button
            onClick={() => onSelectView('consumer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              currentView === 'consumer'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Consumer View</span>
          </button>

          <button
            onClick={() => onSelectView('farmer-passport')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              currentView === 'farmer-passport'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Farmer Passport</span>
          </button>

          <button
            onClick={() => onSelectView('lab')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              currentView === 'lab'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Lab Quality</span>
          </button>

          <button
            onClick={() => onSelectView('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              currentView === 'admin'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>KVIC Admin</span>
          </button>

          <div className="w-px h-4 bg-slate-800 mx-1" />

          <button
            onClick={() => onSelectView('tamper-demo')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              currentView === 'tamper-demo'
                ? 'bg-rose-600 text-white'
                : 'text-rose-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Interactive Tamper Detection Demo"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Tamper Test</span>
          </button>

          <button
            onClick={() => onSelectView('learning-hub')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              currentView === 'learning-hub'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="System Architecture & Whitepaper"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Explainer</span>
          </button>
        </nav>

        {/* Action button: QR Scanner & Demo Guide */}
        <div className="flex items-center gap-2">
          {onOpenQRScanner && (
            <button
              onClick={onOpenQRScanner}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
              title="Scan Honey Jar QR with Camera or Image"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>
          )}

          <button
            onClick={onOpenDemoGuide}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Demo Guide</span>
          </button>
        </div>
      </div>

      {/* Mobile view sub-tabs */}
      <div className="lg:hidden flex overflow-x-auto gap-1 px-3 py-2 bg-slate-950 border-t border-slate-800 scrollbar-none text-xs">
        <button
          onClick={() => onSelectView('beekeeper')}
          className={`flex-shrink-0 px-2.5 py-1 rounded-md font-semibold ${
            currentView === 'beekeeper' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          Apiary
        </button>
        <button
          onClick={() => onSelectView('apiary-map')}
          className={`flex-shrink-0 px-2.5 py-1 rounded-md font-semibold ${
            currentView === 'apiary-map' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          Map
        </button>
        <button
          onClick={() => onSelectView('bottle-sticker')}
          className={`flex-shrink-0 px-2.5 py-1 rounded-md font-semibold ${
            currentView === 'bottle-sticker' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sticker
        </button>
        <button
          onClick={() => onSelectView('consumer')}
          className={`flex-shrink-0 px-2.5 py-1 rounded-md font-semibold ${
            currentView === 'consumer' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          Verify
        </button>
        <button
          onClick={() => onSelectView('farmer-passport')}
          className={`flex-shrink-0 px-2.5 py-1 rounded-md font-semibold ${
            currentView === 'farmer-passport' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          Farmer
        </button>
        <button
          onClick={() => onSelectView('lab')}
          className={`flex-shrink-0 px-2.5 py-1 rounded-md font-semibold ${
            currentView === 'lab' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          Lab
        </button>
        <button
          onClick={() => onSelectView('admin')}
          className={`flex-shrink-0 px-2.5 py-1 rounded-md font-semibold ${
            currentView === 'admin' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          Admin
        </button>
        <button
          onClick={() => onSelectView('tamper-demo')}
          className={`flex-shrink-0 px-2.5 py-1 rounded-md font-semibold ${
            currentView === 'tamper-demo' ? 'bg-rose-600 text-white' : 'text-rose-400 hover:text-white'
          }`}
        >
          Tamper
        </button>
        <button
          onClick={() => onSelectView('learning-hub')}
          className={`flex-shrink-0 px-2.5 py-1 rounded-md font-semibold ${
            currentView === 'learning-hub' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Explainer
        </button>
      </div>
    </header>
  );
}
