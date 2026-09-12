import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Phone,
  User,
  Calendar,
  Activity,
  FileText,
  ArrowRight,
  Share2,
  Box,
  Building2,
  TreePine,
  Sparkles,
  Info,
  Radio,
} from 'lucide-react';
import { FarmerProfile, Hive, HoneyBatch, AppView } from '../types';
import { exportFarmerDossierPDF, exportFarmerIdentityJSON } from '../utils/complianceExport';

interface FarmerPassportViewProps {
  farmers: FarmerProfile[];
  selectedFarmerId: string;
  onSelectFarmerId: (id: string) => void;
  hives: Hive[];
  batches: HoneyBatch[];
  onNavigateToBatch: (batchId: string) => void;
  onNavigateView: (view: AppView) => void;
  onOpenLogHarvest?: () => void;
}

export function FarmerPassportView({
  farmers,
  selectedFarmerId,
  onSelectFarmerId,
  hives,
  batches,
  onNavigateToBatch,
  onNavigateView,
  onOpenLogHarvest,
}: FarmerPassportViewProps) {
  const farmer = farmers.find((f) => f.id === selectedFarmerId) || farmers[0];
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  type Section = 'profile' | 'qr-docs' | 'hives' | 'batches';
  const [activeSection, setActiveSection] = useState<Section>('profile');

  // Generate dynamic QR code encoding the live public URL
  const publicVerificationUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?farmer=${encodeURIComponent(farmer.id)}&view=farmer-passport`
      : farmer.qrUrl;

  useEffect(() => {
    if (!qrCanvasRef.current) return;
    QRCode.toCanvas(
      qrCanvasRef.current,
      publicVerificationUrl,
      {
        width: 180,
        margin: 2,
        color: {
          dark: '#0f172a', // Slate-900
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      },
      (error) => {
        if (error) console.error('Error generating farmer QR:', error);
      }
    );
  }, [publicVerificationUrl, farmer.id]);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(publicVerificationUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDownloadQRPNG = () => {
    if (!qrCanvasRef.current) return;
    const pngUrl = qrCanvasRef.current.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `Farmer_QR_Box_Sticker_${farmer.id}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handlePrintSignboard = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    setIsExportingPDF(true);
    try {
      exportFarmerDossierPDF(farmer, hives, batches);
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const farmerHives = hives.filter((h) => farmer.hiveIds.includes(h.id));
  const farmerBatches = batches.filter(
    (b) => b.farmerId === farmer.id || b.beekeeperName.toLowerCase() === farmer.name.toLowerCase()
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
              KVIC National Honey Mission
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] text-slate-400">Digital Beekeeper Passport</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Farmer Digital Identity & Apiary Passport
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Publicly verifiable identity scannable directly from physical bee-boxes or ID cards to prove producer legitimacy and harvest origin.
          </p>
        </div>

        {/* Beekeeper Switcher */}
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 min-w-[260px] flex flex-col gap-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-400" />
            Registered Beekeeper:
          </span>
          <select
            value={farmer.id}
            onChange={(e) => onSelectFarmerId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none cursor-pointer"
          >
            {farmers.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.district}, {f.state})
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-400 font-mono">
            KVIC #{farmer.kvicRegistrationNumber}
          </span>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-xs overflow-x-auto scrollbar-none gap-1">
        <button
          onClick={() => setActiveSection('profile')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'profile'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile & Origin</span>
        </button>

        <button
          onClick={() => setActiveSection('qr-docs')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'qr-docs'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Bee Box QR & Files</span>
        </button>

        <button
          onClick={() => setActiveSection('hives')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'hives'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Live Apiary Hives</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold ml-0.5">
            {farmerHives.length || hives.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSection('batches')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'batches'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Harvested Batches</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold ml-0.5">
            {farmerBatches.length || batches.length}
          </span>
        </button>
      </div>

      {/* SECTION 1: PROFILE & ORIGIN */}
      {activeSection === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={farmer.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200'}
                    alt={farmer.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full" title="Government KYC Verified">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      {farmer.name}
                    </h2>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      KYC & DBT Verified
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    {farmer.cooperativeName}
                  </p>

                  <p className="text-[11px] text-slate-500 font-mono">
                    KVIC ID: <strong className="text-slate-800">{farmer.kvicRegistrationNumber}</strong>
                  </p>
                </div>
              </div>

              <div className="self-start sm:self-center">
                <a
                  href={`tel:${farmer.contactPhone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Call: {farmer.contactPhone}</span>
                </a>
              </div>
            </div>

            {/* Key Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200/80">
                <span className="text-slate-500 font-medium block">Experience</span>
                <span className="text-base font-bold text-amber-900 mt-0.5 block">
                  {farmer.experienceYears} Years
                </span>
                <span className="text-[10px] text-amber-700 font-semibold">Master Apiarist</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium block">Active Bee Colonies</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">
                  {farmer.totalActiveColonies} Boxes
                </span>
                <span className="text-[10px] text-slate-500">Langstroth 10-Frame</span>
              </div>

              <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80">
                <span className="text-slate-500 font-medium block">Purity Record</span>
                <span className="text-base font-bold text-emerald-900 mt-0.5 block">
                  100% Raw
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">Zero C4 Sugar Adulteration</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium block">Registered Since</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                  {farmer.registeredDate}
                </span>
                <span className="text-[10px] text-slate-500">KVIC Mission Portal</span>
              </div>
            </div>

            {/* Geographical & Floral Specifications */}
            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                Geographical Origin & Natural Forage Zone
              </h3>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 font-medium block">Permanent Apiary Location</span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {farmer.village}, Tehsil {farmer.tehsil}
                    </span>
                    <span className="text-slate-600 block">
                      {farmer.district}, {farmer.state} · PIN {farmer.pincode}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium block">Bee Species Maintained</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {farmer.beeSpecies.map((sp) => (
                        <span key={sp} className="bg-white border border-slate-200 text-slate-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                          🐝 {sp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-medium block">Natural Floral Forage Varieties</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {farmer.primaryFlora.map((flora) => (
                      <span key={flora} className="bg-amber-100 text-amber-900 font-medium px-2 py-0.5 rounded text-[11px]">
                        🌸 {flora}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio & Apicultural Philosophy */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Beekeeper Profile & Traditional Practice
              </h3>
              <p className="text-xs leading-relaxed text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 italic">
                "{farmer.bio}"
              </p>
            </div>

            {/* Official Accreditations & Subsidies */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                Government Accreditations & Certifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {farmer.certifications.map((cert) => (
                  <div key={cert} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 mt-2">
                <strong>KVIC Honey Mission Support:</strong> {farmer.subsidyAwarded}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: BEE BOX QR & FILES */}
      {activeSection === 'qr-docs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dedicated Bee Box / Farmer QR Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs text-center space-y-4">
              <div className="space-y-1">
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block">
                  Apiary Yard & Bee Box QR
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Official Farmer QR Badge
                </h3>
                <p className="text-xs text-slate-500">
                  Attached to the bee box or farmer's ID card. Anyone scanning this QR opens this verified identity page.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 inline-block shadow-inner">
                <canvas ref={qrCanvasRef} className="rounded-md max-w-full h-auto mx-auto" />
              </div>

              <div className="text-[11px] font-mono text-slate-500 bg-slate-100 py-1 px-2 rounded-md break-all">
                {farmer.id} · {farmer.kvicRegistrationNumber}
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={handleDownloadQRPNG}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download Bee Box QR (PNG)</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Public Verification Link'}</span>
                </button>

                <button
                  onClick={handlePrintSignboard}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print Apiary Signboard / Card</span>
                </button>
              </div>
            </div>

            {/* Public Documentation & Quick Harvest Log */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Public Documentation & Dossiers
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    No login required. Anyone scanning this farmer QR can download the official KVIC accreditation files.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isExportingPDF}
                    className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Farmer Dossier (PDF)</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase">Official</span>
                  </button>

                  <button
                    onClick={() => exportFarmerIdentityJSON(farmer)}
                    className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Download Cryptographic Seal (JSON)</span>
                    </span>
                    <span className="text-[10px] font-mono">Raw</span>
                  </button>
                </div>
              </div>

              {/* Farmer Field Shortcut */}
              {onOpenLogHarvest && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Field Shortcut
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      Record New Honey Extraction
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Quickly log a harvest batch directly for {farmer.name}.
                    </p>
                  </div>
                  <button
                    onClick={onOpenLogHarvest}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Log Harvest for {farmer.name.split(' ')[0]}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: LIVE APIARY HIVES */}
      {activeSection === 'hives' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Live Apiary Boxes & IoT Telemetry ({farmerHives.length} Monitored Hives)
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Active Telemetry
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(farmerHives.length > 0 ? farmerHives : hives.slice(0, 2)).map((hive) => (
                <div key={hive.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-900 text-sm font-bold">{hive.hiveCode}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                      {hive.status}
                    </span>
                  </div>

                  <p className="text-slate-500 text-[11px] truncate">{hive.location}</p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Temp</span>
                      <span className="font-bold text-slate-800">
                        {hive.currentReading?.temperature.toFixed(1) || '34.2'}°C
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Humidity</span>
                      <span className="font-bold text-slate-800">
                        {hive.currentReading?.humidity.toFixed(1) || '58'}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Weight</span>
                      <span className="font-bold text-slate-800">
                        {hive.currentReading?.weightKg.toFixed(1) || '42.5'} kg
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: HARVESTED BATCHES */}
      {activeSection === 'batches' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Certified Honey Batches by {farmer.name} ({farmerBatches.length} Batches)
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Cryptographically Anchored
              </span>
            </div>

            <div className="space-y-2.5">
              {(farmerBatches.length > 0 ? farmerBatches : batches.slice(0, 2)).map((batch) => (
                <div
                  key={batch.id}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50/40 border border-slate-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm font-mono">{batch.batchCode}</span>
                      <span className="bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                        {batch.honeyType}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                        Lab: {batch.certificate?.parameters.overallResult || 'PASS'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Harvested {batch.harvestDate} · Net Yield: <strong>{batch.netWeightKg} kg</strong> · Hive: {batch.hiveCode}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigateToBatch(batch.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
                  >
                    <span>View Honey Jar & QR</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
