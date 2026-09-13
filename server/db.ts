import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Hive, HoneyBatch, AlertItem, FarmerProfile, QualityCertificate, SensorReading, BatchStatus } from '../src/types';
import { INITIAL_HIVES, INITIAL_BATCHES, INITIAL_ALERTS, MOCK_FARMERS } from '../src/data/mockData';

const DATA_DIR = path.join(process.cwd(), 'data');
const SQLITE_FILE = path.join(DATA_DIR, 'honeychain.sqlite');
const JSON_FILE = path.join(DATA_DIR, 'honeychain_store.json');

let dbEngine: 'sqlite' | 'json' = 'json';
let sqliteInstance: any = null;

// In-memory cache for ultra-fast reads, backed by SQLite / JSON disk persistence
interface DbState {
  hives: Map<string, Hive>;
  batches: Map<string, HoneyBatch>;
  farmers: Map<string, FarmerProfile>;
  alerts: Map<string, AlertItem>;
  meta: {
    latestBlockNumber: number;
    chainId: number;
    network: string;
    contractAddress: string;
  };
}

const memoryState: DbState = {
  hives: new Map(),
  batches: new Map(),
  farmers: new Map(),
  alerts: new Map(),
  meta: {
    latestBlockNumber: 19842109,
    chainId: 80002,
    network: 'Polygon Amoy Proof-of-Stake (EVM)',
    contractAddress: '0x71C2d67F0598822384a51A7d9D04BFe44A895F31',
  },
};

/**
 * Compute SHA-256 hash using native Node/Bun crypto
 */
