/**
 * Honey Chain Pre-seeded Datasets & Comprehensive Knowledge Base
 * Aligned with SIH26021, KVIC Honey Mission, and PRD specifications
 */

import { Hive, HoneyBatch, AlertItem, LearningTopic } from '../types';

export const INITIAL_HIVES: Hive[] = [
  {
    id: 'hive-01',
    hiveCode: 'HIVE-RAJ-01',
    apiaryName: 'KVIC Honey Mission Apiary #4',
    location: 'Bhilwara, Rajasthan',
    queenYear: 2025,
    boxType: 'Langstroth 10-Frame (KVIC subsidized)',
    colonyCount: 1,
    status: 'healthy',
    lastSync: 'Just now (MQTT QoS 1)',
    currentReading: {
      id: 'sr-101',
      hiveId: 'hive-01',
      timestamp: new Date().toISOString(),
      temperature: 34.5,
      humidity: 58.2,
      weightKg: 46.8,
      soundDb: 42.1,
      source: 'REAL',
      seqNo: 4892,
    },
    healthAssessment: {
      hiveId: 'hive-01',
      status: 'healthy',
      overallScore: 94,
      predictionHeadline: 'Optimal brood temperature and healthy colony acoustic baseline',
      confidenceWord: 'High',
      confidencePct: 93,
      factors: [
        { name: 'Internal Brood Temp', value: '34.5°C (Ideal: 32-36°C)', impact: 'positive' },
        { name: 'Hive Relative Humidity', value: '58.2% (Ideal: 50-65%)', impact: 'positive' },
        { name: 'Daily Weight Accumulation', value: '+350g/day steady nectar flow', impact: 'positive' },
        { name: 'Colony Sound Spectrum', value: 'Steady 42 dB hum (Queen present)', impact: 'positive' },
      ],
      recommendedAction: 'No intervention required. Supers are 85% capped. Harvest planned in 4-6 days.',
      lastUpdated: '10 mins ago',
      isModelEstimate: true,
    },
    yieldPrediction: {
      hiveId: 'hive-01',
      estimatedNextHarvestKg: 24.8,
      baselineHistoricalKg: 22.0,
      method: 'Multi-Factor Sensor Trend',
      confidenceWord: 'High',
      factorsNoted: [
        'Prolonged acacia bloom in 3km radius',
        'Consistent brood nest thermal stability for 21 days',
        'Load cell indicates +4.2kg weight gain over past 12 days',
      ],
    },
  },
  {
    id: 'hive-02',
    hiveCode: 'HIVE-RAJ-02',
    apiaryName: 'KVIC Honey Mission Apiary #4',
    location: 'Bhilwara, Rajasthan',
    queenYear: 2024,
    boxType: 'Langstroth 10-Frame',
    colonyCount: 1,
    status: 'watch',
    lastSync: '2 mins ago',
    currentReading: {
      id: 'sr-102',
      hiveId: 'hive-02',
      timestamp: new Date().toISOString(),
      temperature: 37.8,
      humidity: 69.4,
      weightKg: 41.2,
      soundDb: 59.8,
      source: 'REAL',
      seqNo: 4890,
    },
    healthAssessment: {
      hiveId: 'hive-02',
      status: 'watch',
      overallScore: 68,
      predictionHeadline: 'Thermal spike and elevated acoustics indicate swarming preparation or heat stress',
      confidenceWord: 'Medium',
      confidencePct: 76,
      factors: [
        { name: 'Internal Brood Temp', value: '37.8°C (+2.3°C above baseline)', impact: 'warning' },
        { name: 'Humidity Trend', value: '69.4% (Elevated fanning effort)', impact: 'warning' },
        { name: 'Acoustic Frequency Peak', value: '59.8 dB with piping harmonics', impact: 'warning' },
        { name: 'Hive Weight Delta', value: '-600g over 48h (Scout bee departure)', impact: 'warning' },
      ],
      recommendedAction: 'Inspect bottom board for queen cells. Add upper ventilation spacer and shade canopy immediately.',
      lastUpdated: '2 mins ago',
      isModelEstimate: true,
    },
    yieldPrediction: {
      hiveId: 'hive-02',
      estimatedNextHarvestKg: 15.0,
      baselineHistoricalKg: 19.5,
      method: 'Multi-Factor Sensor Trend',
      confidenceWord: 'Medium',
      factorsNoted: [
        'Risk of 30% worker population loss if swarming occurs',
        'Energy diverted from honey storage to active hive cooling',
      ],
    },
  },
  {
    id: 'hive-03',
    hiveCode: 'HIVE-NSH-07',
    apiaryName: 'Nashik Agro-Cluster #1',
    location: 'Nashik, Maharashtra',
    queenYear: 2025,
    boxType: 'Newton 8-Frame Modified',
    colonyCount: 1,
    status: 'healthy',
    lastSync: '5 mins ago',
    currentReading: {
      id: 'sr-103',
      hiveId: 'hive-03',
      timestamp: new Date().toISOString(),
      temperature: 33.8,
      humidity: 54.0,
      weightKg: 52.4,
      soundDb: 38.6,
      source: 'SIMULATED',
      seqNo: 2110,
    },
    healthAssessment: {
      hiveId: 'hive-03',
      status: 'healthy',
      overallScore: 96,
      predictionHeadline: 'Exceptional comb density with high nectar concentration',
      confidenceWord: 'High',
      confidencePct: 95,
      factors: [
        { name: 'Internal Brood Temp', value: '33.8°C (Optimal)', impact: 'positive' },
        { name: 'Relative Humidity', value: '54.0% (Fast moisture evaporation)', impact: 'positive' },
        { name: 'Gross Weight', value: '52.4 kg (Exceeds seasonal average)', impact: 'positive' },
      ],
      recommendedAction: 'Ready for extraction. Extract within 72 hours to prevent honey-bound brood.',
      lastUpdated: '5 mins ago',
      isModelEstimate: true,
    },
    yieldPrediction: {
      hiveId: 'hive-03',
      estimatedNextHarvestKg: 28.5,
      baselineHistoricalKg: 24.0,
      method: 'Baseline Historical Average',
      confidenceWord: 'High',
      factorsNoted: [
        'Sunflower floral flow in peak bloom',
        'High colony worker density with strong hygienic behavior',
      ],
    },
  },
];

