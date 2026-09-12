import React, { useState, useEffect } from 'react';
import {
  PlayCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { UserRole } from '../types';

interface DemoScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView: (view: UserRole | 'tamper-demo' | 'learning-hub') => void;
}

interface DemoStep {
  step: number;
  timeWindow: string;
  title: string;
  targetView: UserRole | 'tamper-demo' | 'learning-hub';
  pitchSpeaker: string;
  keyAction: string;
  whyJudgesCare: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    timeWindow: '00:00 - 01:00',
    title: 'The Real-World Crisis: Counterfeit Honey & KVIC Mission',
    targetView: 'learning-hub',
    pitchSpeaker:
      '"Respected judges, over 70% of commercial honey sampled in India is adulterated with cheap industrial sugar syrups. Honest rural beekeepers in KVIC clusters spend months tending hives, but cannot prove their honey is genuine. Honey Chain introduces an uncrackable digital trust layer from hive to retail jar."',
    keyAction: 'Introduce the problem statement and the 12-component architecture diagram.',
    whyJudgesCare: 'Establishes clear alignment with Ministry of MSME and SIH26021.',
  },
  {
    step: 2,
    timeWindow: '01:00 - 02:00',
    title: 'The Apiary: IoT Sensors & AI Health Monitoring',
    targetView: 'beekeeper',
    pitchSpeaker:
      '"Here is Ramesh in Bhilwara, Rajasthan. His bee boxes are equipped with ESP32 microcontrollers streaming temperature, humidity, and hive weight. If temperature spikes or bees prepare to swarm, our AI flags early warnings. When honey is ripe, he logs a harvest—creating Batch HC-2026-0142."',
    keyAction: 'Show live telemetry stream, AI health card factors, and the Harvest Batch creator.',
    whyJudgesCare: 'Demonstrates deep engineering: edge IoT, offline ring buffers, and practical AI.',
  },
  {
    step: 3,
    timeWindow: '02:00 - 03:00',
    title: 'The Science: Lab Testing & Cryptographic Anchoring',
    targetView: 'lab',
    pitchSpeaker:
      '"We do not rely on blockchain buzzwords for purity. Purity is a chemical fact tested by accredited NABL/FSSAI laboratories. When the lab certifies moisture <= 20% and C4 sugars Negative, our relayer calculates a SHA-256 Merkle root and permanently anchors it to our Polygon smart contract."',
    keyAction: 'View the FSSAI lab parameters and the blockchain transaction receipt at Block #19,842,109.',
    whyJudgesCare: 'Honest technology architecture (Rule 8): Blockchain anchors records; labs verify purity.',
  },
  {
    step: 4,
    timeWindow: '03:00 - 04:00',
    title: 'The Consumer: Zero-Install QR Code Verification',
    targetView: 'consumer',
    pitchSpeaker:
      '"Now imagine Priya buying this jar in a supermarket. She scans the QR code with any standard phone camera. With zero app install, she sees the full journey, the beekeeper region, the lab report, and our verified green badge: Record Integrity Verified."',
    keyAction: 'Inspect the provenance timeline and the printable holographic jar sticker.',
    whyJudgesCare: 'Shows instant consumer adoption and high-contrast accessible design.',
  },
  {
    step: 5,
    timeWindow: '04:00 - 05:00',
    title: 'The Climax: The Live Database Tamper Test',
    targetView: 'tamper-demo',
    pitchSpeaker:
      '"What if a corrupt middle-man edits the database to double the harvest volume from 24.5kg to 42kg? Watch as we change this value right now in the database. The moment the consumer refreshes, the verification badge turns bright RED: Hash Mismatch Detected! That is the blockchain doing its one honest job: making history impossible to rewrite."',
    keyAction: 'Click "Inject Database Tamper" and watch the cryptographic hash change and the badge turn RED.',
    whyJudgesCare: 'The definitive hackathon moment: Proves blockchain is actually doing work, not just sitting in the slide deck.',
  },
  {
    step: 6,
    timeWindow: '05:00 - 06:00',
    title: 'Cluster Oversight: KVIC Administration & Scaling',
    targetView: 'admin',
    pitchSpeaker:
      '"Finally, the KVIC coordinator dashboard monitors 142 beekeepers, 850 hives, and total harvest volume across the state with instant CSV audit reporting. Honey Chain transforms honey provenance from a marketing slogan into an unalterable, checkable fact."',
    keyAction: 'Show aggregate cluster metrics, smart contract ledger audit, and CSV export.',
    whyJudgesCare: 'Answers judge questions on governance, scalability, and national impact.',
  },
];

export function DemoScenarioModal({ isOpen, onClose, onNavigateView }: DemoScenarioModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = DEMO_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      onNavigateView(DEMO_STEPS[nextIndex].targetView);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      onNavigateView(DEMO_STEPS[prevIndex].targetView);
    }
  };

  const handleGoToView = () => {
    onNavigateView(currentStep.targetView);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                SIH 2026 Judge Walkthrough Guide (6 Minutes)
              </h3>
              <span className="text-xs text-slate-400">
                Step {currentStep.step} of 6 · {currentStep.timeWindow}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Stepper Bar */}
        <div className="grid grid-cols-6 gap-1.5">
          {DEMO_STEPS.map((s, idx) => (
            <div
              key={s.step}
              onClick={() => {
                setCurrentStepIndex(idx);
                onNavigateView(s.targetView);
              }}
              className={`h-1.5 rounded-full cursor-pointer transition-all ${
                idx === currentStepIndex
                  ? 'bg-amber-400'
                  : idx < currentStepIndex
                  ? 'bg-emerald-500'
                  : 'bg-slate-800'
              }`}
            ></div>
          ))}
        </div>

        {/* Step Card Content */}
        <div className="space-y-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Step {currentStep.step}: {currentStep.timeWindow}
            </span>
            <h2 className="text-xl font-black text-white mt-0.5">{currentStep.title}</h2>
          </div>

          {/* Pitch Speaker Script */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 space-y-1.5 leading-relaxed">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block font-mono">
              Speaker Script (Read to Judges)
            </span>
            <p className="italic text-slate-100">{currentStep.pitchSpeaker}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">
                Live On-Screen Action
              </span>
              <p className="text-slate-200 mt-0.5">{currentStep.keyAction}</p>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
              <span className="text-emerald-400 font-bold uppercase text-[10px] block">
                Why SIH Judges Reward This
              </span>
              <p className="text-slate-200 mt-0.5">{currentStep.whyJudgesCare}</p>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1 font-bold px-3 py-2 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGoToView}
              className="px-3.5 py-2 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
            >
              Open This Screen
            </button>

            {currentStepIndex < DEMO_STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 font-bold px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 font-bold px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md cursor-pointer"
              >
                <span>Finish Walkthrough</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
