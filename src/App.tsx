import React, { useState, useEffect } from 'react';
import { Hive, HoneyBatch, AlertItem, QualityCertificate, UserRole, AppView, FarmerProfile, BatchStatus } from './types';
import { INITIAL_HIVES, INITIAL_BATCHES, INITIAL_ALERTS, MOCK_FARMERS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { BeekeeperView } from './components/BeekeeperView';
import { ApiaryMapView } from './components/ApiaryMapView';
import { ConsumerVerificationView } from './components/ConsumerVerificationView';
import { FarmerPassportView } from './components/FarmerPassportView';
import { LabCertifierView } from './components/LabCertifierView';
import { AdminKvicView } from './components/AdminKvicView';
import { InteractiveTamperDemo } from './components/InteractiveTamperDemo';
import { LearningHubView } from './components/LearningHubView';
import { DemoScenarioModal } from './components/DemoScenarioModal';
import { QRScannerModal } from './components/QRScannerModal';
import { PrintStickerView } from './components/PrintStickerView';
import { computeBatchCommitmentHash } from './utils/crypto';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('beekeeper');
  const [hives, setHives] = useState<Hive[]>(INITIAL_HIVES);
  const [batches, setBatches] = useState<HoneyBatch[]>(INITIAL_BATCHES);
  const [farmers, setFarmers] = useState<FarmerProfile[]>(MOCK_FARMERS);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>(MOCK_FARMERS[0].id);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(INITIAL_BATCHES[0].id);
  const [selectedHiveIdForTelemetry, setSelectedHiveIdForTelemetry] = useState<string>('');
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false);
  const [isStreamActive, setIsStreamActive] = useState(true);
  const [latestBlockNumber, setLatestBlockNumber] = useState(19842109);
  const [isNavbarScannerOpen, setIsNavbarScannerOpen] = useState(false);

  // Check URL query parameters for QR scan redirects (e.g. ?batch=HONEY-2026-001 or ?farmer=farmer-01)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const batchParam = params.get('batch') || params.get('verify') || params.get('code');
      const farmerParam = params.get('farmer') || params.get('farmerId');
      const viewParam = params.get('view') as AppView | null;

      if (viewParam === 'print-sticker') {
        if (batchParam) {
          const found = batches.find(
            (b) =>
              b.batchCode.toLowerCase() === batchParam.toLowerCase() ||
              b.id.toLowerCase() === batchParam.toLowerCase() ||
              b.qrToken.toLowerCase() === batchParam.toLowerCase()
          );
          if (found) {
            setSelectedBatchId(found.id);
          }
        }
        setCurrentView('print-sticker');
      } else if (farmerParam) {
        const foundFarmer = farmers.find(
          (f) =>
            f.id.toLowerCase() === farmerParam.toLowerCase() ||
            f.kvicRegistrationNumber.toLowerCase() === farmerParam.toLowerCase() ||
            f.name.toLowerCase().includes(farmerParam.toLowerCase())
        );
        if (foundFarmer) {
          setSelectedFarmerId(foundFarmer.id);
          setCurrentView('farmer-passport');
        }
      } else if (batchParam) {
        const found = batches.find(
          (b) =>
            b.batchCode.toLowerCase() === batchParam.toLowerCase() ||
            b.id.toLowerCase() === batchParam.toLowerCase() ||
            b.qrToken.toLowerCase() === batchParam.toLowerCase()
        );
        if (found) {
          setSelectedBatchId(found.id);
          setCurrentView('consumer');
        }
      } else if (viewParam) {
        setCurrentView(viewParam);
      }
    } catch (e) {
      console.warn('Failed to parse URL query params:', e);
    }
  }, [batches, farmers]);

  // Initialize batch commitment hashes with authentic SHA-256 on mount
  useEffect(() => {
    async function initHashes() {
      const updated = await Promise.all(
        batches.map(async (batch) => {
          if (batch.blockchainRecord && !batch.blockchainRecord.commitmentHash) {
            const hash = await computeBatchCommitmentHash(batch, batch.certificate);
            return {
              ...batch,
              blockchainRecord: {
                ...batch.blockchainRecord,
                commitmentHash: hash,
              },
            };
          }
          return batch;
        })
      );
      setBatches(updated);
    }
    initHashes();
  }, []);

  // Periodic IoT telemetry simulation (slight natural oscillation in temp/humidity/weight)
  useEffect(() => {
    if (!isStreamActive) return;

    const interval = setInterval(() => {
      setHives((prevHives) =>
        prevHives.map((hive) => {
          // slight random jitter: +/- 0.1°C, +/- 0.2% humidity
          const tempDelta = (Math.random() - 0.5) * 0.15;
          const humDelta = (Math.random() - 0.5) * 0.3;
          const newTemp = Math.max(30, Math.min(42, hive.currentReading.temperature + tempDelta));
          const newHum = Math.max(40, Math.min(80, hive.currentReading.humidity + humDelta));

          return {
            ...hive,
            lastSync: 'Just now (MQTT QoS 1)',
            currentReading: {
              ...hive.currentReading,
              temperature: Number(newTemp.toFixed(1)),
              humidity: Number(newHum.toFixed(1)),
              seqNo: hive.currentReading.seqNo + 1,
              timestamp: new Date().toISOString(),
            },
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isStreamActive]);

  // Block confirmation ticker (every 18 seconds)
  useEffect(() => {
    const blockInterval = setInterval(() => {
      setLatestBlockNumber((prev) => prev + 1);
    }, 18000);
    return () => clearInterval(blockInterval);
  }, []);

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const isTampered = !!selectedBatch.isTampered;

  // Beekeeper logs a new harvest
  const handleLogHarvest = async (newBatchData: Partial<HoneyBatch>) => {
    const seq = Math.floor(100 + batches.length + 1);
    const batchCode = `HC-2026-01${seq}`;
    const newId = `batch-${Date.now()}`;

    const newBatch: HoneyBatch = {
      id: newId,
      batchCode,
      hiveId: newBatchData.hiveId || hives[0].id,
      hiveCode: newBatchData.hiveCode || hives[0].hiveCode,
      apiaryLocation: newBatchData.apiaryLocation || hives[0].apiaryName,
      beekeeperName: 'Rameshwar Lal Gurjar',
      beekeeperPhone: '+91 98290 XXXXX',
      district: newBatchData.district || 'Bhilwara',
      state: newBatchData.state || 'Rajasthan',
      honeyType: newBatchData.honeyType || 'Wild Mustard',
      grossWeightKg: newBatchData.grossWeightKg || 24.5,
      netWeightKg: newBatchData.netWeightKg || 22.0,
      framesHarvested: newBatchData.framesHarvested || 8,
      harvestDate: newBatchData.harvestDate || new Date().toISOString().split('T')[0],
      packagingDate: 'Pending Processing',
      status: 'HARVESTED',
      moisturePct: newBatchData.moisturePct || 18.2,
      processingNotes: newBatchData.processingNotes || '',
      qrToken: `hc_tok_${Date.now().toString(36)}`,
      qrUrl: `https://honeychain.org/verify/${batchCode}`,
      events: newBatchData.events || [],
      originalValues: {
        netWeightKg: newBatchData.netWeightKg || 22.0,
        harvestDate: newBatchData.harvestDate || new Date().toISOString().split('T')[0],
        honeyType: newBatchData.honeyType || 'Wild Mustard',
      },
    };

    setBatches([newBatch, ...batches]);
    setSelectedBatchId(newId);

    // Add alert
    setAlerts([
      {
        id: `alt-${Date.now()}`,
        type: 'harvest_due',
        severity: 'info',
        title: `New Harvest Logged (${batchCode})`,
        message: `Harvest of ${newBatch.netWeightKg} kg recorded from ${newBatch.hiveCode}. Pending lab sample testing.`,
        batchCode,
        timestamp: 'Just now',
        isRead: false,
        recommendedAction: 'Dispatch sample bottles to NABL accredited testing laboratory.',
      },
      ...alerts,
    ]);
  };

  // Lab certifier issues certificate
  const handleIssueCertificate = async (batchId: string, cert: QualityCertificate) => {
    const target = batches.find((b) => b.id === batchId);
    if (!target) return;

    const isPassed = cert.parameters.overallResult === 'PASS' && cert.parameters.c4SugarAdulteration !== 'Positive';
    const batchStatus: BatchStatus = isPassed ? 'CERTIFIED' : 'FAILED';
    const hash = await computeBatchCommitmentHash(target, cert);
    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const blockNum = latestBlockNumber + 1;
    setLatestBlockNumber(blockNum);

    const updatedBatches = batches.map((b) => {
      if (b.id === batchId) {
        return {
          ...b,
          status: batchStatus,
          certificate: cert,
          blockchainRecord: {
            contractAddress: '0x71C2d67F0598822384a51A7d9D04BFe44A895F31',
            network: 'Polygon Amoy Proof-of-Stake (EVM)',
            chainId: 80002,
            batchCodeHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            commitmentHash: hash,
            merkleRoot: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            leafIndex: 2,
            txHash,
            blockNumber: blockNum,
            anchoredAt: new Date().toISOString(),
            status: 'CONFIRMED' as const,
            verificationStatus: isPassed ? ('VERIFIED' as const) : ('TAMPER_DETECTED' as const),
          },
          events: [
            ...b.events,
            {
              id: `ev-cert-${Date.now()}`,
              eventType: 'LAB_CERTIFICATION',
              title: isPassed
                ? 'NABL Laboratory Certified & Anchored on Ledger'
                : 'NABL Laboratory Quality Test Rejected / Non-Compliant',
              occurredAt: new Date().toLocaleString(),
              actorName: cert.analystName,
              actorRole: cert.labName,
              location: 'State Analytical Testing Lab',
              details: isPassed
                ? `Moisture ${cert.parameters.moisturePct}%, HMF ${cert.parameters.hmfMgKg}mg/kg, C4 Adulteration: ${cert.parameters.c4SugarAdulteration}. Anchored to Polygon Block #${blockNum}.`
                : `FAILED FSSAI Standards: Moisture ${cert.parameters.moisturePct}%, HMF ${cert.parameters.hmfMgKg}mg/kg, C4 Adulteration: ${cert.parameters.c4SugarAdulteration}. Anchored to Polygon Block #${blockNum}.`,
              eventHash: hash,
              iconName: isPassed ? 'ShieldCheck' : 'AlertCircle',
            },
          ],
        };
      }
      return b;
    });

    setBatches(updatedBatches);
  };

  // Beekeeper or Admin triggers blockchain anchoring
  const handleAnchorBatch = async (batchId: string) => {
    const target = batches.find((b) => b.id === batchId);
    if (!target) return;

    const hash = await computeBatchCommitmentHash(target, target.certificate);
    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const blockNum = latestBlockNumber + 1;
    setLatestBlockNumber(blockNum);

    const updated = batches.map((b) => {
      if (b.id === batchId) {
        return {
          ...b,
          blockchainRecord: {
            contractAddress: '0x71C2d67F0598822384a51A7d9D04BFe44A895F31',
            network: 'Polygon Amoy Proof-of-Stake',
            chainId: 80002,
            batchCodeHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            commitmentHash: hash,
            merkleRoot: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            leafIndex: 0,
            txHash,
            blockNumber: blockNum,
            anchoredAt: new Date().toISOString(),
            status: 'CONFIRMED' as const,
            verificationStatus: 'VERIFIED' as const,
          },
          events: [
            ...b.events,
            {
              id: `ev-anch-${Date.now()}`,
              eventType: 'BLOCKCHAIN_ANCHOR',
              title: 'Batch Hash Anchored on Public Ledger',
              occurredAt: new Date().toLocaleString(),
              actorName: 'Honey Chain Relayer',
              actorRole: 'Automated Smart Contract Engine',
              location: 'Polygon Amoy',
              details: `Sealed commitment hash ${hash.slice(0, 16)}... at block #${blockNum}.`,
              eventHash: hash,
              iconName: 'Link',
            },
          ],
        };
      }
      return b;
    });

    setBatches(updated);
  };

  // Tamper toggle
  const handleTamperToggle = (batchId: string, shouldTamper: boolean) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === batchId) {
          if (shouldTamper) {
            return {
              ...b,
              isTampered: true,
              netWeightKg: 42.0, // Modified from 24.5kg
              harvestDate: '2026-08-01', // Modified
              honeyType: 'Adulterated Syrup Blend (Tampered in DB)',
              originalValues: b.originalValues || {
                netWeightKg: b.netWeightKg,
                harvestDate: b.harvestDate,
                honeyType: b.honeyType,
              },
            };
          } else {
            return {
              ...b,
              isTampered: false,
              netWeightKg: b.originalValues?.netWeightKg || 24.5,
              harvestDate: b.originalValues?.harvestDate || '2026-09-08',
              honeyType: b.originalValues?.honeyType || 'Wild Mustard & Desert Flora',
            };
          }
        }
        return b;
      })
    );
  };

  // Direct tamper edits from the Tamper Playground
  const handleUpdateBatchData = (
    batchId: string,
    updates: Partial<HoneyBatch>,
    isTamperedFlag: boolean
  ) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === batchId) {
          return {
            ...b,
            ...updates,
            isTampered: isTamperedFlag,
          };
        }
        return b;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Application Navbar */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
        onOpenQRScanner={() => setIsNavbarScannerOpen(true)}
        unreadAlertCount={alerts.filter((a) => !a.isRead).length}
        latestBlockNumber={latestBlockNumber}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === 'beekeeper' && (
          <BeekeeperView
            hives={hives}
            batches={batches}
            onLogHarvest={handleLogHarvest}
            onSelectBatchForQR={(b) => {
              setSelectedBatchId(b.id);
              setCurrentView('consumer');
            }}
            onAnchorBatch={handleAnchorBatch}
            onToggleSimulatedStream={() => setIsStreamActive(!isStreamActive)}
            isStreamActive={isStreamActive}
            initialSelectedHiveId={selectedHiveIdForTelemetry}
            onNavigateToApiaryMap={() => setCurrentView('apiary-map')}
          />
        )}

        {currentView === 'apiary-map' && (
          <ApiaryMapView
            hives={hives}
            alerts={alerts}
            onSelectHiveForTelemetry={(hiveId) => {
              setSelectedHiveIdForTelemetry(hiveId);
              setCurrentView('beekeeper');
            }}
            onLogHarvestForHive={(hive) => {
              setSelectedHiveIdForTelemetry(hive.id);
              setCurrentView('beekeeper');
            }}
            onNavigateToView={setCurrentView}
          />
        )}

        {currentView === 'consumer' && (
          <ConsumerVerificationView
            batches={batches}
            selectedBatch={selectedBatch}
            onSelectBatch={(b) => setSelectedBatchId(b.id)}
            onTamperToggle={handleTamperToggle}
            isTampered={isTampered}
            farmers={farmers}
            onNavigateToFarmer={(farmerId) => {
              setSelectedFarmerId(farmerId);
              setCurrentView('farmer-passport');
            }}
          />
        )}

        {currentView === 'farmer-passport' && (
          <FarmerPassportView
            farmers={farmers}
            selectedFarmerId={selectedFarmerId}
            onSelectFarmerId={setSelectedFarmerId}
            batches={batches}
            hives={hives}
            onNavigateToBatch={(batchId) => {
              setSelectedBatchId(batchId);
              setCurrentView('consumer');
            }}
            onNavigateView={setCurrentView}
          />
        )}

        {currentView === 'lab' && (
          <LabCertifierView
            batches={batches}
            onIssueCertificate={handleIssueCertificate}
          />
        )}

        {currentView === 'admin' && (
          <AdminKvicView
            batches={batches}
            hives={hives}
            alerts={alerts}
            latestBlockNumber={latestBlockNumber}
          />
        )}

        {currentView === 'tamper-demo' && (
          <InteractiveTamperDemo
            batch={selectedBatch}
            onUpdateBatchData={handleUpdateBatchData}
            onNavigateToConsumerVerify={() => setCurrentView('consumer')}
          />
        )}

        {currentView === 'learning-hub' && <LearningHubView />}

        {currentView === 'print-sticker' && (
          <PrintStickerView
            batch={selectedBatch}
            onBack={() => setCurrentView('consumer')}
          />
        )}
      </main>

      {/* SIH 6-Minute Judge Walkthrough Guide Modal */}
      <DemoScenarioModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onNavigateView={setCurrentView}
      />

      {/* Top Navbar QR Code Scanner Modal */}
      <QRScannerModal
        isOpen={isNavbarScannerOpen}
        onClose={() => setIsNavbarScannerOpen(false)}
        batches={batches}
        farmers={farmers}
        onSelectBatch={(batch) => {
          setSelectedBatchId(batch.id);
          setCurrentView('consumer');
          setIsNavbarScannerOpen(false);
        }}
        onSelectFarmer={(farmerId) => {
          setSelectedFarmerId(farmerId);
          setCurrentView('farmer-passport');
          setIsNavbarScannerOpen(false);
        }}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-300">
            Honey Chain · Problem Statement SIH26021 (Ministry of MSME) · KVIC Honey Mission
          </p>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Blockchain-based tamper-resistant provenance & smart beekeeping IoT/AI management platform.
            Blockchain verifies record submission integrity; chemical purity is verified by accredited laboratory testing.
          </p>
        </div>
      </footer>
    </div>
  );
}