export function computeSha256(data: string | object): string {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return '0x' + crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Compute batch commitment hash matching the Honey Chain cryptographic specification
 */
export function computeBatchCommitmentHashServer(batch: Partial<HoneyBatch>, cert?: QualityCertificate): string {
  const payload = {
    batchCode: batch.batchCode || '',
    hiveCode: batch.hiveCode || '',
    beekeeperName: batch.beekeeperName || '',
    district: batch.district || '',
    honeyType: batch.honeyType || '',
    netWeightKg: batch.netWeightKg || 0,
    harvestDate: batch.harvestDate || '',
    moisturePct: batch.moisturePct || 0,
    labCertificateHash: cert ? cert.documentHash || cert.id : null,
    labOverallResult: cert ? cert.parameters?.overallResult : null,
    labHmf: cert ? cert.parameters?.hmfMgKg : null,
    labC4Sugar: cert ? cert.parameters?.c4SugarAdulteration : null,
  };
  return computeSha256(payload);
}

/**
 * Persist memory state to SQLite database
 */
function persistToSqlite() {
  if (!sqliteInstance) return;
  try {
    const saveHives = sqliteInstance.transaction((hivesList: Hive[]) => {
      sqliteInstance.run('DELETE FROM hives');
      const stmt = sqliteInstance.prepare('INSERT INTO hives (id, hiveCode, data, updated_at) VALUES (?, ?, ?, ?)');
      for (const h of hivesList) {
        stmt.run(h.id, h.hiveCode, JSON.stringify(h), new Date().toISOString());
      }
    });

    const saveBatches = sqliteInstance.transaction((batchesList: HoneyBatch[]) => {
      sqliteInstance.run('DELETE FROM batches');
      const stmt = sqliteInstance.prepare('INSERT INTO batches (id, batchCode, qrToken, data, updated_at) VALUES (?, ?, ?, ?, ?)');
      for (const b of batchesList) {
        stmt.run(b.id, b.batchCode, b.qrToken, JSON.stringify(b), new Date().toISOString());
      }
    });

    const saveFarmers = sqliteInstance.transaction((farmersList: FarmerProfile[]) => {
      sqliteInstance.run('DELETE FROM farmers');
      const stmt = sqliteInstance.prepare('INSERT INTO farmers (id, regNo, data, updated_at) VALUES (?, ?, ?, ?)');
      for (const f of farmersList) {
        stmt.run(f.id, f.kvicRegistrationNumber, JSON.stringify(f), new Date().toISOString());
      }
    });

    const saveAlerts = sqliteInstance.transaction((alertsList: AlertItem[]) => {
      sqliteInstance.run('DELETE FROM alerts');
      const stmt = sqliteInstance.prepare('INSERT INTO alerts (id, type, isRead, data, created_at) VALUES (?, ?, ?, ?, ?)');
      for (const a of alertsList) {
        stmt.run(a.id, a.type, a.isRead ? 1 : 0, JSON.stringify(a), a.timestamp || new Date().toISOString());
      }
    });

    saveHives(Array.from(memoryState.hives.values()));
    saveBatches(Array.from(memoryState.batches.values()));
    saveFarmers(Array.from(memoryState.farmers.values()));
    saveAlerts(Array.from(memoryState.alerts.values()));

    sqliteInstance.run(
      'INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)',
      'state',
      JSON.stringify(memoryState.meta)
    );
  } catch (err) {
    console.error('[DB] Error persisting to SQLite, syncing to JSON fallback:', err);
    persistToJson();
  }
}

/**
 * Persist memory state to JSON file using atomic file write (write to temp then rename)
 */
function persistToJson() {
  try {
    const payload = {
      hives: Array.from(memoryState.hives.values()),
      batches: Array.from(memoryState.batches.values()),
      farmers: Array.from(memoryState.farmers.values()),
      alerts: Array.from(memoryState.alerts.values()),
      meta: memoryState.meta,
      savedAt: new Date().toISOString(),
    };

    const tempFile = `${JSON_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(payload, null, 2), 'utf-8');
    fs.renameSync(tempFile, JSON_FILE);
  } catch (err) {
    console.error('[DB] Error writing JSON persistence file:', err);
  }
}

/**
 * Synchronous disk flush
 */
function flushDb() {
  if (dbEngine === 'sqlite') {
    persistToSqlite();
  }
  // Always keep JSON mirror for maximum durability and inspectability
  persistToJson();
}

/**
 * Initialize the database, checking for bun:sqlite and seeding initial data if empty
 */
export async function initDatabase(): Promise<void> {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Attempt SQLite initialization
  try {
    // @ts-ignore
    const bunSqlite = await import('bun:sqlite');
    const Database = bunSqlite.Database;
    sqliteInstance = new Database(SQLITE_FILE);
    sqliteInstance.run('PRAGMA journal_mode = WAL;');
    sqliteInstance.run('PRAGMA synchronous = NORMAL;');

    sqliteInstance.run(`
      CREATE TABLE IF NOT EXISTS hives (
        id TEXT PRIMARY KEY,
        hiveCode TEXT,
        data TEXT,
        updated_at TEXT
      );
    `);
    sqliteInstance.run(`
      CREATE TABLE IF NOT EXISTS batches (
        id TEXT PRIMARY KEY,
        batchCode TEXT,
        qrToken TEXT,
        data TEXT,
        updated_at TEXT
      );
    `);
    sqliteInstance.run(`
      CREATE TABLE IF NOT EXISTS farmers (
        id TEXT PRIMARY KEY,
        regNo TEXT,
        data TEXT,
        updated_at TEXT
      );
    `);
    sqliteInstance.run(`
      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        type TEXT,
        isRead INTEGER,
        data TEXT,
        created_at TEXT
      );
    `);
    sqliteInstance.run(`
      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);

    dbEngine = 'sqlite';
    console.log(`[DB] Successfully initialized native SQLite persistence with WAL mode at ${SQLITE_FILE}`);

    // Load existing records from SQLite
    const hiveRows = sqliteInstance.query('SELECT data FROM hives').all() as { data: string }[];
    const batchRows = sqliteInstance.query('SELECT data FROM batches').all() as { data: string }[];
    const farmerRows = sqliteInstance.query('SELECT data FROM farmers').all() as { data: string }[];
    const alertRows = sqliteInstance.query('SELECT data FROM alerts').all() as { data: string }[];
    const metaRow = sqliteInstance.query('SELECT value FROM meta WHERE key = "state"').get() as { value: string } | null;

    if (batchRows.length > 0 && hiveRows.length > 0) {
      for (const row of hiveRows) {
        const h = JSON.parse(row.data) as Hive;
        memoryState.hives.set(h.id, h);
      }
      for (const row of batchRows) {
        const b = JSON.parse(row.data) as HoneyBatch;
        memoryState.batches.set(b.id, b);
      }
      for (const row of farmerRows) {
        const f = JSON.parse(row.data) as FarmerProfile;
        memoryState.farmers.set(f.id, f);
      }
      for (const row of alertRows) {
        const a = JSON.parse(row.data) as AlertItem;
        memoryState.alerts.set(a.id, a);
      }
      if (metaRow) {
        memoryState.meta = JSON.parse(metaRow.value);
      }
      console.log(`[DB] Restored state from SQLite: ${memoryState.batches.size} batches, ${memoryState.hives.size} hives, ${memoryState.farmers.size} farmers, ${memoryState.alerts.size} alerts.`);
      return;
    }
  } catch (err: any) {
    console.warn(`[DB] bun:sqlite not active (${err.message}). Using atomic JSON file persistence at ${JSON_FILE}`);
    dbEngine = 'json';
  }

  // Check JSON file if SQLite was empty or unavailable
  if (fs.existsSync(JSON_FILE)) {
    try {
      const content = fs.readFileSync(JSON_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.batches && parsed.batches.length > 0) {
        for (const h of parsed.hives || []) memoryState.hives.set(h.id, h);
        for (const b of parsed.batches || []) memoryState.batches.set(b.id, b);
        for (const f of parsed.farmers || []) memoryState.farmers.set(f.id, f);
        for (const a of parsed.alerts || []) memoryState.alerts.set(a.id, a);
        if (parsed.meta) memoryState.meta = parsed.meta;

        console.log(`[DB] Restored state from JSON store: ${memoryState.batches.size} batches, ${memoryState.hives.size} hives.`);
        flushDb();
        return;
      }
    } catch (e) {
      console.warn('[DB] Could not parse existing JSON store, re-seeding initial data...');
    }
  }

  // Seed default pristine datasets
  seedDefaultData();
  flushDb();
}

