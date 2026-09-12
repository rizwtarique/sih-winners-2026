import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { HoneyBatch, FarmerProfile } from '../types';
import {
  Camera,
  Upload,
  X,
  QrCode,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Search,
  RefreshCw,
  Smartphone,
  ExternalLink,
  Award,
  User,
  ArrowRight,
} from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  batches: HoneyBatch[];
  onSelectBatch: (batch: HoneyBatch) => void;
  farmers?: FarmerProfile[];
  onSelectFarmer?: (farmerId: string) => void;
}

export function QRScannerModal({
  isOpen,
  onClose,
  batches,
  onSelectBatch,
  farmers = [],
  onSelectFarmer,
}: QRScannerModalProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'samples'>('samples');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{
    code: string;
    batch?: HoneyBatch;
    farmer?: FarmerProfile;
    isValid: boolean;
  } | null>(null);
  const [manualCode, setManualCode] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsScanning(false);
  };

  // Start camera scanning
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
        scanFrame();
      }
    } catch (err: any) {
      console.warn('Camera stream request failed:', err);
      setCameraError(
        err?.message ||
          'Camera access was denied or is unavailable. Please use file upload or the sample quick-scan buttons below.'
      );
      setIsScanning(false);
    }
  };

  // Continuous video frame scanning loop with jsQR
  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        handleRawDecodedData(code.data);
        stopCamera();
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  // Handle decoded text from QR (URL or raw batch/farmer code)
  const handleRawDecodedData = (rawText: string) => {
    let extractedCode = rawText.trim();
    let isFarmerQuery = false;

    // Check if it's a URL with ?farmer=, ?batch=, or /verify/
    try {
      if (rawText.includes('?') || rawText.startsWith('http')) {
        const url = new URL(rawText, window.location.href);
        const farmerParam = url.searchParams.get('farmer');
        const batchParam = url.searchParams.get('batch') || url.searchParams.get('verify');
        if (farmerParam) {
          extractedCode = farmerParam;
          isFarmerQuery = true;
        } else if (batchParam) {
          extractedCode = batchParam;
        } else {
          // Check pathname for /verify/BATCH
          const parts = url.pathname.split('/');
          const lastPart = parts[parts.length - 1];
          if (lastPart && lastPart !== 'verify') {
            extractedCode = lastPart;
          }
        }
      }
    } catch (e) {
      // not a valid URL, use raw string
    }

    // Check if code matches a farmer
    const matchedFarmer = farmers.find(
      (f) =>
        f.id.toLowerCase() === extractedCode.toLowerCase() ||
        f.kvicRegistrationNumber.toLowerCase() === extractedCode.toLowerCase() ||
        f.name.toLowerCase() === extractedCode.toLowerCase() ||
        f.qrUrl.toLowerCase().includes(extractedCode.toLowerCase())
    );

    if (matchedFarmer || isFarmerQuery) {
      setScanResult({
        code: extractedCode,
        farmer: matchedFarmer,
        isValid: !!matchedFarmer,
      });
      return;
    }

    // Match against known batches
    const matchedBatch = batches.find(
      (b) =>
        b.batchCode.toLowerCase() === extractedCode.toLowerCase() ||
        b.id.toLowerCase() === extractedCode.toLowerCase() ||
        b.qrToken.toLowerCase() === extractedCode.toLowerCase()
    );

    setScanResult({
      code: extractedCode,
      batch: matchedBatch,
      isValid: !!matchedBatch,
    });
  };

  // Handle image file upload for QR scanning
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          handleRawDecodedData(code.data);
        } else {
          setScanResult({
            code: 'No valid QR code found in uploaded image',
            isValid: false,
          });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleRawDecodedData(manualCode.trim());
  };

  const handleConfirmBatch = (batch: HoneyBatch) => {
    onSelectBatch(batch);
    onClose();
  };

  const handleConfirmFarmer = (farmer: FarmerProfile) => {
    if (onSelectFarmer) {
      onSelectFarmer(farmer.id);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="qr-scanner-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="qr-scanner-modal"
        className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Scan Honey Jar QR Code
              </h3>
              <p className="text-xs text-slate-400">
                Instantly verify blockchain cryptographic seal & lab certificates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-2">
          <button
            onClick={() => {
              setActiveTab('samples');
              setScanResult(null);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === 'samples'
                ? 'bg-white text-amber-700 border-amber-600 shadow-2xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            ⚡ 1-Click Demo Scans
          </button>
          <button
            onClick={() => {
              setActiveTab('camera');
              setScanResult(null);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-white text-amber-700 border-amber-600 shadow-2xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            📷 Device Camera
          </button>
          <button
            onClick={() => {
              setActiveTab('upload');
              setScanResult(null);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-amber-700 border-amber-600 shadow-2xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            📁 Upload Image
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Active Tab Content */}
          {activeTab === 'samples' && (
            <div className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Instant Hackathon / Demo Mode</span>
                </div>
                <p className="text-slate-700">
                  Select any registered retail jar batch below to simulate an instant consumer QR scan with full blockchain verification.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    1. Retail Honey Jar QR Codes (Consumer Scan)
                  </span>
                  <div className="space-y-2">
                    {batches.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => handleRawDecodedData(b.batchCode)}
                        className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/50 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
                            JAR
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-extrabold text-slate-900">
                                {b.batchCode}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  b.blockchainRecord?.status === 'CONFIRMED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {b.blockchainRecord?.status === 'CONFIRMED' ? 'ANCHORED' : 'PENDING'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {b.honeyType} · {b.district}, {b.state}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-700 transition-all cursor-pointer"
                        >
                          Scan Jar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {farmers && farmers.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      2. Farmer Apiary & Bee Box QR Codes (Field Scan)
                    </span>
                    <div className="space-y-2">
                      {farmers.map((f) => (
                        <div
                          key={f.id}
                          onClick={() => handleRawDecodedData(f.id)}
                          className="p-3 rounded-xl border border-amber-200 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-100/60 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={f.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100'}
                              alt={f.name}
                              className="w-8 h-8 rounded-lg object-cover ring-1 ring-amber-400"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-slate-900">
                                  {f.name}
                                </span>
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                  KYC VERIFIED
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">
                                Reg #{f.kvicRegistrationNumber} · {f.village}, {f.district}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 group-hover:bg-amber-500 group-hover:text-slate-950 text-white transition-all cursor-pointer"
                          >
                            Scan Box QR
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="space-y-4 text-center">
              {cameraError ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2 text-left">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Camera Permission or Device Notice</span>
                  </div>
                  <p>{cameraError}</p>
                  <p className="text-slate-600">
                    Tip: You can use the <strong>1-Click Demo Scans</strong> tab or <strong>Upload Image</strong> tab to test the exact same flow!
                  </p>
                </div>
              ) : (
                <div className="relative mx-auto max-w-sm aspect-square bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* High-tech Viewfinder Overlay with Scanning Laser */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-8">
                    <div className="w-48 h-48 border-2 border-amber-400/80 rounded-xl relative">
                      {/* Corner marks */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-amber-400" />

                      {/* Animated Laser Bar */}
                      <div className="w-full h-0.5 bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-bounce mt-24" />
                    </div>
                    <span className="text-[11px] font-semibold text-white/90 bg-slate-900/80 px-3 py-1 rounded-full mt-4 backdrop-blur-xs">
                      Align QR code within target frame
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              <label
                htmlFor="qr-file-upload-input"
                className="border-2 border-dashed border-slate-300 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/40 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Upload or drag a QR code image
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Supports PNG, JPG, or screenshot with QR code
                  </span>
                </div>
                <input
                  id="qr-file-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Manual Entry Fallback */}
          <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Or type batch code (e.g. HONEY-2026-001)..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Find
              </button>
            </div>
          </form>

          {/* Scan Result Feedback Card */}
          {scanResult && (
            <div
              className={`p-4 rounded-xl border text-xs animate-in fade-in slide-in-from-bottom-2 ${
                scanResult.isValid
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {scanResult.isValid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-extrabold text-sm">
                      {scanResult.farmer
                        ? `Farmer QR Verified: ${scanResult.farmer.name}`
                        : scanResult.batch
                        ? `Honey Jar QR Verified: ${scanResult.batch.batchCode}`
                        : 'Invalid or Unrecognized QR Code'}
                    </div>
                    <p className="mt-0.5 text-slate-600">
                      {scanResult.farmer
                        ? `Reg #${scanResult.farmer.kvicRegistrationNumber} · ${scanResult.farmer.village}, ${scanResult.farmer.district} · KVIC Honey Mission`
                        : scanResult.batch
                        ? `${scanResult.batch.honeyType} · ${scanResult.batch.district}, ${scanResult.batch.state}`
                        : `Decoded payload: "${scanResult.code}" does not match any registered batch or farmer.`}
                    </p>
                  </div>
                </div>

                {scanResult.farmer && (
                  <button
                    type="button"
                    onClick={() => handleConfirmFarmer(scanResult.farmer!)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shrink-0 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>View Farmer Passport</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {scanResult.batch && !scanResult.farmer && (
                  <button
                    type="button"
                    onClick={() => handleConfirmBatch(scanResult.batch!)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shrink-0 shadow-sm transition-all cursor-pointer"
                  >
                    View Verified Record
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
