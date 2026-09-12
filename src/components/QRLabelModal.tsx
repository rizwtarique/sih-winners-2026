import React from 'react';
import { HoneyBatch } from '../types';
import { QRCodeCard } from './QRCodeCard';
import {
  X,
  Printer,
  ShieldCheck,
  Calendar,
  MapPin,
  Sparkles,
  ExternalLink,
  Award,
} from 'lucide-react';
import { formatHexShort } from '../utils/crypto';

interface QRLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: HoneyBatch;
  onSimulateScan?: (batch: HoneyBatch) => void;
}

export function QRLabelModal({
  isOpen,
  onClose,
  batch,
  onSimulateScan,
}: QRLabelModalProps) {
  if (!isOpen) return null;

  return (
    <div
      id="qr-label-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="qr-label-modal"
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              🏷️
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Honey Jar QR Packaging Label
              </h3>
              <p className="text-xs text-slate-400">
                Official KVIC Honey Mission Tamper-Evident Retail Sticker
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

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Packaging Label Preview (Physical Sticker Simulation) */}
          <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50/50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            {/* Top decorative band */}
            <div className="flex items-center justify-between border-b border-amber-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🐝</span>
                <div>
                  <span className="text-[10px] font-extrabold tracking-widest text-amber-900 uppercase block">
                    KVIC HONEY MISSION · GOVT OF INDIA
                  </span>
                  <span className="text-xs font-black text-slate-900">
                    HONEYCHAIN VERIFIED PURE RAW HONEY
                  </span>
                </div>
              </div>
              <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>BLOCKCHAIN SEALED</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Product & Origin Meta */}
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Varietal & Grade
                  </span>
                  <h4 className="text-lg font-black text-slate-900">
                    {batch.honeyType}
                  </h4>
                  <p className="text-xs text-slate-600">
                    Raw Unpasteurized & Single-Yard Harvest
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>Origin: <strong>{batch.district}, {batch.state}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Harvest Date: <strong>{batch.harvestDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Moisture: <strong>{batch.certificate?.parameters.moisturePct ?? 17.8}%</strong> (FSSAI max 20%)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200">
                  <div className="text-[10px] font-mono text-slate-500">
                    <span>Batch Code: </span>
                    <strong className="text-slate-900">{batch.batchCode}</strong>
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 truncate">
                    Anchor: {batch.blockchainRecord?.txHash || 'Pending Smart Contract Tx'}
                  </div>
                </div>
              </div>

              {/* High-Resolution Working Scannable QR Code */}
              <div className="flex flex-col items-center">
                <QRCodeCard
                  batch={batch}
                  size={150}
                  showDetails={false}
                  className="border-2 border-amber-200 shadow-md"
                />
                <span className="text-[10px] font-mono font-bold text-slate-600 mt-2">
                  Scan to Inspect Unalterable Harvest & Lab Audit
                </span>
              </div>
            </div>

            {/* Bottom Security Watermark */}
            <div className="mt-4 pt-2.5 border-t border-amber-200 flex items-center justify-between text-[9px] font-mono text-slate-500">
              <span>HMAC: {batch.qrToken}</span>
              <span>Net Weight: 500g Glass</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-500 text-center sm:text-left">
              Point your smartphone camera at the QR code above to test instant verification.
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {onSimulateScan && (
                <button
                  type="button"
                  onClick={() => {
                    onSimulateScan(batch);
                    onClose();
                  }}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Open Consumer Scan Page</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
