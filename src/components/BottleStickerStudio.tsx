import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { HoneyBatch, Hive, FarmerProfile } from '../types';
import {
  Printer,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Eye,
  Layers,
  Award,
  Calendar,
  MapPin,
  Barcode,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { exportFullAtoZBatchDossierPDF } from '../utils/complianceExport';
import { jsPDF } from 'jspdf';

interface BottleStickerStudioProps {
  batches: HoneyBatch[];
  hives: Hive[];
  farmers: FarmerProfile[];
  initialBatchId?: string;
  onOpenConsumerPage: (batch: HoneyBatch) => void;
}

export function BottleStickerStudio({
  batches,
  hives,
  farmers,
  initialBatchId,
  onOpenConsumerPage,
}: BottleStickerStudioProps) {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    initialBatchId || batches[0]?.id || ''
  );
  const [bottleSize, setBottleSize] = useState<'250g' | '500g' | '1000g'>('500g');
  const [stickerStyle, setStickerStyle] = useState<'wrap' | 'front-square' | 'hex-minimal'>('front-square');
  const [sheetLayout, setSheetLayout] = useState<'single' | 'sheet-4' | 'sheet-8'>('single');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const relatedHive = hives.find((h) => h.id === selectedBatch?.hiveId || h.hiveCode === selectedBatch?.hiveCode);
  const relatedFarmer = farmers.find((f) => f.name === selectedBatch?.beekeeperName || f.id === selectedBatch?.farmerId) || farmers[0];

  // Construct the exact standalone consumer side page URL
  const getConsumerUrl = () => {
    if (typeof window !== 'undefined') {
      const base = `${window.location.origin}${window.location.pathname}`;
      return `${base}?batch=${encodeURIComponent(selectedBatch?.batchCode || '')}&mode=consumer-standalone`;
    }
    return `https://honeychain.gov.in/verify/${selectedBatch?.batchCode}`;
  };

  const consumerUrl = getConsumerUrl();

  // Generate high-resolution QR code
  useEffect(() => {
    let isMounted = true;
    const generateQR = async () => {
      if (!selectedBatch) return;
      try {
        const url = getConsumerUrl();
        const dataUrl = await QRCode.toDataURL(url, {
          width: 400, // High-res for sharp printing
          margin: 1,
          color: {
            dark: '#0f172a', // Deep slate ink
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H', // High error correction for bottle curvature & micro-scratches
        });
        if (isMounted) {
          setQrDataUrl(dataUrl);
        }
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };

    generateQR();
    return () => {
      isMounted = false;
    };
  }, [selectedBatch?.batchCode, selectedBatchId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(consumerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenConsumerPage = () => {
    if (selectedBatch) {
      onOpenConsumerPage(selectedBatch);
    }
  };

  const handleOpenNewTab = () => {
    if (typeof window !== 'undefined') {
      window.open(consumerUrl, '_blank');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Download printable sticker PNG
  const handleDownloadPNG = () => {
    if (!qrDataUrl || !selectedBatch) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 1200, 800);

    // Border
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 1160, 760);

    // Header banner
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(20, 20, 1160, 90);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px Geist, sans-serif';
    ctx.fillText('KVIC HONEY MISSION · GOVT OF INDIA', 50, 75);

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 22px Geist, sans-serif';
    ctx.fillText('HONEYCHAIN 100% PURE RAW UNADULTERATED', 680, 75);

    // Title
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 44px Geist, sans-serif';
    ctx.fillText(selectedBatch.honeyType, 50, 180);

    ctx.fillStyle = '#B45309';
    ctx.font = 'bold 24px Geist, sans-serif';
    ctx.fillText('SINGLE-ORIGIN RAW COLD-EXTRACTED HONEY', 50, 220);

    // Meta details
    ctx.fillStyle = '#334155';
    ctx.font = '24px Geist, sans-serif';
    ctx.fillText(`Batch Code: ${selectedBatch.batchCode}`, 50, 290);
    ctx.fillText(`Origin: ${selectedBatch.district}, ${selectedBatch.state}`, 50, 335);
    ctx.fillText(`Master Beekeeper: ${selectedBatch.beekeeperName}`, 50, 380);
    ctx.fillText(`Harvest Date: ${selectedBatch.harvestDate}`, 50, 425);
    ctx.fillText(`Moisture: ${selectedBatch.moisturePct}% (FSSAI Safe < 20%)`, 50, 470);
    ctx.fillText(`Net Weight: ${bottleSize} (Glass Bottle)`, 50, 515);

    // Security badge
    ctx.fillStyle = '#F0FDF4';
    ctx.fillRect(50, 570, 550, 70);
    ctx.strokeStyle = '#86EFAC';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 570, 550, 70);

    ctx.fillStyle = '#15803D';
    ctx.font = 'bold 20px Geist, sans-serif';
    ctx.fillText('✔ POLYGON BLOCKCHAIN VERIFIED · IMMUTABLE HASH', 70, 613);

    // Instructions
    ctx.fillStyle = '#64748B';
    ctx.font = 'italic 18px Geist, sans-serif';
    ctx.fillText('Scan with smartphone camera to inspect hive sensors, lab report & download PDF', 50, 700);

    // Draw QR code image
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 720, 160, 420, 420);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 18px JetBrains Mono, monospace';
      ctx.fillText('SCAN FOR A TO Z PROVENANCE', 770, 620);
      ctx.fillStyle = '#64748B';
      ctx.font = '14px JetBrains Mono, monospace';
      ctx.fillText(`HASH: ${selectedBatch.qrToken.slice(0, 16)}...`, 780, 650);

      const link = document.createElement('a');
      link.download = `HoneyChain_Bottle_Sticker_${selectedBatch.batchCode}_${bottleSize}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = qrDataUrl;
  };

  // Download Sticker as Print-Ready PDF
  const handleDownloadStickerPDF = () => {
    if (!selectedBatch || !qrDataUrl) return;
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [120, 80], // 120mm x 80mm standard bottle wrap sticker
      });

      // Background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 120, 80, 'F');

      // Outer border
      doc.setDrawColor(180, 83, 9);
      doc.setLineWidth(0.8);
      doc.rect(2, 2, 116, 76);

      // Top Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(2, 2, 116, 11, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('KVIC HONEY MISSION · GOVT OF INDIA', 5, 8.5);

      doc.setTextColor(245, 158, 11);
      doc.setFontSize(6.5);
      doc.text('100% PURE RAW HONEY', 80, 8.5);

      // Main title
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(selectedBatch.honeyType, 5, 19);

      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 83, 9);
      doc.text('SINGLE-ORIGIN · COLD EXTRACTED · UNHEATED & UNFILTERED', 5, 23.5);

      // Details
      doc.setFontSize(6.5);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(`Batch No: ${selectedBatch.batchCode}`, 5, 30);
      doc.text(`Origin: ${selectedBatch.district}, ${selectedBatch.state}`, 5, 35);
      doc.text(`Apiary Hive: ${selectedBatch.hiveCode}`, 5, 40);
      doc.text(`Master Farmer: ${selectedBatch.beekeeperName}`, 5, 45);
      doc.text(`Harvested: ${selectedBatch.harvestDate}`, 5, 50);
      doc.text(`Moisture: ${selectedBatch.moisturePct}% (FSSAI Safe)`, 5, 55);
      doc.text(`Net Quantity: ${bottleSize}`, 5, 60);

      // Blockchain Badge
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(134, 239, 172);
      doc.rect(5, 64, 65, 8, 'FD');
      doc.setTextColor(21, 128, 61);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.text('✔ POLYGON BLOCKCHAIN VERIFIED PROVENANCE', 7, 69.5);

      // Add QR code image
      doc.addImage(qrDataUrl, 'PNG', 76, 17, 38, 38);

      doc.setTextColor(15, 23, 42);
      doc.setFont('courier', 'bold');
      doc.setFontSize(5);
      doc.text('SCAN WITH PHONE CAMERA', 76, 58);
      doc.setFontSize(4.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`TOKEN: ${selectedBatch.qrToken.slice(0, 18)}`, 76, 62);
      doc.text('Displays A to Z Details & Downloads PDF', 76, 66);

      doc.save(`HoneyChain_Bottle_Sticker_${selectedBatch.batchCode}.pdf`);
    } catch (err) {
      console.error('Failed to generate sticker PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!selectedBatch) {
    return <div className="p-8 text-center text-slate-500">No batches available.</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* Top Title & Explanation Banner */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏷️</span>
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Bottle Sticker & Consumer QR Studio
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
              RETAIL PACKAGING
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1 max-w-3xl">
            Generate printable, high-resolution tamper-evident QR stickers to stick directly on honey bottles and jars.
            When consumers scan this sticker with their smartphone, they directly receive the <strong>official Honey Batch &amp; Farmer PDF</strong> with complete batch, hive, and farmer details plus instant download.
          </p>
        </div>

        {/* Direct Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          <button
            type="button"
            id="btn-download-farmer-batch-pdf"
            onClick={() => exportFullAtoZBatchDossierPDF(selectedBatch, relatedHive, relatedFarmer)}
            className="flex items-center gap-1.5 bg-[#B45309] hover:bg-[#D97706] text-white font-bold px-3.5 py-2 rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
            title="Download the official Honey Batch & Farmer PDF"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Download Farmer &amp; Batch PDF</span>
          </button>

          <button
            type="button"
            id="btn-preview-consumer-page"
            onClick={handleOpenConsumerPage}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-[#0F172A] font-bold px-3.5 py-2 rounded-lg text-xs border border-[#CBD5E1] transition-colors shadow-xs cursor-pointer"
            title="Preview the exact PDF document viewer and download page"
          >
            <Eye className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
            <span>Preview PDF Page</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewTab}
            className="flex items-center gap-1.5 bg-[#0F172A] hover:bg-slate-800 text-white font-semibold px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer"
            title="Open in a new standalone browser tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Open in Tab</span>
          </button>
        </div>
      </div>

      {/* Control Strip: Batch & Size Selector */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        {/* Batch Selector */}
        <div>
          <label className="font-semibold text-[#334155] block mb-1">
            Selected Honey Batch:
          </label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.batchCode} ({b.honeyType.slice(0, 24)}...)
              </option>
            ))}
          </select>
        </div>

        {/* Jar / Bottle Size */}
        <div>
          <label className="font-semibold text-[#334155] block mb-1">
            Bottle / Jar Capacity:
          </label>
          <div className="grid grid-cols-3 gap-1">
            {(['250g', '500g', '1000g'] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setBottleSize(sz)}
                className={`py-1.5 px-2 rounded-md font-semibold text-center transition-colors cursor-pointer ${
                  bottleSize === sz
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-[#F1F5F9] text-[#334155] hover:bg-slate-200'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Sticker Format Style */}
        <div>
          <label className="font-semibold text-[#334155] block mb-1">
            Sticker Dimension Style:
          </label>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => setStickerStyle('front-square')}
              className={`py-1.5 px-1 rounded-md font-medium text-center truncate cursor-pointer ${
                stickerStyle === 'front-square'
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-[#F1F5F9] text-[#334155] hover:bg-slate-200'
              }`}
            >
              Square Jar
            </button>
            <button
              type="button"
              onClick={() => setStickerStyle('wrap')}
              className={`py-1.5 px-1 rounded-md font-medium text-center truncate cursor-pointer ${
                stickerStyle === 'wrap'
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-[#F1F5F9] text-[#334155] hover:bg-slate-200'
              }`}
            >
              Wrap Label
            </button>
            <button
              type="button"
              onClick={() => setStickerStyle('hex-minimal')}
              className={`py-1.5 px-1 rounded-md font-medium text-center truncate cursor-pointer ${
                stickerStyle === 'hex-minimal'
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-[#F1F5F9] text-[#334155] hover:bg-slate-200'
              }`}
            >
              Hexagonal
            </button>
          </div>
        </div>

        {/* Print Layout */}
        <div>
          <label className="font-semibold text-[#334155] block mb-1">
            Sticker Sheet Density:
          </label>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => setSheetLayout('single')}
              className={`py-1.5 px-1 rounded-md font-medium text-center truncate cursor-pointer ${
                sheetLayout === 'single'
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-[#F1F5F9] text-[#334155] hover:bg-slate-200'
              }`}
            >
              1 Sticker
            </button>
            <button
              type="button"
              onClick={() => setSheetLayout('sheet-4')}
              className={`py-1.5 px-1 rounded-md font-medium text-center truncate cursor-pointer ${
                sheetLayout === 'sheet-4'
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-[#F1F5F9] text-[#334155] hover:bg-slate-200'
              }`}
            >
              4-Up (A4)
            </button>
            <button
              type="button"
              onClick={() => setSheetLayout('sheet-8')}
              className={`py-1.5 px-1 rounded-md font-medium text-center truncate cursor-pointer ${
                sheetLayout === 'sheet-8'
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-[#F1F5F9] text-[#334155] hover:bg-slate-200'
              }`}
            >
              8-Up (A4)
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Studio Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Printable Sticker Ready to Stick on Bottle */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#0F172A]">
                  Physical Bottle Sticker (Exact Print Layout)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {stickerStyle === 'wrap' ? '120 × 60 mm' : '90 × 70 mm'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => exportFullAtoZBatchDossierPDF(selectedBatch, relatedHive, relatedFarmer)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-[#B45309] text-xs font-semibold border border-amber-300 transition-colors cursor-pointer"
                  title="Download the official Honey Batch & Farmer PDF"
                >
                  <Download className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>Farmer &amp; Batch PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPNG}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#F1F5F9] hover:bg-slate-200 text-[#0F172A] text-xs font-semibold border border-[#CBD5E1] transition-colors cursor-pointer"
                  title="Download label as high-res PNG image"
                >
                  <Download className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sticker PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadStickerPDF}
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#F1F5F9] hover:bg-slate-200 text-[#0F172A] text-xs font-semibold border border-[#CBD5E1] transition-colors cursor-pointer"
                  title="Download label as PDF ready for sticker printer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#15803D]" />
                  <span>Sticker PDF</span>
                </button>
              </div>
            </div>

            {/* THE ACTUAL BOTTLE STICKER (Cut-lines & Print preview) */}
            <div
              ref={printableRef}
              id="bottle-sticker-element"
              className="relative p-1 bg-slate-100/60 rounded-xl border-2 border-dashed border-slate-300"
            >
              {/* Corner Cut / Alignment marks */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-slate-400"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-slate-400"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-slate-400"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-slate-400"></div>

              {/* STICKER BODY */}
              <div className="bg-white rounded-lg border-2 border-[#D97706] shadow-sm overflow-hidden text-[#0F172A]">
                {/* Top header strip */}
                <div className="bg-[#0F172A] text-white px-4 py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 font-bold">🐝</span>
                    <span className="font-bold tracking-tight text-[11px]">
                      KVIC HONEY MISSION · GOVT OF INDIA
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    HONEYCHAIN VERIFIED
                  </span>
                </div>

                {/* Sticker content grid */}
                <div className="p-4 grid grid-cols-12 gap-3 items-center">
                  {/* Left info (7 cols) */}
                  <div className="col-span-7 space-y-2">
                    <div>
                      <h3 className="font-extrabold text-base text-[#0F172A] leading-tight">
                        {selectedBatch.honeyType}
                      </h3>
                      <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider block mt-0.5">
                        100% Pure Raw Honey · Single-Origin
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-[#334155]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span className="truncate">
                          Origin: <strong>{selectedBatch.district}, {selectedBatch.state}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>Harvest: <strong>{selectedBatch.harvestDate}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>Moisture: <strong>{selectedBatch.moisturePct}%</strong> (FSSAI Safe &lt; 20%)</span>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200 text-[10px] text-[#64748B] flex flex-wrap items-center justify-between gap-1">
                      <span>Batch: <strong className="font-mono text-[#0F172A]">{selectedBatch.batchCode}</strong></span>
                      <span>Net Wt: <strong className="text-[#0F172A]">{bottleSize} Glass</strong></span>
                    </div>

                    <div className="bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] rounded px-2 py-1 text-[10px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Polygon Consensus Seal #19,842,109</span>
                    </div>
                  </div>

                  {/* Right QR Box (5 cols) */}
                  <div className="col-span-5 flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="relative p-1 bg-white rounded border border-slate-300 shadow-2xs">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt={`QR Code for batch ${selectedBatch.batchCode}`}
                          className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                        />
                      ) : (
                        <div className="w-28 h-28 flex items-center justify-center bg-slate-100 text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin" />
                        </div>
                      )}
                      {/* Logo pip */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-6 h-6 rounded-full bg-amber-500 border border-white text-[10px] flex items-center justify-center font-bold">
                          🍯
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-[#0F172A] mt-1.5 uppercase">
                      Scan With Phone
                    </span>
                    <span className="text-[9px] text-[#64748B] leading-tight">
                      A to Z Batch, Hive & Farmer Dossier + PDF
                    </span>
                  </div>
                </div>

                {/* Bottom barcode & FSSAI line */}
                <div className="bg-slate-50 border-t border-slate-200 px-4 py-1.5 flex items-center justify-between text-[9px] text-[#64748B] font-mono">
                  <span>FSSAI LIC: 10022013000492</span>
                  <span>HMAC: {selectedBatch.qrToken.slice(0, 16)}</span>
                  <span>BEST BEFORE: 18 MONTHS</span>
                </div>
              </div>
            </div>

            {/* Target URL breakdown */}
            <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#334155]">Scannable Destination URL:</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 text-[#B45309] hover:underline font-semibold cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] text-[#0F172A] bg-white p-2 rounded border border-[#CBD5E1] break-all select-all">
                {consumerUrl}
              </div>
              <p className="text-[11px] text-[#64748B]">
                This link opens the dedicated, distraction-free consumer side page with zero management buttons or admin tabs.
              </p>
            </div>

            {/* Print & Test Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center justify-center gap-1.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Print Sticker Directly</span>
              </button>

              <button
                type="button"
                onClick={handleOpenConsumerPage}
                className="flex items-center justify-center gap-1.5 bg-[#B45309] hover:bg-[#D97706] text-white font-bold px-4 py-2.5 rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Simulate Consumer Scan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Realistic Bottle Mockup Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#0F172A]">
                  Bottle Affixed Mockup Preview
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[#64748B]">
                {bottleSize} Glass Honey Jar
              </span>
            </div>

            {/* REALISTIC 3D-STYLED HONEY BOTTLE WITH STICKER */}
            <div className="bg-gradient-to-b from-slate-100 via-amber-50/40 to-slate-100 rounded-xl p-6 flex flex-col items-center justify-center border border-slate-200 relative min-h-[380px]">
              {/* Bottle Cap (Metallic Gold) */}
              <div className="w-24 h-6 rounded-t-md bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-700 border border-amber-700 shadow-xs flex items-center justify-center">
                <div className="w-full h-1 bg-white/30"></div>
              </div>

              {/* Bottle Neck */}
              <div className="w-18 h-4 bg-gradient-to-r from-amber-200/90 via-amber-300 to-amber-200/90 border-x border-amber-400"></div>

              {/* Bottle Body (Amber Liquid Glass Jar) */}
              <div className="w-56 sm:w-64 min-h-[260px] rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 border-2 border-amber-600/80 shadow-lg relative p-3 flex flex-col justify-center items-center overflow-hidden">
                {/* Glass reflection highlight */}
                <div className="absolute top-0 left-3 w-3 h-full bg-white/20 rounded-full blur-[1px]"></div>
                <div className="absolute top-0 right-4 w-1.5 h-full bg-white/10 rounded-full"></div>

                {/* Honey Level Indicator */}
                <div className="absolute bottom-1 text-[9px] font-mono text-amber-950/60 font-bold">
                  {bottleSize} 100% PURE RAW HONEY
                </div>

                {/* THE STICKER AFFIXED ON THE BOTTLE */}
                <div className="w-full bg-white/95 backdrop-blur-xs rounded-md border border-amber-800/40 p-2.5 shadow-md text-slate-900 transform transition-transform hover:scale-102">
                  <div className="border-b border-amber-200 pb-1 mb-1 flex items-center justify-between">
                    <span className="text-[8px] font-extrabold uppercase text-amber-900">
                      KVIC HONEY MISSION
                    </span>
                    <span className="text-[7px] font-bold bg-emerald-100 text-emerald-800 px-1 rounded">
                      VERIFIED
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 space-y-0.5">
                      <div className="text-[10px] font-black leading-tight truncate">
                        {selectedBatch.honeyType}
                      </div>
                      <div className="text-[8px] text-slate-600">
                        {selectedBatch.district}, {selectedBatch.state}
                      </div>
                      <div className="text-[8px] font-mono font-bold text-slate-900">
                        {selectedBatch.batchCode}
                      </div>
                      <div className="text-[7px] text-emerald-700 font-bold">
                        Moisture: {selectedBatch.moisturePct}% (Safe)
                      </div>
                    </div>

                    {/* QR Code thumbnail */}
                    {qrDataUrl && (
                      <div className="w-14 h-14 p-0.5 bg-white rounded border border-slate-300 flex-shrink-0 flex items-center justify-center">
                        <img
                          src={qrDataUrl}
                          alt="Jar QR"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-1 pt-1 border-t border-slate-200 flex items-center justify-between text-[7px] text-slate-500 font-mono">
                    <span>{bottleSize} Glass Jar</span>
                    <span>Point phone camera to verify</span>
                  </div>
                </div>
              </div>

              {/* Shadow underneath bottle */}
              <div className="w-48 h-3 bg-slate-400/30 rounded-full blur-xs mt-2"></div>
            </div>

            {/* Instruction Callout */}
            <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1 text-xs">
              <span className="font-bold text-[#0F172A] block">
                How It Works for the Honey Buyer:
              </span>
              <ol className="list-decimal list-inside text-[#334155] space-y-0.5 text-[11px]">
                <li>Consumer points standard camera app at the jar's QR code.</li>
                <li>Instantly opens the <strong>Dedicated Consumer Side Page</strong>.</li>
                <li>Displays honey purity, moisture %, source hive, and farmer profile.</li>
                <li>Includes an official 1-click <strong>Download A to Z PDF</strong> button!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
