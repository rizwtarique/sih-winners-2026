/**
 * Honey Chain Types
 * Traceability and smart beekeeping platform data structures
 */

export type UserRole = 'beekeeper' | 'consumer' | 'lab' | 'admin';

export type AppView = UserRole | 'tamper-demo' | 'learning-hub' | 'apiary-map' | 'farmer-passport';

export interface FarmerProfile {
  id: string; // e.g. "KVIC-FARMER-8841"
  name: string;
  avatarUrl?: string;
  kvicRegistrationNumber: string; // e.g. "KVIC/HM/RAJ/2023/8841"
  aadhaarKycVerified: boolean;
  bankAccountLinked: boolean;
  village: string;
  tehsil: string;
  district: string;
  state: string;
  pincode: string;
  cooperativeName: string; // e.g. "Mewar Natural Honey Producers Cooperative"
  contactPhone: string; // public FPO liaison phone
  experienceYears: number;
  totalActiveColonies: number;
  beeSpecies: string[]; // e.g. ["Apis mellifera", "Apis cerana indica"]
  primaryFlora: string[]; // e.g. ["Wild Mustard", "Desert Flora", "Babul/Acacia"]
  certifications: string[]; // e.g. ["KVIC Honey Mission Certified", "Zero-Antibiotic Natural Practice", "Organic Traceable"]
  subsidyAwarded: string; // e.g. "10 Bee-boxes & Colony Kit under KVIC Honey Mission 2023"
  bio: string;
  qrToken: string;
  qrUrl: string;
  registeredDate: string;
  hiveIds: string[];
  batchIds: string[];
}

export type HiveStatus = 'healthy' | 'watch' | 'critical' | 'offline';

export type BatchStatus =
  | 'CREATED'
  | 'HARVESTED'
  | 'PROCESSING'
  | 'LAB_TESTED'
  | 'CERTIFIED'
  | 'PACKAGED'
  | 'DISPATCHED'
  | 'SOLD'
  | 'RECALLED';

export interface SensorReading {
  id: string;
  hiveId: string;
  timestamp: string;
  temperature: number; // in Celsius (safe normal 32 - 36°C)
  humidity: number; // in % (safe normal 50 - 65%)
  weightKg: number; // total hive weight in kg (35 - 55 kg)
  soundDb: number; // sound frequency / amplitude in dB (30 - 65 dB)
  source: 'SIMULATED' | 'REAL';
  seqNo: number;
}

export type TelemetryDateRange = '24h' | '7d' | '30d';

export interface TelemetryPoint {
  time: string; // e.g. "02:00", "Mon 08", "Sep 05", "Today"
  hour?: number; // 0-23
  date?: string; // e.g. "2026-09-12"
  fullLabel?: string; // descriptive tooltip label
  temperature: number; // in °C
  humidity: number; // in %
  weightKg: number; // in kg
  soundDb: number; // in dB
  ambientTemp?: number; // outside ambient temp in °C
  tempMin?: number;
  tempMax?: number;
  humidityMin?: number;
  humidityMax?: number;
  isThermalSpike?: boolean;
  isHumidityAlert?: boolean;
}

export type HourlyTelemetryPoint = TelemetryPoint;

export interface ActionableIntervention {
  title: string;
  priority: 'Immediate' | 'Preventative' | 'Observation';
  category: 'Ventilation' | 'Shade & Cooling' | 'Water Supply' | 'Nutrition' | 'Disease Inspection' | 'Space Management' | string;
  rationale: string;
  steps: string[];
}

export interface GeminiHiveHealthSummary {
  executiveSummary: string;
  thermodynamicAnalysis: string;
  humidityAndVentilation: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  homeostasisScore: number;
  actionableInterventions: ActionableIntervention[];
  recommendedInspectionWindow: string;
  modelUsed: string;
  hiveId: string;
  hiveCode: string;
  generatedAt: string;
  isModelEstimate: true;
}

export interface AIHealthAssessment {
  hiveId: string;
  status: HiveStatus;
  overallScore: number; // 0 - 100
  predictionHeadline: string;
  confidenceWord: 'High' | 'Medium' | 'Low';
  confidencePct: number;
  factors: {
    name: string;
    value: string;
    impact: 'positive' | 'neutral' | 'warning' | 'critical';
  }[];
  recommendedAction: string;
  lastUpdated: string;
  isModelEstimate: true; // Rule 11: Always disclose AI output uncertainty
}