export const INITIAL_BATCHES: HoneyBatch[] = [
  {
    id: 'batch-01',
    batchCode: 'HC-2026-0142',
    hiveId: 'hive-01',
    hiveCode: 'HIVE-RAJ-01',
    apiaryLocation: 'KVIC Honey Mission Apiary #4, Bhilwara',
    beekeeperName: 'Rameshwar Lal Gurjar',
    beekeeperPhone: '+91 98290 XXXXX',
    district: 'Bhilwara',
    state: 'Rajasthan',
    honeyType: 'Wild Mustard & Desert Flora',
    grossWeightKg: 27.2,
    netWeightKg: 24.5,
    framesHarvested: 8,
    harvestDate: '2026-09-08',
    packagingDate: '2026-09-11',
    status: 'PACKAGED',
    qrToken: 'hc_tok_9a8f4c21e7b3',
    qrUrl: 'https://honeychain.org/verify/hc_tok_9a8f4c21e7b3',
    events: [
      {
        id: 'ev-01',
        eventType: 'HARVEST',
        title: 'Hive Extraction Recorded',
        occurredAt: '2026-09-08 09:30 AM',
        actorName: 'Rameshwar Lal Gurjar',
        actorRole: 'Beekeeper (KVIC Beneficiary #RAJ-1044)',
        location: 'Bhilwara Apiary #4',
        details: 'Extracted 8 fully capped frames using manual centrifugal extractor. Filtered through 80-mesh food-grade stainless steel sieve.',
        eventHash: '0x3a9f1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a',
        iconName: 'Archive',
      },
      {
        id: 'ev-02',
        eventType: 'PROCESSING',
        title: 'Cold Settling & Moisture Check',
        occurredAt: '2026-09-09 02:15 PM',
        actorName: 'Bhilwara Honey Producers Co-op',
        actorRole: 'Processing Unit',
        location: 'Mandalgarh Processing Center, Rajasthan',
        details: 'Gravity settled for 24h at ambient 28°C. No heating or artificial micro-filtration applied. Raw enzyme profile preserved.',
        eventHash: '0x4b8c2d1e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
        iconName: 'Filter',
      },
      {
        id: 'ev-03',
        eventType: 'LAB_TEST',
        title: 'FSSAI Laboratory Purity Certified',
        occurredAt: '2026-09-10 11:45 AM',
        actorName: 'Dr. Sunita Sharma, Senior Chemist',
        actorRole: 'National Quality Testing Lab (NABL Accredited)',
        location: 'Jaipur Analytical Laboratory',
        details: 'Comprehensive testing per FSSAI Food Safety (Honey Standards). Moisture 17.8%, HMF 14 mg/kg, C4 syrup adulteration test: Negative.',
        eventHash: '0x5c7d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
        iconName: 'ShieldCheck',
      },
      {
        id: 'ev-04',
        eventType: 'BLOCKCHAIN_ANCHOR',
        title: 'Cryptographic Batch Sealed on Ledger',
        occurredAt: '2026-09-11 10:05 AM',
        actorName: 'Honey Chain Automated Relayer',
        actorRole: 'Smart Contract Engine',
        location: 'Polygon Amoy Public Testnet',
        details: 'Merkle commitment hash 0x7f4a... anchored permanently into HoneyChainRegistry smart contract at Block #19,842,109.',
        eventHash: '0x7f4a8b1c9d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
        iconName: 'Link',
      },
      {
        id: 'ev-05',
        eventType: 'PACKAGING',
        title: 'Bottled & QR Tamper Seal Affixed',
        occurredAt: '2026-09-11 04:30 PM',
        actorName: 'KVIC Gramodyog Packaging Cell',
        actorRole: 'Packaging Supervisor',
        location: 'Jaipur Khadi Bhavan',
        details: 'Jarred in 500g sterilized food-grade glass jars. Holographic tamper-evident seal and unique QR label roll #3 applied.',
        eventHash: '0x9e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1b',
        iconName: 'PackageCheck',
      },
    ],
    certificate: {
      id: 'cert-1042',
      certificateNumber: 'NABL/FSSAI-2026-HN-8902',
      batchId: 'batch-01',
      labName: 'National Food Analytical Research Institute (NABL Accr. TC-5892)',
      accreditationNumber: 'ISO/IEC 17025:2017 Certified',
      analystName: 'Dr. Sunita Sharma, Lead Chemist',
      issuedAt: '2026-09-10',
      standardName: 'FSSAI Food Safety and Standards (Honey) 2020 / Codex Alimentarius',
      parameters: {
        moisturePct: 17.8, // Limit: <= 20%
        hmfMgKg: 14.2, // Limit: <= 80 mg/kg
        fructoseGlucoseRatio: 1.14, // Limit: >= 0.95
        sucrosePct: 1.8, // Limit: <= 5%
        pollenCountPerGram: 28400, // Typical authentic raw honey > 20k
        c4SugarAdulteration: 'Negative', // EA-IRMS isotopic ratio
        antibioticResidue: 'None Detected',
        overallResult: 'PASS',
      },
      documentHash: '0x8b3e5a2c1f9d4e7a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a',
      status: 'VALID',
    },
    blockchainRecord: {
      contractAddress: '0x71C2d67F0598822384a51A7d9D04BFe44A895F31',
      network: 'Polygon Amoy Proof-of-Stake (EVM)',
      chainId: 80002,
      batchCodeHash: '0x83e29f0a41d9572b89c72e9a3b04c81ef40d99a32c6114a9c680145c2bfae031',
      commitmentHash: '', // Dynamically computed on init
      merkleRoot: '0xd4a6e8b2f1c97a53e0d8b6c4a2f0e8d6c4a2f0e8d6c4a2f0e8d6c4a2f0e8d6c4',
      leafIndex: 0,
      txHash: '0x4a9b2c8d1e0f3a5b7c9e1f3a5b7c9e1f3a5b7c9e1f3a5b7c9e1f3a5b7c9e1f3a',
      blockNumber: 19842109,
      anchoredAt: '2026-09-11T10:05:00Z',
      status: 'CONFIRMED',
      verificationStatus: 'VERIFIED',
    },
  },
  {
    id: 'batch-02',
    batchCode: 'HC-2026-0143',
    hiveId: 'hive-02',
    hiveCode: 'HIVE-RAJ-02',
    apiaryLocation: 'KVIC Honey Mission Apiary #4, Bhilwara',
    beekeeperName: 'Rameshwar Lal Gurjar',
    beekeeperPhone: '+91 98290 XXXXX',
    district: 'Bhilwara',
    state: 'Rajasthan',
    honeyType: 'Mustard Blossom',
    grossWeightKg: 35.0,
    netWeightKg: 31.8,
    framesHarvested: 10,
    harvestDate: '2026-09-11',
    packagingDate: 'Estimated 2026-09-15',
    status: 'LAB_TESTED',
    qrToken: 'hc_tok_5b7e9a12c4d8',
    qrUrl: 'https://honeychain.org/verify/hc_tok_5b7e9a12c4d8',
    events: [
      {
        id: 'ev-201',
        eventType: 'HARVEST',
        title: 'Harvest Extracted',
        occurredAt: '2026-09-11 08:45 AM',
        actorName: 'Rameshwar Lal Gurjar',
        actorRole: 'Beekeeper',
        location: 'Bhilwara Apiary #4',
        details: 'Extracted 10 frames of ripe mustard floral nectar. Gross weight recorded at apiary gateway.',
        eventHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        iconName: 'Archive',
      },
      {
        id: 'ev-202',
        eventType: 'LAB_TEST',
        title: 'Laboratory Samples Submitted',
        occurredAt: '2026-09-11 04:00 PM',
        actorName: 'KVIC Field Officer',
        actorRole: 'Coordinator',
        location: 'State Testing Facility, Ajmer',
        details: 'Sample bottles sealed and dispatched under chain of custody protocol.',
        eventHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
        iconName: 'ShieldCheck',
      },
    ],
  },
  {
    id: 'batch-03',
    batchCode: 'HC-2026-0139',
    hiveId: 'hive-03',
    hiveCode: 'HIVE-NSH-07',
    apiaryLocation: 'Nashik Agro-Cluster #1',
    beekeeperName: 'Dnyaneshwar Shinde',
    beekeeperPhone: '+91 94230 XXXXX',
    district: 'Nashik',
    state: 'Maharashtra',
    honeyType: 'Wild Acacia & Sunflower',
    grossWeightKg: 28.0,
    netWeightKg: 25.2,
    framesHarvested: 9,
    harvestDate: '2026-09-02',
    packagingDate: '2026-09-06',
    status: 'PACKAGED',
    qrToken: 'hc_tok_demo_tamper',
    qrUrl: 'https://honeychain.org/verify/hc_tok_demo_tamper',
    events: [
      {
        id: 'ev-301',
        eventType: 'HARVEST',
        title: 'Harvest Logged',
        occurredAt: '2026-09-02 10:00 AM',
        actorName: 'Dnyaneshwar Shinde',
        actorRole: 'Beekeeper',
        location: 'Nashik Apiary',
        details: 'Harvested 25.2 kg acacia honey.',
        eventHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
        iconName: 'Archive',
      },
      {
        id: 'ev-302',
        eventType: 'BLOCKCHAIN_ANCHOR',
        title: 'Anchored on Ledger',
        occurredAt: '2026-09-05 03:20 PM',
        actorName: 'Honey Chain Relayer',
        actorRole: 'Relayer',
        location: 'Polygon Amoy',
        details: 'Anchored original batch hash at Block #19,835,012.',
        eventHash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
        iconName: 'Link',
      },
    ],
    certificate: {
      id: 'cert-1039',
      certificateNumber: 'NABL/FSSAI-2026-HN-8711',
      batchId: 'batch-03',
      labName: 'Maharashtra State Food Testing Laboratory, Pune',
      accreditationNumber: 'ISO/IEC 17025',
      analystName: 'Dr. V. Kulkarni',
      issuedAt: '2026-09-04',
      standardName: 'FSSAI Food Safety and Standards (Honey)',
      parameters: {
        moisturePct: 18.2,
        hmfMgKg: 18.0,
        fructoseGlucoseRatio: 1.08,
        sucrosePct: 2.1,
        pollenCountPerGram: 24000,
        c4SugarAdulteration: 'Negative',
        antibioticResidue: 'None Detected',
        overallResult: 'PASS',
      },
      documentHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
      status: 'VALID',
    },
    blockchainRecord: {
      contractAddress: '0x71C2d67F0598822384a51A7d9D04BFe44A895F31',
      network: 'Polygon Amoy Proof-of-Stake',
      chainId: 80002,
      batchCodeHash: '0x55e09f0a41d9572b89c72e9a3b04c81ef40d99a32c6114a9c680145c2bfae111',
      commitmentHash: '', // dynamically calculated
      merkleRoot: '0x7a6e8b2f1c97a53e0d8b6c4a2f0e8d6c4a2f0e8d6c4a2f0e8d6c4a2f0e8d6c4a',
      leafIndex: 1,
      txHash: '0x889b2c8d1e0f3a5b7c9e1f3a5b7c9e1f3a5b7c9e1f3a5b7c9e1f3a5b7c9e1f3a',
      blockNumber: 19835012,
      anchoredAt: '2026-09-05T15:20:00Z',
      status: 'CONFIRMED',
      verificationStatus: 'VERIFIED',
    },
  },
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alt-01',
    type: 'sensor_anomaly',
    severity: 'warning',
    title: 'Thermal Spike in Hive-RAJ-02',
    message: 'Temperature exceeded 37.5°C threshold with elevated acoustic level (59.8 dB). Colony may be preparing to swarm or experiencing excessive ambient radiant heat.',
    hiveId: 'hive-02',
    timestamp: '15 mins ago',
    isRead: false,
    recommendedAction: 'Check top ventilation and inspect brood frames for queen swarm cells.',
  },
  {
    id: 'alt-02',
    type: 'harvest_due',
    severity: 'info',
    title: 'Hive-NSH-07 Reached Harvest Weight Target',
    message: 'Total hive weight reached 52.4 kg (+12.4 kg over empty tare). Super frames are estimated 90% capped.',
    hiveId: 'hive-03',
    timestamp: '1 hour ago',
    isRead: false,
    recommendedAction: 'Schedule extraction within 72 hours to maximize nectar capacity.',
  },
  {
    id: 'alt-03',
    type: 'chain_anchor_failed',
    severity: 'success',
    title: 'Batch HC-2026-0142 Successfully Anchored',
    message: 'Transaction confirmed on Polygon Amoy testnet at Block #19,842,109. Merkle root committed.',
    batchCode: 'HC-2026-0142',
    timestamp: 'Yesterday at 10:05 AM',
    isRead: true,
    recommendedAction: 'Print and apply verified QR label rolls to retail jars.',
  },
];

