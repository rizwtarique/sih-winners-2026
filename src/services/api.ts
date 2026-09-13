/**
 * Honey Chain Resilient API Client
 * Provides type-safe communication with the Honey Chain backend server.
 * Implements graceful offline fallback to keep the web application stable always.
 */

import { Hive, HoneyBatch, AlertItem, FarmerProfile, QualityCertificate, SensorReading } from '../types';
import { INITIAL_HIVES, INITIAL_BATCHES, INITIAL_ALERTS, MOCK_FARMERS } from '../data/mockData';

const BASE_URL = '/api';

// Local memory and localStorage fallback cache
const CACHE_KEYS = {
  HIVES: 'honeychain_cache_hives',
  BATCHES: 'honeychain_cache_batches',
  FARMERS: 'honeychain_cache_farmers',
  ALERTS: 'honeychain_cache_alerts',
  BLOCK: 'honeychain_cache_block',
};

function getLocalCache<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // Ignore storage issues
  }
  return fallback;
}

function setLocalCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // Ignore storage quota issues
  }
}

async function request<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API ${res.status}: ${errText}`);
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (error) {
    console.warn(`[HoneyChain API Warning] Request to ${url} failed; using resilient fallback:`, error);
    if (fallback !== undefined) {
      return fallback;
    }
    throw error;
  }
}

export const api = {
  // ----------------------------------------------------------------------
  // HIVES
  // ----------------------------------------------------------------------
  async getHives(): Promise<Hive[]> {
    const cached = getLocalCache<Hive[]>(CACHE_KEYS.HIVES, INITIAL_HIVES);
    try {
      const data = await request<Hive[]>(`${BASE_URL}/hives`, { method: 'GET' }, cached);
      if (data && data.length > 0) {
        setLocalCache(CACHE_KEYS.HIVES, data);
        return data;
      }
    } catch (e) {
      // Fall through to cached
    }
    return cached;
  },

  async getHiveById(id: string): Promise<Hive | undefined> {
    const hives = await this.getHives();
    return hives.find((h) => h.id === id || h.hiveCode === id);
  },

  async updateHiveTelemetry(id: string, reading: Partial<SensorReading>): Promise<Hive | undefined> {
    try {
      const updated = await request<Hive>(`${BASE_URL}/hives/${encodeURIComponent(id)}/telemetry`, {
        method: 'PATCH',
        body: JSON.stringify(reading),
      });
      return updated;
    } catch (e) {
      return undefined;
    }
  },

  // ----------------------------------------------------------------------
  // HONEY BATCHES
  // ----------------------------------------------------------------------
  async getBatches(): Promise<HoneyBatch[]> {
    const cached = getLocalCache<HoneyBatch[]>(CACHE_KEYS.BATCHES, INITIAL_BATCHES);
    try {
      const data = await request<HoneyBatch[]>(`${BASE_URL}/batches`, { method: 'GET' }, cached);
      if (data && data.length > 0) {
        setLocalCache(CACHE_KEYS.BATCHES, data);
        return data;
      }
    } catch (e) {
      // Fall through
    }
    return cached;
  },

  async getBatchById(idOrCodeOrToken: string): Promise<HoneyBatch | undefined> {
    try {
      const batch = await request<HoneyBatch>(`${BASE_URL}/batches/${encodeURIComponent(idOrCodeOrToken)}`, {
        method: 'GET',
      });
      if (batch) return batch;
    } catch (e) {
      // Search local cache
    }
    const list = await this.getBatches();
    const clean = idOrCodeOrToken.toLowerCase();
    return list.find(
      (b) =>
        b.id.toLowerCase() === clean ||
        b.batchCode.toLowerCase() === clean ||
        b.qrToken.toLowerCase() === clean
    );
  },

  async createBatch(batchData: Partial<HoneyBatch>): Promise<HoneyBatch> {
    try {
      const newBatch = await request<HoneyBatch>(`${BASE_URL}/batches`, {
        method: 'POST',
        body: JSON.stringify(batchData),
      });
      const current = await this.getBatches();
      setLocalCache(CACHE_KEYS.BATCHES, [newBatch, ...current.filter((b) => b.id !== newBatch.id)]);
      return newBatch;
    } catch (e) {
      // Local fallback creation
      const seq = 100 + Math.floor(Math.random() * 800);
      const batchCode = batchData.batchCode || `HC-2026-01${seq}`;
      const id = batchData.id || `batch-${Date.now()}`;
      const fallbackBatch: HoneyBatch = {
        id,
        batchCode,
        hiveId: batchData.hiveId || 'hive-01',
        hiveCode: batchData.hiveCode || 'HIVE-RAJ-01',
        apiaryLocation: batchData.apiaryLocation || 'Bhilwara, Rajasthan',
        beekeeperName: 'Rameshwar Lal Gurjar',
        beekeeperPhone: '+91 98290 XXXXX',
        district: batchData.district || 'Bhilwara',
        state: batchData.state || 'Rajasthan',
        honeyType: batchData.honeyType || 'Wild Mustard',
        grossWeightKg: batchData.grossWeightKg || 24.5,
        netWeightKg: batchData.netWeightKg || 22.0,
        framesHarvested: batchData.framesHarvested || 8,
        harvestDate: batchData.harvestDate || new Date().toISOString().split('T')[0],
        packagingDate: 'Pending Processing',
        status: 'HARVESTED',
        moisturePct: batchData.moisturePct !== undefined ? Number(batchData.moisturePct) : 18.2,
        processingNotes: batchData.processingNotes || '',
        qrToken: `hc_tok_${Date.now().toString(36)}`,
        qrUrl: `https://honeychain.org/verify/${batchCode}`,
        events: batchData.events || [],
        originalValues: {
          netWeightKg: batchData.netWeightKg || 22.0,
          harvestDate: batchData.harvestDate || new Date().toISOString().split('T')[0],
          honeyType: batchData.honeyType || 'Wild Mustard',
          moisturePct: batchData.moisturePct !== undefined ? Number(batchData.moisturePct) : 18.2,
        },
      };
      const current = await this.getBatches();
      setLocalCache(CACHE_KEYS.BATCHES, [fallbackBatch, ...current]);
      return fallbackBatch;
    }
  },

  async updateBatch(id: string, updates: Partial<HoneyBatch>, isTampered?: boolean): Promise<HoneyBatch | undefined> {
    try {
      const updated = await request<HoneyBatch>(`${BASE_URL}/batches/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ updates, isTampered }),
      });
      const current = await this.getBatches();
      setLocalCache(CACHE_KEYS.BATCHES, current.map((b) => (b.id === id ? updated : b)));
      return updated;
    } catch (e) {
      return undefined;
    }
  },

  async certifyBatch(batchId: string, cert: QualityCertificate, blockNumber?: number): Promise<HoneyBatch | undefined> {
    try {
      const updated = await request<HoneyBatch>(`${BASE_URL}/batches/${encodeURIComponent(batchId)}/certify`, {
        method: 'POST',
        body: JSON.stringify({ certificate: cert, blockNumber }),
      });
      const current = await this.getBatches();
      setLocalCache(CACHE_KEYS.BATCHES, current.map((b) => (b.id === batchId ? updated : b)));
      return updated;
    } catch (e) {
      return undefined;
    }
  },

  async anchorBatch(batchId: string, blockNumber?: number): Promise<HoneyBatch | undefined> {
    try {
      const updated = await request<HoneyBatch>(`${BASE_URL}/batches/${encodeURIComponent(batchId)}/anchor`, {
        method: 'POST',
        body: JSON.stringify({ blockNumber }),
      });
      const current = await this.getBatches();
      setLocalCache(CACHE_KEYS.BATCHES, current.map((b) => (b.id === batchId ? updated : b)));
      return updated;
    } catch (e) {
      return undefined;
    }
  },

  async toggleTamper(batchId: string, shouldTamper: boolean): Promise<HoneyBatch | undefined> {
    try {
      const updated = await request<HoneyBatch>(`${BASE_URL}/batches/${encodeURIComponent(batchId)}/tamper`, {
        method: 'POST',
        body: JSON.stringify({ shouldTamper }),
      });
      const current = await this.getBatches();
      setLocalCache(CACHE_KEYS.BATCHES, current.map((b) => (b.id === batchId ? updated : b)));
      return updated;
    } catch (e) {
      return undefined;
    }
  },

  // ----------------------------------------------------------------------
  // FARMER PROFILES
  // ----------------------------------------------------------------------
  async getFarmers(): Promise<FarmerProfile[]> {
    const cached = getLocalCache<FarmerProfile[]>(CACHE_KEYS.FARMERS, MOCK_FARMERS);
    try {
      const data = await request<FarmerProfile[]>(`${BASE_URL}/farmers`, { method: 'GET' }, cached);
      if (data && data.length > 0) {
        setLocalCache(CACHE_KEYS.FARMERS, data);
        return data;
      }
    } catch (e) {
      // Fall through
    }
    return cached;
  },

  // ----------------------------------------------------------------------
  // ALERTS
  // ----------------------------------------------------------------------
  async getAlerts(): Promise<AlertItem[]> {
    const cached = getLocalCache<AlertItem[]>(CACHE_KEYS.ALERTS, INITIAL_ALERTS);
    try {
      const data = await request<AlertItem[]>(`${BASE_URL}/alerts`, { method: 'GET' }, cached);
      if (data && data.length > 0) {
        setLocalCache(CACHE_KEYS.ALERTS, data);
        return data;
      }
    } catch (e) {
      // Fall through
    }
    return cached;
  },

  async createAlert(alert: Partial<AlertItem>): Promise<AlertItem | undefined> {
    try {
      const item = await request<AlertItem>(`${BASE_URL}/alerts`, {
        method: 'POST',
        body: JSON.stringify(alert),
      });
      const current = await this.getAlerts();
      setLocalCache(CACHE_KEYS.ALERTS, [item, ...current]);
      return item;
    } catch (e) {
      return undefined;
    }
  },

  async markAlertRead(id: string): Promise<boolean> {
    try {
      await request(`${BASE_URL}/alerts/${encodeURIComponent(id)}/read`, { method: 'PATCH' });
      const current = await this.getAlerts();
      setLocalCache(CACHE_KEYS.ALERTS, current.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
      return true;
    } catch (e) {
      return false;
    }
  },

  // ----------------------------------------------------------------------
  // BLOCKCHAIN
  // ----------------------------------------------------------------------
  async getBlockchainStats(): Promise<{ latestBlockNumber: number; chainId: number; network: string; contractAddress: string }> {
    const fallback = {
      latestBlockNumber: 19842109,
      chainId: 80002,
      network: 'Polygon Amoy Proof-of-Stake (EVM)',
      contractAddress: '0x71C2d67F0598822384a51A7d9D04BFe44A895F31',
    };
    try {
      return await request(`${BASE_URL}/blockchain/stats`, { method: 'GET' }, fallback);
    } catch (e) {
      return fallback;
    }
  },

  async tickBlock(): Promise<number> {
    try {
      const res = await request<{ latestBlockNumber: number }>(`${BASE_URL}/blockchain/tick`, { method: 'POST' });
      return res.latestBlockNumber;
    } catch (e) {
      return 19842109;
    }
  },

  async resetDemoData(): Promise<void> {
    try {
      await request(`${BASE_URL}/reset`, { method: 'POST' });
      localStorage.removeItem(CACHE_KEYS.HIVES);
      localStorage.removeItem(CACHE_KEYS.BATCHES);
      localStorage.removeItem(CACHE_KEYS.FARMERS);
      localStorage.removeItem(CACHE_KEYS.ALERTS);
    } catch (e) {
      console.warn('Failed to reset demo data:', e);
    }
  },
};