/**
 * Seed initial pristine data from mockData
 */
export function seedDefaultData(): void {
  memoryState.hives.clear();
  memoryState.batches.clear();
  memoryState.farmers.clear();
  memoryState.alerts.clear();

  for (const hive of INITIAL_HIVES) {
    memoryState.hives.set(hive.id, JSON.parse(JSON.stringify(hive)));
  }

  for (const batch of INITIAL_BATCHES) {
    const copy: HoneyBatch = JSON.parse(JSON.stringify(batch));
    if (copy.blockchainRecord && !copy.blockchainRecord.commitmentHash) {
      copy.blockchainRecord.commitmentHash = computeBatchCommitmentHashServer(copy, copy.certificate);
    }
    memoryState.batches.set(copy.id, copy);
  }

  for (const farmer of MOCK_FARMERS) {
    memoryState.farmers.set(farmer.id, JSON.parse(JSON.stringify(farmer)));
  }

  for (const alert of INITIAL_ALERTS) {
    memoryState.alerts.set(alert.id, JSON.parse(JSON.stringify(alert)));
  }

  memoryState.meta = {
    latestBlockNumber: 19842109,
    chainId: 80002,
    network: 'Polygon Amoy Proof-of-Stake (EVM)',
    contractAddress: '0x71C2d67F0598822384a51A7d9D04BFe44A895F31',
  };

  console.log(`[DB] Seeded initial datasets: ${memoryState.batches.size} batches, ${memoryState.hives.size} hives, ${memoryState.farmers.size} farmers, ${memoryState.alerts.size} alerts.`);
}

