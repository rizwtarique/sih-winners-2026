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
import { BottleStickerStudio } from './components/BottleStickerStudio';
import { ConsumerPdfView } from './components/ConsumerPdfView';
import { computeBatchCommitmentHash } from './utils/crypto';
import { api } from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('beekeeper');
  const [isStandaloneConsumer, setIsStandaloneConsumer] = useState<boolean>(false);
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

  // Load persistent datasets from backend on initial mount
  useEffect(() => {
    let isMounted = true;
    async function loadBackendData() {
      try {
        const [remoteBatches, remoteHives, remoteFarmers, remoteAlerts, chainStats] = await Promise.all([
          api.getBatches(),
          api.getHives(),
          api.getFarmers(),
          api.getAlerts(),
          api.getBlockchainStats(),
        ]);
        if (!isMounted) return;
        if (remoteBatches && remoteBatches.length > 0) {
          setBatches(remoteBatches);
          setSelectedBatchId((prevId) => {
            return remoteBatches.some((b) => b.id === prevId) ? prevId : remoteBatches[0].id;
          });
        }
        if (remoteHives && remoteHives.length > 0) setHives(remoteHives);
        if (remoteFarmers && remoteFarmers.length > 0) setFarmers(remoteFarmers);
        if (remoteAlerts && remoteAlerts.length > 0) setAlerts(remoteAlerts);
        if (chainStats && chainStats.latestBlockNumber) setLatestBlockNumber(chainStats.latestBlockNumber);
      } catch (err) {
        console.warn('[Honey Chain] Fallback to local state:', err);
      }
    }
    loadBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Check URL query parameters and pathname for routes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const pathname = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const batchParam = params.get('batch') || params.get('verify') || params.get('code');
      const farmerParam = params.get('farmer') || params.get('farmerId');
      const viewParam = params.get('view') as AppView | null;
      const modeParam = params.get('mode');
      const isStandaloneMode = modeParam === 'consumer-standalone' || params.get('page') === 'consumer' || params.get('standalone') === 'true';

      // 1. Direct navigation to /provenance, /dossier, or /verify
      if (
        pathname.includes('/provenance') ||
        pathname.includes('/dossier') ||
        pathname.includes('/verify')
      ) {
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
        setCurrentView('consumer');
        return;
      }

      if (isStandaloneMode) {
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
        setIsStandaloneConsumer(true);
      } else if (viewParam === 'print-sticker' || viewParam === 'bottle-sticker') {
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
        setCurrentView('bottle-sticker');
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
      } else if (viewParam === 'consumer' || (viewParam as string) === 'provenance') {
        setCurrentView('consumer');
      } else if (viewParam) {
        setCurrentView(viewParam);
      }
    } catch (e) {
      console.warn('Failed to parse URL query params or pathname:', e);
    }
  }, [batches, farmers]);

  // Handle browser back/forward buttons
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const pathname = window.location.pathname.toLowerCase();
      if (
        pathname.includes('/provenance') ||
        pathname.includes('/dossier') ||
        pathname.includes('/verify')
      ) {
        setCurrentView('consumer');
      } else {
        const params = new URLSearchParams(window.location.search);
        const view = (params.get('view') as AppView) || 'beekeeper';
        setCurrentView((view as string) === 'provenance' ? 'consumer' : view);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Synchronize history state on view selection
  const handleSelectView = (view: AppView) => {
    const effectiveView = (view as string) === 'provenance' ? 'consumer' : view;
    setCurrentView(effectiveView);
    if (typeof window !== 'undefined') {
      try {
        if (effectiveView === 'consumer' || (view as string) === 'provenance') {
          const currentBatchParam = selectedBatch?.batchCode
            ? `?batch=${encodeURIComponent(selectedBatch.batchCode)}`
            : '';
          window.history.pushState({ view: 'consumer' }, '', `/provenance${currentBatchParam}`);
        } else if (effectiveView === 'beekeeper') {
          window.history.pushState({ view: 'beekeeper' }, '', '/');
        } else {
          window.history.pushState({ view: effectiveView }, '', `/?view=${effectiveView}`);
        }
      } catch (e) {}
    }
  };

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
    try {
      const created = await api.createBatch(newBatchData);
      setBatches((prev) => [created, ...prev.filter((b) => b.id !== created.id)]);
      setSelectedBatchId(created.id);
      const updatedAlerts = await api.getAlerts();
      setAlerts(updatedAlerts);
    } catch (err) {
      console.error('Failed to persist new harvest batch:', err);
    }
  };

  // Lab certifier issues certificate
  const handleIssueCertificate = async (batchId: string, cert: QualityCertificate) => {
    const nextBlock = latestBlockNumber + 1;
    setLatestBlockNumber(nextBlock);

    try {
      const updated = await api.certifyBatch(batchId, cert, nextBlock);
      if (updated) {
        setBatches((prev) => prev.map((b) => (b.id === batchId ? updated : b)));
      }
    } catch (err) {
      console.error('Failed to persist issued certificate:', err);
    }
  };

  // Beekeeper or Admin triggers blockchain anchoring
  const handleAnchorBatch = async (batchId: string) => {
    const nextBlock = latestBlockNumber + 1;
    setLatestBlockNumber(nextBlock);

    try {
      const updated = await api.anchorBatch(batchId, nextBlock);
      if (updated) {
        setBatches((prev) => prev.map((b) => (b.id === batchId ? updated : b)));
      }
    } catch (err) {
      console.error('Failed to anchor batch:', err);
    }
  };

  // Tamper toggle
  const handleTamperToggle = async (batchId: string, shouldTamper: boolean) => {
    try {
      const updated = await api.toggleTamper(batchId, shouldTamper);
      if (updated) {
        setBatches((prev) => prev.map((b) => (b.id === batchId ? updated : b)));
      }
    } catch (err) {
      console.error('Failed to toggle tamper state:', err);
    }
  };

  // Direct tamper edits from the Tamper Playground
  const handleUpdateBatchData = async (
    batchId: string,
    updates: Partial<HoneyBatch>,
    isTamperedFlag: boolean
  ) => {
    try {
      const updated = await api.updateBatch(batchId, updates, isTamperedFlag);
      if (updated) {
        setBatches((prev) => prev.map((b) => (b.id === batchId ? updated : b)));
      }
    } catch (err) {
      console.error('Failed to update batch data:', err);
    }
  };

  const relatedHive = hives.find(
    (h) => h.id === selectedBatch?.hiveId || h.hiveCode === selectedBatch?.hiveCode
  );
  const relatedFarmer =
    farmers.find(
      (f) =>
        f.name === selectedBatch?.beekeeperName ||
        f.id === selectedBatch?.farmerId
    ) || farmers[0];

  // If consumer opened via QR scan or requested standalone mode, render ONLY the dedicated PDF dossier with download option
  if (isStandaloneConsumer && selectedBatch) {
    return (
      <ConsumerPdfView
        batch={selectedBatch}
        hive={relatedHive}
        farmer={relatedFarmer}
        allBatches={batches}
        onSelectBatch={(b) => setSelectedBatchId(b.id)}
        onBackToPortal={() => setIsStandaloneConsumer(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Application Navbar */}
      <Navbar
        currentView={currentView}
        onSelectView={handleSelectView}
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
              handleSelectView('bottle-sticker');
            }}
            onAnchorBatch={handleAnchorBatch}
            onToggleSimulatedStream={() => setIsStreamActive(!isStreamActive)}
            isStreamActive={isStreamActive}
            initialSelectedHiveId={selectedHiveIdForTelemetry}
            onNavigateToApiaryMap={() => handleSelectView('apiary-map')}
          />
        )}

        {currentView === 'apiary-map' && (
          <ApiaryMapView
            hives={hives}
            alerts={alerts}
            onSelectHiveForTelemetry={(hiveId) => {
              setSelectedHiveIdForTelemetry(hiveId);
              handleSelectView('beekeeper');
            }}
            onLogHarvestForHive={(hive) => {
              setSelectedHiveIdForTelemetry(hive.id);
              handleSelectView('beekeeper');
            }}
            onNavigateToView={handleSelectView}
          />
        )}

        {(currentView === 'consumer' || (currentView as any) === 'provenance') && (
          <ConsumerVerificationView
            batches={batches}
            selectedBatch={selectedBatch}
            onSelectBatch={(b) => setSelectedBatchId(b.id)}
            onTamperToggle={handleTamperToggle}
            isTampered={isTampered}
            farmers={farmers}
            onNavigateToFarmer={(farmerId) => {
              setSelectedFarmerId(farmerId);
              handleSelectView('farmer-passport');
            }}
            onOpenBottleSticker={() => handleSelectView('bottle-sticker')}
            onOpenStandalonePage={() => setIsStandaloneConsumer(true)}
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
              setCurrentView('bottle-sticker');
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

        {(currentView === 'bottle-sticker' || currentView === 'print-sticker') && (
          <BottleStickerStudio
            batches={batches}
            hives={hives}
            farmers={farmers}
            initialBatchId={selectedBatchId}
            onOpenConsumerPage={(b) => {
              setSelectedBatchId(b.id);
              setIsStandaloneConsumer(true);
            }}
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