export const LEARNING_TOPICS: LearningTopic[] = [
  {
    id: 'explain',
    filename: 'explain.md',
    title: 'System Overview & Problem Statement',
    category: 'Overview',
    badge: 'Core Concept',
    summary: 'Understanding SIH26021: Why honey needs a digital trust layer from hive to retail jar.',
    q1What: 'Honey Chain is a digital provenance and smart apiary management system that tracks honey from the beehive to the jar, protects honey authenticity using lab certifications anchored to a blockchain, and monitors bee colony health using IoT sensors and AI.',
    q2Why: 'Over 70% of commercial honey sampled in investigations is adulterated with cheap industrial sugar syrups (C4/rice syrup). Rural beekeepers harvest pure honey but have no way to prove it, while consumers cannot verify what is in the jar. Additionally, beekeepers lose up to 30% of colonies each year to undetected disease or swarming.',
    q3How: 'Sensors in the hive stream temperature, humidity, and weight to the backend. When honey is extracted, the beekeeper registers the batch. A certified lab uploads test results. A cryptographic hash (digital fingerprint) of the batch and lab test is sealed onto a blockchain. A QR code on the jar allows any consumer to inspect the unalterable history.',
    q4Analogy: 'Think of an uncrackable wax-sealed registered letter: The database is the letter with the harvest and lab details. The blockchain is the town notary logbook stamping the exact seal imprint. The QR code is the delivery stamp on the outside.',
    q5Connection: 'This is the master umbrella connecting every hardware, backend, AI, and verification module in Honey Chain.',
    codeSnippet: {
      language: 'json',
      description: 'The Golden Provenance Chain',
      code: `[Hive Sensors] ──(MQTT)──> [FastAPI Backend] ──(PostgreSQL)
                                      │
                         [Lab Quality Certification]
                                      │
                            [Blockchain Notary]
                       (Anchors SHA-256 Merkle Hash)
                                      │
                          [QR Code on Honey Jar]
                                      │
                         [Consumer Phone Camera]
                        (Tamper-Proof Verification)`
    }
  },
  {
    id: 'architecture',
    filename: 'architecture.md',
    title: 'System Architecture (Modular Monolith)',
    category: 'Engineering',
    badge: '12 Components',
    summary: 'Clean modular monolith design with PostgreSQL, MQTT ingestion, and outbox blockchain relayer.',
    q1What: 'The architectural blueprint dividing Honey Chain into 12 distinct, decoupled components (Frontend PWA, FastAPI Backend, PostgreSQL DB, EVM Blockchain, Smart Contracts, QR Service, IoT Ingestion, AI/ML Service, Object Storage, Auth, Notifications, Admin).',
    q2Why: 'Microservices create unnecessary distributed-system latency and failure points for hackathons and rural clusters. A modular monolith provides clean boundaries, fast iteration, and robust transactions without distributed network headaches.',
    q3How: 'Devices communicate via MQTT QoS 1 to an ingestion worker. Business users use REST APIs. Writes commit first to PostgreSQL with an Outbox event; an asynchronous worker batches commitments into a Merkle root and anchors it to the smart contract.',
    q4Analogy: 'A high-end restaurant: The kitchen has specialized stations (baking, grill, saucier) all under one roof sharing the same pantry (PostgreSQL), with a maitre d’ (API Gateway) greeting customers at the front door.',
    q5Connection: 'Governs where every file, database table, and service boundary lives in the Honey Chain repository.',
    codeSnippet: {
      language: 'typescript',
      description: 'The Outbox Pattern for Non-Blocking Blockchain Anchoring',
      code: `// 1. Beekeeper commits harvest to PostgreSQL (Instant 200 OK)
await db.transaction(async (tx) => {
  const batch = await tx.batches.create({ data: batchPayload });
  await tx.outboxEvents.create({
    data: { type: 'ANCHOR_BATCH', subjectId: batch.id, payload: batch }
  });
});

// 2. Background worker polls outbox, amortizes gas in Merkle batch
const pending = await db.outboxEvents.findMany({ where: { status: 'PENDING' }, take: 100 });
const merkleRoot = buildMerkleTree(pending.map(e => hashCanonical(e.payload)));
await honeyChainContract.anchorBatch(merkleRoot);`
    }
  },
  {
    id: 'database',
    filename: 'database.md',
    title: 'Database Schema & Relational Design',
    category: 'Engineering',
    badge: 'PostgreSQL 15+',
    summary: 'The single source of truth for hives, sensor time-series, harvests, and immutable processing logs.',
    q1What: 'A relational PostgreSQL database structuring Beekeepers, Apiaries, Hives, SensorReadings, Harvests, HoneyBatches, QualityCertificates, and BlockchainRecords.',
    q2Why: 'Blockchain is too slow and expensive to store raw sensor time-series or user data. Relational databases enforce ACID consistency, foreign keys, and fast queries for consumer QR lookups in milliseconds.',
    q3How: 'Sensor readings are partitioned monthly for high ingest rates. Processing events are append-only: previous event hashes are chained (hash-chaining in the database), making any manual tampering immediately noticeable in audit logs.',
    q4Analogy: 'A bank ledger: You never use an eraser on a bank ledger. If a mistake is made, you write a correcting entry on the next line. Every page references the previous balance.',
    q5Connection: 'Powers all screens: the Beekeeper dashboard queries their hives, while the public verify endpoint fetches the batch timeline.',
    codeSnippet: {
      language: 'sql',
      description: 'Core Relational Schema with Hash-Chained Events',
      code: `CREATE TABLE honey_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code VARCHAR(32) UNIQUE NOT NULL,
  hive_id UUID REFERENCES hives(id),
  net_weight_kg NUMERIC(6,2) NOT NULL,
  harvest_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE processing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES honey_batches(id),
  event_type VARCHAR(30) NOT NULL,
  prev_event_hash CHAR(66) NOT NULL,
  event_hash CHAR(66) NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL
);`
    }
  },
  {
    id: 'blockchain',
    filename: 'blockchain.md',
    title: 'Blockchain & Smart Contract Notary',
    category: 'Engineering',
    badge: 'EVM / Polygon',
    summary: 'Tamper-evident record of submitted events. NOT a chemical purity tester, but an unalterable seal.',
    q1What: 'An EVM smart contract (`HoneyChainRegistry.sol`) running on a public ledger (Polygon Amoy testnet) that stores cryptographic hashes of batch commitments and lab certificates.',
    q2Why: 'In a traditional centralized database, a corrupt admin or hacker can change a harvest date or alter an adulterated test to "PASS" without anyone noticing. A blockchain makes past records mathematically impossible to secretly rewrite.',
    q3How: 'A canonical JSON string of the essential batch and lab fields is hashed with SHA-256. The smart contract stores `batchCodeHash => commitmentHash`. When a consumer scans the QR, their browser recalculates the hash from the database and compares it to the blockchain.',
    q4Analogy: 'Engraving a receipt number into wet cement at the public town square: Once the cement dries, anyone can check if the paper receipt matches the inscription in the square.',
    q5Connection: 'Provides the "✔ Blockchain Verified" badge on the consumer verification page and powers the live tamper test.',
    codeSnippet: {
      language: 'solidity',
      description: 'HoneyChainRegistry Smart Contract Interface',
      code: `// SPDX-License-Identifier: Apache-2.0
contract HoneyChainRegistry {
    address public relayer;
    mapping(bytes32 => bytes32) public batchCommitments;
    mapping(bytes32 => uint256) public anchorTimestamps;

    event BatchAnchored(bytes32 indexed batchCodeHash, bytes32 commitmentHash, uint256 blockNum);

    function anchorBatch(bytes32 batchCodeHash, bytes32 commitmentHash) external {
        require(msg.sender == relayer, "Unauthorized relayer");
        require(batchCommitments[batchCodeHash] == bytes32(0), "Already anchored");
        batchCommitments[batchCodeHash] = commitmentHash;
        anchorTimestamps[batchCodeHash] = block.timestamp;
        emit BatchAnchored(batchCodeHash, commitmentHash, block.number);
    }
}`
    }
  },
  {
    id: 'iot',
    filename: 'iot.md',
    title: 'IoT Hive Sensing & Edge Computing',
    category: 'Hardware & IoT',
    badge: 'ESP32 & Sensors',
    summary: 'Microcontrollers measuring temperature, humidity, weight, and sound with flash ring buffers for rural offline survival.',
    q1What: 'An IoT hardware stack combining an ESP32 microcontroller, DHT22 temperature/humidity sensor, HX711 load cell weight amplifier, and acoustic microphone inside the hive box.',
    q2Why: 'Beekeepers often visit rural apiaries only once every 10–14 days. By the time they see disease or swarming, it is too late. Sensors give early warnings of temperature drop, weight loss, or queen absence.',
    q3How: 'The ESP32 samples sensors every 60 seconds. In rural areas without continuous Wi-Fi/cellular connection, it logs readings into an on-chip SPI flash ring buffer. When network connectivity restores, it bursts stored readings in chronological order with original timestamps.',
    q4Analogy: 'A patient vital-signs monitor in an intensive care unit that continuously checks heart rate and temperature, sounding an alarm before an emergency happens.',
    q5Connection: 'Provides the raw real-world data that feeds into the AI colony health assessment and yield forecasting modules.',
    codeSnippet: {
      language: 'cpp',
      description: 'ESP32 Firmware Loop with Offline Ring-Buffer Fallback',
      code: `void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  float weight = scale.get_units(5);

  if (isnan(temp) || isnan(hum)) {
    Serial.println("Sensor read fault, skipping");
    return;
  }

  SensorPayload payload = { millis(), temp, hum, weight, seqNo++ };
  if (WiFi.status() == WL_CONNECTED) {
    publishMQTT("honeychain/hive1/telemetry", payload);
  } else {
    ringBuffer.push(payload); // Flash storage for rural connectivity loss
  }
  delay(60000); // 1-minute sampling interval
}`
    }
  },
  {
    id: 'ai',
    filename: 'ai.md',
    title: 'AI Hive Health & Anomaly Detection',
    category: 'AI & Analytics',
    badge: 'Explainable AI',
    summary: 'Anomaly detection rules & models flagging swarming, thermal stress, and queen loss with clear reasoning.',
    q1What: 'An analytical and machine-learning layer that analyzes sensor telemetry to assess colony health, flag swarming risks, and predict honey harvest yields.',
    q2Why: 'Beekeepers cannot spend hours looking at raw numbers like "37.8°C and 59 dB". They need clear, actionable guidance: "Hive 2 temperature rising — check top ventilation immediately."',
    q3How: 'Combines heuristic biological rules with Isolation Forest anomaly detection. Every AI output provides a headline, a confidence word (High/Medium/Low), and the exact contributing factors so the beekeeper can verify in person.',
    q4Analogy: 'A seasoned master beekeeper walking through the apiary, putting their ear to the box, and saying "Listen to that high pitch — the bees are getting ready to swarm."',
    q5Connection: 'Powers the health status strip, the AI recommendation cards on the beekeeper dashboard, and the harvest yield estimator.',
    codeSnippet: {
      language: 'python',
      description: 'Colony Health Assessment Rule Engine (Heuristic + Isolation Forest)',
      code: `def assess_hive_health(telemetry_window):
    avg_temp = telemetry_window['temperature'].mean()
    temp_std = telemetry_window['temperature'].std()
    weight_delta_24h = telemetry_window['weight'].iloc[-1] - telemetry_window['weight'].iloc[0]

    reasons = []
    # Rule 1: Brood nest thermal stress
    if avg_temp > 36.5:
        reasons.append(f"Temperature {avg_temp:.1f}°C exceeds safe 32-36°C brood baseline")
    # Rule 2: Sudden weight drop without logged harvest (Swarm indicator)
    if weight_delta_24h < -1.2:
        reasons.append(f"Sudden {abs(weight_delta_24h):.1f}kg weight loss indicates worker bee departure")

    status = "CRITICAL" if len(reasons) >= 2 else ("WATCH" if len(reasons) == 1 else "HEALTHY")
    return {
        "status": status,
        "confidence": "High" if len(telemetry_window) > 100 else "Medium",
        "reasons": reasons,
        "recommendation": "Inspect brood nest for queen cells and provide shading." if status != "HEALTHY" else "Optimal."
    }`
    }
  },
  {
    id: 'frontend',
    filename: 'frontend.md',
    title: 'Frontend & PWA Architecture',
    category: 'Engineering',
    badge: 'Mobile-First',
    summary: 'High-contrast, outdoor-readable UI with 52px touch targets for beekeepers and instant QR scan page for consumers.',
    q1What: 'The user interface built with React, Vite, and Tailwind CSS, featuring responsive layouts for both rural beekeepers and urban consumers.',
    q2Why: 'Beekeepers work in bright sunlight with dirt or gloves on their hands; consumer QR pages must load on 3G mobile data in under 3 seconds without an app install.',
    q3How: 'Uses large 52px primary action buttons, high color contrast, icon-supported navigation, and zero-login public verification pages.',
    q4Analogy: 'The dashboard and instruments of a tractor: Rugged, clear, easy to tap even when wearing work gloves, with big visible dials.',
    q5Connection: 'The face of Honey Chain: Renders the beekeeper dashboard, the admin portal, and the consumer verification page.',
    codeSnippet: {
      language: 'tsx',
      description: 'Public Verification Badge Component',
      code: `export function VerificationBadge({ verified, onChainHash }: { verified: boolean; onChainHash: string }) {
  return (
    <div className={\`p-4 rounded-xl border \${verified ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}\`}>
      <div className="flex items-center gap-3">
        {verified ? <ShieldCheck className="w-8 h-8 text-emerald-600" /> : <ShieldAlert className="w-8 h-8 text-rose-600" />}
        <div>
          <h4 className="font-bold text-lg">{verified ? 'Record Integrity Verified' : 'Integrity Check Failed'}</h4>
          <p className="text-sm opacity-90 font-mono">Ledger Anchor: {formatHexShort(onChainHash)}</p>
        </div>
      </div>
    </div>
  );
}`
    }
  },
  {
    id: 'backend',
    filename: 'backend.md',
    title: 'Backend API & Business Logic',
    category: 'Engineering',
    badge: 'FastAPI / Express',
    summary: 'The central orchestration layer routing MQTT ingest, database persistence, and consumer verification queries.',
    q1What: 'The server-side application exposing REST endpoints for auth, hives, harvests, batches, certificates, and blockchain anchors.',
    q2Why: 'Keeps sensitive business logic, database credentials, and blockchain relayer private keys off client phones, while orchestrating background jobs safely.',
    q3How: 'Validates all requests against strict schemas, checks user permissions via JWT tokens, handles idempotency keys to prevent duplicate batch creation, and emits outbox tasks.',
    q4Analogy: 'The central dispatcher and kitchen coordinator at a busy logistics hub, directing what gets cooked, packed, and signed for.',
    q5Connection: 'Connects the IoT broker, the database, the AI model workers, and the web clients.',
    codeSnippet: {
      language: 'typescript',
      description: 'Idempotent Batch Creation Endpoint',
      code: `app.post('/api/v1/batches', authenticateBeekeeper, async (req, res) => {
  const { hiveId, honeyType, netWeightKg, framesHarvested } = req.body;
  // Verify hive ownership
  const hive = await db.hives.findFirst({ where: { id: hiveId, beekeeperId: req.user.id } });
  if (!hive) return res.status(403).json({ error: 'Hive ownership required' });

  const batchCode = await generateUniqueBatchCode();
  const batch = await db.batches.create({
    data: { batchCode, hiveId, beekeeperId: req.user.id, honeyType, netWeightKg, status: 'HARVESTED' }
  });
  return res.status(201).json(batch);
});`
    }
  },
  {
    id: 'security',
    filename: 'security.md',
    title: 'Security, Auth & Anti-Counterfeiting',
    category: 'Quality & Security',
    badge: 'Zero-Trust Keys',
    summary: 'Never exposing private keys, HMAC-signed QR codes, and protecting against data tampering.',
    q1What: 'The security framework enforcing Role-Based Access Control (RBAC), device API keys, private key isolation, and rate-limited public verification.',
    q2Why: 'Fake honey cartels try to clone QR codes, spam fake sensor readings, or steal beekeeper credentials. Strict security protects data integrity from farm to shelf.',
    q3How: 'Beekeepers use JWTs; sensors use device-specific API keys; the blockchain relayer key is stored in server environment secrets; and QR codes use unguessable HMAC tokens rather than sequential IDs.',
    q4Analogy: 'A security guard checkpoint with separate badges for visitors (consumers), employees (beekeepers), and armored car drivers (blockchain relayer).',
    q5Connection: 'Ensures that only authentic beekeepers can record harvests and that consumers can detect forged or duplicated QR codes.',
    codeSnippet: {
      language: 'typescript',
      description: 'HMAC-Signed QR Token Generation',
      code: `import crypto from 'crypto';

export function generateSecureQRToken(batchId: string, secretKey: string): string {
  const randomSalt = crypto.randomBytes(16).toString('hex');
  const hmac = crypto.createHmac('sha256', secretKey)
    .update(\`\${batchId}:\${randomSalt}\`)
    .digest('hex');
  return \`hc_\${randomSalt.slice(0, 8)}_\${hmac.slice(0, 16)}\`;
}`
    }
  },
  {
    id: 'testing',
    filename: 'testing.md',
    title: 'Testing & Verification Strategy',
    category: 'Quality & Security',
    badge: 'Automated Tests',
    summary: 'Unit, integration, and live hardware-mock testing ensuring reliable SIH demo delivery.',
    q1What: 'A multi-tier testing suite covering smart contract unit tests in Hardhat, API route validation, sensor simulation edge cases, and tamper-detection proofs.',
    q2Why: 'A live demo in front of hackathon judges cannot fail due to a missing null-check or unexpected sensor dropout.',
    q3How: 'Unit tests run in CI. Hardhat tests verify reentrancy and access controls. Sensor ingest tests feed out-of-range temperatures to ensure invalid readings are rejected.',
    q4Analogy: 'A flight pre-check checklist that pilots complete before takeoff: Every switch, gauge, and backup system is checked before passengers board.',
    q5Connection: 'Validates that every feature built in Phases 1 through 14 works correctly and reliably.',
    codeSnippet: {
      language: 'typescript',
      description: 'Automated Tamper-Detection Unit Test',
      code: `it('should flag integrity failure when harvest quantity is modified', async () => {
  const original = { ...sampleBatch };
  const anchoredCommitment = await computeBatchCommitmentHash(original, sampleCert);

  // Tamper with local record
  const tampered = { ...original, netWeightKg: 45.0 };
  const tamperedCommitment = await computeBatchCommitmentHash(tampered, sampleCert);

  expect(tamperedCommitment).not.toEqual(anchoredCommitment);
  const result = await verifyBatchIntegrity(tampered, anchoredCommitment);
  expect(result.verified).toBe(false);
});`
    }
  },
  {
    id: 'errors',
    filename: 'errors.md',
    title: 'Error Handling & Offline Resilience',
    category: 'Quality & Security',
    badge: 'Fail-Safe',
    summary: 'Handling network dropouts, blockchain node downtime, and corrupted sensor packets gracefully.',
    q1What: 'Architectural mechanisms that keep the application working even when internet connection fails in rural apiaries or blockchain nodes lag.',
    q2Why: 'Rural India frequently has spotty 2G/3G connectivity. If an app crashes when offline, beekeepers cannot log harvests or manage their hives.',
    q3How: 'IndexedDB stores pending offline harvests in the PWA; ESP32 uses an on-board ring buffer; blockchain anchoring uses an outbox queue that retries with exponential backoff.',
    q4Analogy: 'Writing down an order on a physical notepad when the credit card terminal loses signal, then swiping the card once the signal returns.',
    q5Connection: 'Guarantees zero data loss between field bee boxes and the central cloud database.',
    codeSnippet: {
      language: 'typescript',
      description: 'PWA Offline Outbox Synchronization',
      code: `async function syncOfflineOutbox() {
  const pendingActions = await getIndexedDBOutbox();
  for (const action of pendingActions) {
    try {
      await fetch('/api/v1/harvests', {
        method: 'POST',
        headers: { 'Idempotency-Key': action.clientUUID, 'Content-Type': 'application/json' },
        body: JSON.stringify(action.payload)
      });
      await markActionCompleted(action.id);
    } catch (err) {
      console.warn('Network still unavailable; will retry on next reconnect event');
      break;
    }
  }
}`
    }
  },
  {
    id: 'phase',
    filename: 'phase.md',
    title: '15-Phase Development Roadmap',
    category: 'Process',
    badge: 'PHASES.md',
    summary: 'Step-by-step path from zero code to an SIH-winning end-to-end prototype.',
    q1What: 'A structured roadmap breaking the Honey Chain build into 15 concrete phases categorized into MVP (🟢), Advanced (🔵), and Optional (🟣).',
    q2Why: 'Prevents scope creep and prevents teams from building complex blockchain contracts or ML before the basic database and frontend even work.',
    q3How: 'Follows a strict Definition of Done rule: Phase 0 (Setup) -> Phase 1 (Web App) -> Phase 2 (DB & Auth) -> Phase 3 (Hives) -> Phase 4 (Harvest) -> Phase 5 (QR Verify) -> Phase 6 (Blockchain) -> Phase 7-8 (IoT) -> Phase 9-11 (AI) -> Phase 12-15 (Hardening & Demo).',
    q4Analogy: 'Building a house: You pour the foundation (Phase 0-2) and frame the walls (Phase 3-5) before you install the smart locks and solar panels (Phase 6-11).',
    q5Connection: 'Organizes the team’s development milestones and ensures no phase relies on unfinished scaffolding.',
    codeSnippet: {
      language: 'markdown',
      description: 'Phase Tier Summary',
      code: `🟢 MVP Spine:
Phase 0: Project Setup & Specs
Phase 1: Basic Web Architecture
Phase 2: PostgreSQL & Auth
Phase 3: Hive Management
Phase 4: Harvest & Batch System
Phase 5: Public QR Verification

🔵 Advanced Trust & Smart Apiary:
Phase 6: Blockchain Smart Contract Anchoring
Phase 7: IoT Telemetry Simulation
Phase 8: Physical ESP32 Hardware
Phase 9: AI/ML Data Pipeline
Phase 10: Colony Health & Disease Flagging
Phase 11: Yield & Productivity Forecasting
Phase 12: Alerts & Analytics

🟢 Capstone:
Phase 13: System Integration Walkthrough
Phase 14: Hardening & Testing
Phase 15: SIH Demo Delivery`
    }
  },
  {
    id: 'review',
    filename: 'review.md',
    title: 'Code Review & Engineering Rules',
    category: 'Process',
    badge: 'RULES.md',
    summary: 'Critical project rules: Never claim blockchain proves purity, never put raw sensor blobs on-chain.',
    q1What: 'The non-negotiable engineering laws in `RULES.md` that all team members and AI coders must follow.',
    q2Why: 'Protects the project from legal and technical pitfalls—such as misleading consumers into thinking a blockchain replaces laboratory chemical testing, or bloating gas fees by storing gigabytes of sensor readings on-chain.',
    q3How: 'Enforces code reviews, automated linting, schema migrations, and honest UI copywriting before any feature is merged.',
    q4Analogy: 'The building code and safety regulations on a construction site that prevent cutting corners on foundational beams.',
    q5Connection: 'Governs every line of code written in Honey Chain.',
    codeSnippet: {
      language: 'markdown',
      description: 'Critical Rules Checklist',
      code: `Rule 8 (CRITICAL): Never claim blockchain proves honey purity.
  - Blockchain proves: record integrity and timestamp
  - Lab test proves: chemical purity and lack of adulteration

Rule 8b (CRITICAL): Never store bulk sensor readings on-chain.
  - Raw sensor data belongs in PostgreSQL / cold storage
  - Only Merkle root commitments touch the blockchain

Rule 11 (CRITICAL): Never claim AI output is medically certain.
  - Always state confidence level and recommend manual hive inspection.`
    }
  },
  {
    id: 'improve',
    filename: 'improve.md',
    title: 'Future Roadmap & Production Scaling',
    category: 'Process',
    badge: 'Post-Hackathon',
    summary: 'KVIC cluster rollout, LoRaWAN long-range telemetry, and direct automated lab spectrometer integration.',
    q1What: 'The architectural expansion plan for taking Honey Chain from a hackathon prototype to a nationwide pilot across thousands of KVIC Honey Mission clusters.',
    q2Why: 'Commercial beekeepers migrate across states chasing floral blooms; large cooperatives need automated high-throughput batching and integration with government beneficiary databases.',
    q3How: 'Adopting LoRaWAN gateways with 10km range for apiaries with no cellular reception; integrating NMR (Nuclear Magnetic Resonance) spectrometer APIs; and creating multi-stakeholder validator nodes.',
    q4Analogy: 'Upgrading a successful local farm stand into an interconnected agricultural cooperative network across the country.',
    q5Connection: 'Answers judge questions about "What happens after the hackathon? How does this scale to 50,000 beekeepers?"',
    codeSnippet: {
      language: 'markdown',
      description: 'Scalability Vectors',
      code: `1. LoRaWAN Gateways: Connect up to 100 hive nodes per solar-powered gateway over 10km radius.
2. Direct Lab Spectrometer Integration: Automated digital signature from Bruker NMR machines.
3. KVIC Beneficiary Registry API: Biometric linking with Udyam & PM-KISAN database.
4. Serialized Tamper-Resistant NFC Tags: Embedded under jar lid seals for instant tap-to-verify.`
    }
  },
  {
    id: 'demo',
    filename: 'demo.md',
    title: '6-Minute SIH Judge Walkthrough Script',
    category: 'Overview',
    badge: 'Demo Scenario',
    summary: 'The battle-tested script to present the Honey Chain prototype convincingly to Smart India Hackathon judges.',
    q1What: 'A structured, timed 6-minute presentation script demonstrating the problem, the beekeeper harvest, the lab certificate, the consumer QR scan, and the live tamper-detection moment.',
    q2Why: 'Judges see dozens of presentations. Having a clear narrative with a live, unscripted tamper demonstration proves the blockchain is doing a real job rather than being a buzzword.',
    q3How: 'Minute 1: The Adulteration Problem. Minute 2: Beekeeper harvest & IoT sensors. Minute 3: Lab certificate & blockchain anchoring. Minute 4: Judge scans the jar QR on their phone. Minute 5: Live database tamper test (shows instant fail). Minute 6: Admin dashboard & KVIC cluster impact.',
    q4Analogy: 'A magic show where the magician reveals the lock and key, invites a judge from the audience to inspect the lock, and proves it cannot be picked.',
    q5Connection: 'Integrates all components of the application into a memorable presentation.',
    codeSnippet: {
      language: 'markdown',
      description: 'The SIH Judge 6-Minute Sequence',
      code: `[00:00 - 01:00] THE PROBLEM: 70%+ honey adulterated. Honest beekeepers underpaid.
[01:00 - 02:00] THE HIVE: Ramesh logs harvest from Hive-01; IoT health check shown.
[02:00 - 03:00] THE LAB & CHAIN: Purity test attached; SHA-256 Merkle anchor sealed.
[03:00 - 04:00] CONSUMER SCAN: Judge opens QR on phone -> Full verified timeline.
[04:00 - 05:00] THE TAMPER MOMENT: Edit 24.5kg to 45kg in DB -> Verification turns RED.
[05:00 - 06:00] ADMIN & KVIC IMPACT: Cluster oversight, yield trends, wrap-up.`
    }
  }
];