/**
 * Get engine metadata
 */
export function getDbStats() {
  return {
    engine: dbEngine,
    dataFile: dbEngine === 'sqlite' ? SQLITE_FILE : JSON_FILE,
    mirrorFile: JSON_FILE,
    hiveCount: memoryState.hives.size,
    batchCount: memoryState.batches.size,
    farmerCount: memoryState.farmers.size,
    alertCount: memoryState.alerts.size,
    latestBlockNumber: memoryState.meta.latestBlockNumber,
  };
}

// ----------------------------------------------------------------------
// HIVES API
// ----------------------------------------------------------------------

export function getAllHives(): Hive[] {
  return Array.from(memoryState.hives.values());
}

export function getHiveById(idOrCode: string): Hive | undefined {
  const clean = idOrCode.toLowerCase();
  for (const h of memoryState.hives.values()) {
    if (h.id.toLowerCase() === clean || h.hiveCode.toLowerCase() === clean) {
      return h;
    }
  }
  return undefined;
}

export function updateHiveTelemetry(
  idOrCode: string,
  partialReading: Partial<SensorReading>
): Hive | undefined {
  const hive = getHiveById(idOrCode);
  if (!hive) return undefined;

  const current = hive.currentReading;
  hive.currentReading = {
    ...current,
    ...partialReading,
    seqNo: (current.seqNo || 0) + 1,
    timestamp: new Date().toISOString(),
  };
  hive.lastSync = 'Just now (MQTT QoS 1)';
  flushDb();
  return hive;
}

// ----------------------------------------------------------------------
// BATCHES API
// ----------------------------------------------------------------------

export function getAllBatches(): HoneyBatch[] {
  return Array.from(memoryState.batches.values());
}

export function getBatchById(idOrCodeOrToken: string): HoneyBatch | undefined {
  const clean = idOrCodeOrToken.toLowerCase();
  for (const b of memoryState.batches.values()) {
    if (
      b.id.toLowerCase() === clean ||
      b.batchCode.toLowerCase() === clean ||
      b.qrToken.toLowerCase() === clean
    ) {
      return b;
    }
  }
  return undefined;
}