export interface YieldPrediction {
  hiveId: string;
  estimatedNextHarvestKg: number;
  baselineHistoricalKg: number;
  method: 'Baseline Historical Average' | 'Multi-Factor Sensor Trend';
  confidenceWord: 'High' | 'Medium' | 'Low';
  factorsNoted: string[];
}

export interface Hive {
  id: string;
  hiveCode: string;
  apiaryName: string;
  location: string;
  queenYear: number;
  boxType: string;
  colonyCount: number;
  status: HiveStatus;
  lastSync: string;
  currentReading: SensorReading;
  healthAssessment: AIHealthAssessment;
  yieldPrediction: YieldPrediction;
  hourlyHistory24h?: HourlyTelemetryPoint[];
  coordinates?: {
    lat: number;
    lng: number;
    elevationMeters?: number;
  };
  gridPosition?: {
    row: number;
    col: number;
    zone: string;
    plotCode: string;
    orientation?: string;
    shadeCover?: 'Full Sun' | 'Partial Shade' | 'Canopy Cover';
  };
}

export interface LabTestParameters {
  moisturePct: number; // Standard <= 20%
  hmfMgKg: number; // Hydroxymethylfurfural <= 40-80 mg/kg
  fructoseGlucoseRatio: number; // Standard > 0.95
  sucrosePct: number; // Standard <= 5%
  pollenCountPerGram: number; // E.g. > 20,000
  c4SugarAdulteration: 'Negative' | 'Positive'; // C4 syrup detection
  antibioticResidue: 'None Detected' | 'Detected';
  overallResult: 'PASS' | 'FAIL';
}

export interface QualityCertificate {
  id: string;
  certificateNumber: string;
  batchId: string;
  labName: string;
  accreditationNumber: string;
  analystName: string;
  issuedAt: string;
  standardName: string; // e.g. "FSSAI Food Safety and Standards (Honey) / ISO 17025"
  parameters: LabTestParameters;
  documentHash: string; // SHA-256 of lab certificate PDF
  status: 'VALID' | 'REVOKED';
}

export interface ProcessingEvent {
  id: string;
  eventType: string;
  title: string;
  occurredAt: string;
  actorName: string;
  actorRole: string;
  location: string;
  details: string;
  eventHash: string;
  iconName: string;
}

export interface BlockchainRecord {
  contractAddress: string;
  network: string;
  chainId: number;
  batchCodeHash: string;
  commitmentHash: string;
  merkleRoot: string;
  leafIndex: number;
  txHash: string;
  blockNumber: number;
  anchoredAt: string;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED';
  verificationStatus: 'VERIFIED' | 'TAMPER_DETECTED' | 'NOT_ANCHORED';
}

export interface HoneyBatch {
  id: string;
  batchCode: string; // e.g. "HC-2026-0142"
  hiveId: string;
  hiveCode: string;
  apiaryLocation: string;
  farmerId?: string;
  farmer?: FarmerProfile;
  beekeeperName: string;
  beekeeperPhone: string; // Kept private, only district shown publicly
  district: string;
  state: string;
  honeyType: string; // e.g. "Mustard Blossom", "Wild Acacia", "Eucalyptus Multi-flora"
  grossWeightKg: number;
  netWeightKg: number;
  framesHarvested: number;
  harvestDate: string;
  packagingDate: string;
  status: BatchStatus;
  qrToken: string;
  qrUrl: string;
  events: ProcessingEvent[];
  certificate?: QualityCertificate;
  blockchainRecord?: BlockchainRecord;
  // Tamper state for demo
  isTampered?: boolean;
  tamperedField?: string;
  originalValues?: {
    netWeightKg: number;
    harvestDate: string;
    honeyType: string;
    moisturePct?: number;
  };
}

export interface AlertItem {
  id: string;
  type: 'sensor_anomaly' | 'sensor_silent' | 'chain_anchor_failed' | 'tamper_detected' | 'harvest_due';
  severity: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  hiveId?: string;
  batchCode?: string;
  timestamp: string;
  isRead: boolean;
  recommendedAction: string;
}

export interface LearningTopic {
  id: string;
  filename: string;
  title: string;
  category: 'Overview' | 'Engineering' | 'Hardware & IoT' | 'AI & Analytics' | 'Quality & Security' | 'Process';
  badge: string;
  summary: string;
  q1What: string;
  q2Why: string;
  q3How: string;
  q4Analogy: string;
  q5Connection: string;
  codeSnippet?: {
    language: string;
    code: string;
    description: string;
  };
}