export function createBatch(data: Partial<HoneyBatch>): HoneyBatch {
  const count = memoryState.batches.size + 1;
  const seq = 100 + count;
  const batchCode = data.batchCode || `HC-2026-01${seq}`;
  const id = data.id || `batch-${Date.now()}`;
  const hives = getAllHives();
  const defaultHive = hives[0];

  const newBatch: HoneyBatch = {
    id,
    batchCode,
    hiveId: data.hiveId || defaultHive.id,
    hiveCode: data.hiveCode || defaultHive.hiveCode,
    apiaryLocation: data.apiaryLocation || defaultHive.apiaryName,
    beekeeperName: data.beekeeperName || 'Rameshwar Lal Gurjar',
    beekeeperPhone: data.beekeeperPhone || '+91 98290 XXXXX',
    district: data.district || 'Bhilwara',
    state: data.state || 'Rajasthan',
    honeyType: data.honeyType || 'Wild Mustard',
    grossWeightKg: data.grossWeightKg || 24.5,
    netWeightKg: data.netWeightKg || 22.0,
    framesHarvested: data.framesHarvested || 8,
    harvestDate: data.harvestDate || new Date().toISOString().split('T')[0],
    packagingDate: data.packagingDate || 'Pending Processing',
    status: (data.status as BatchStatus) || 'HARVESTED',
    moisturePct: data.moisturePct !== undefined ? Number(data.moisturePct) : 18.2,
    processingNotes: data.processingNotes || '',
    qrToken: data.qrToken || `hc_tok_${Date.now().toString(36)}`,
    qrUrl: data.qrUrl || `https://honeychain.org/verify/${batchCode}`,
    events: data.events || [
      {
        id: `ev-harv-${Date.now()}`,
        eventType: 'HARVEST',
        title: 'Honey Harvest Recorded at Apiary',
        occurredAt: new Date().toLocaleString(),
        actorName: data.beekeeperName || 'Rameshwar Lal Gurjar',
        actorRole: 'Registered Beekeeper',
        location: data.apiaryLocation || defaultHive.apiaryName,
        details: `Harvested ${data.netWeightKg || 22.0} kg raw honey from ${data.hiveCode || defaultHive.hiveCode}. Moisture content: ${data.moisturePct || 18.2}%.`,
        eventHash: computeSha256({ batchCode, harvestDate: data.harvestDate }),
        iconName: 'Package',
      },
    ],
    originalValues: {
      netWeightKg: data.netWeightKg || 22.0,
      harvestDate: data.harvestDate || new Date().toISOString().split('T')[0],
      honeyType: data.honeyType || 'Wild Mustard',
      moisturePct: data.moisturePct !== undefined ? Number(data.moisturePct) : 18.2,
    },
  };

  memoryState.batches.set(newBatch.id, newBatch);

  // Auto-generate system alert for the new harvest
  const alertId = `alt-${Date.now()}`;
  memoryState.alerts.set(alertId, {
    id: alertId,
    type: 'harvest_due',
    severity: 'info',
    title: `New Harvest Logged (${batchCode})`,
    message: `Harvest of ${newBatch.netWeightKg} kg recorded from ${newBatch.hiveCode}. Pending lab sample testing.`,
    batchCode,
    timestamp: 'Just now',
    isRead: false,
    recommendedAction: 'Dispatch sample bottles to NABL accredited testing laboratory.',
  });

  flushDb();
  return newBatch;
}

export function updateBatch(
  id: string,
  updates: Partial<HoneyBatch>,
  isTamperedFlag?: boolean
): HoneyBatch | undefined {
  const batch = getBatchById(id);
  if (!batch) return undefined;

  Object.assign(batch, updates);
  if (isTamperedFlag !== undefined) {
    batch.isTampered = isTamperedFlag;
  }
  flushDb();
  return batch;
}

export function certifyBatch(
  batchId: string,
  cert: QualityCertificate,
  blockNumberOverride?: number
): HoneyBatch | undefined {
  const batch = getBatchById(batchId);
  if (!batch) return undefined;

  const isPassed = cert.parameters.overallResult === 'PASS' && cert.parameters.c4SugarAdulteration !== 'Positive';
  const batchStatus: BatchStatus = isPassed ? 'CERTIFIED' : 'FAILED';
  const hash = computeBatchCommitmentHashServer(batch, cert);
  const txHash = '0x' + crypto.randomBytes(32).toString('hex');
  const blockNum = blockNumberOverride || ++memoryState.meta.latestBlockNumber;

  batch.status = batchStatus;
  batch.certificate = cert;
  batch.blockchainRecord = {
    contractAddress: memoryState.meta.contractAddress,
    network: memoryState.meta.network,
    chainId: memoryState.meta.chainId,
    batchCodeHash: computeSha256(batch.batchCode),
    commitmentHash: hash,
    merkleRoot: '0x' + crypto.randomBytes(32).toString('hex'),
    leafIndex: 2,
    txHash,
    blockNumber: blockNum,
    anchoredAt: new Date().toISOString(),
    status: 'CONFIRMED',
    verificationStatus: isPassed ? 'VERIFIED' : 'TAMPER_DETECTED',
  };

  batch.events.push({
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
  });

  flushDb();
  return batch;
}

export function anchorBatch(
  batchId: string,
  blockNumberOverride?: number
): HoneyBatch | undefined {
  const batch = getBatchById(batchId);
  if (!batch) return undefined;

  const hash = computeBatchCommitmentHashServer(batch, batch.certificate);
  const txHash = '0x' + crypto.randomBytes(32).toString('hex');
  const blockNum = blockNumberOverride || ++memoryState.meta.latestBlockNumber;

  batch.blockchainRecord = {
    contractAddress: memoryState.meta.contractAddress,
    network: memoryState.meta.network,
    chainId: memoryState.meta.chainId,
    batchCodeHash: computeSha256(batch.batchCode),
    commitmentHash: hash,
    merkleRoot: '0x' + crypto.randomBytes(32).toString('hex'),
    leafIndex: 0,
    txHash,
    blockNumber: blockNum,
    anchoredAt: new Date().toISOString(),
    status: 'CONFIRMED',
    verificationStatus: 'VERIFIED',
  };

  batch.events.push({
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
  });

  flushDb();
  return batch;
}

export function toggleTamper(batchId: string, shouldTamper: boolean): HoneyBatch | undefined {
  const batch = getBatchById(batchId);
  if (!batch) return undefined;

  if (shouldTamper) {
    if (!batch.originalValues) {
      batch.originalValues = {
        netWeightKg: batch.netWeightKg,
        harvestDate: batch.harvestDate,
        honeyType: batch.honeyType,
        moisturePct: batch.moisturePct,
      };
    }
    batch.isTampered = true;
    batch.netWeightKg = 42.0;
    batch.harvestDate = '2026-08-01';
    batch.honeyType = 'Adulterated Syrup Blend (Tampered in DB)';
  } else {
    batch.isTampered = false;
    if (batch.originalValues) {
      batch.netWeightKg = batch.originalValues.netWeightKg;
      batch.harvestDate = batch.originalValues.harvestDate;
      batch.honeyType = batch.originalValues.honeyType;
      if (batch.originalValues.moisturePct !== undefined) {
        batch.moisturePct = batch.originalValues.moisturePct;
      }
    }
  }

  flushDb();
  return batch;
}

// ----------------------------------------------------------------------
// FARMERS API
// ----------------------------------------------------------------------

export function getAllFarmers(): FarmerProfile[] {
  return Array.from(memoryState.farmers.values());
}

export function getFarmerById(id: string): FarmerProfile | undefined {
  const clean = id.toLowerCase();
  for (const f of memoryState.farmers.values()) {
    if (
      f.id.toLowerCase() === clean ||
      f.kvicRegistrationNumber.toLowerCase() === clean ||
      f.name.toLowerCase().includes(clean)
    ) {
      return f;
    }
  }
  return undefined;
}

// ----------------------------------------------------------------------
// ALERTS API
// ----------------------------------------------------------------------

export function getAllAlerts(): AlertItem[] {
  return Array.from(memoryState.alerts.values());
}

export function createAlert(alert: Partial<AlertItem>): AlertItem {
  const id = alert.id || `alt-${Date.now()}`;
  const item: AlertItem = {
    id,
    type: alert.type || 'sensor_anomaly',
    severity: alert.severity || 'info',
    title: alert.title || 'System Notification',
    message: alert.message || '',
    hiveId: alert.hiveId,
    batchCode: alert.batchCode,
    timestamp: alert.timestamp || 'Just now',
    isRead: false,
    recommendedAction: alert.recommendedAction || 'Review colony status in dashboard.',
  };
  memoryState.alerts.set(id, item);
  flushDb();
  return item;
}

export function markAlertRead(id: string): boolean {
  const alert = memoryState.alerts.get(id);
  if (!alert) return false;
  alert.isRead = true;
  flushDb();
  return true;
}

// ----------------------------------------------------------------------
// BLOCKCHAIN & RESET API
// ----------------------------------------------------------------------

export function getBlockchainStats() {
  return {
    ...memoryState.meta,
  };
}

export function incrementBlockNumber(): number {
  memoryState.meta.latestBlockNumber++;
  flushDb();
  return memoryState.meta.latestBlockNumber;
}

export function resetDatabase(): void {
  seedDefaultData();
  flushDb();
}
