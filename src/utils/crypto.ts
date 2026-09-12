/**
 * Honey Chain Cryptographic Utilities
 * Computes deterministic canonical SHA-256 hashes for batches & certificates
 * and provides Merkle anchor verification.
 */

import { HoneyBatch, QualityCertificate } from '../types';

/**
 * Computes SHA-256 of any UTF-8 string using browser standard Crypto Subtle API
 */
export async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return '0x' + hashHex;
}

/**
 * Creates canonical string of essential batch fields for verifiable commitment
 * (Rule 8: Exclude cosmetic fields, include immutable trust-critical fields)
 */
export function canonicalBatchString(batch: HoneyBatch, cert?: QualityCertificate): string {
  const canonicalObj = {
    batchCode: batch.batchCode,
    hiveCode: batch.hiveCode,
    district: batch.district,
    state: batch.state,
    honeyType: batch.honeyType,
    netWeightKg: Number(batch.netWeightKg).toFixed(2),
    harvestDate: batch.harvestDate,
    certStatus: cert ? cert.status : 'NO_CERT',
    certResult: cert ? cert.parameters.overallResult : 'NONE',
    certMoisture: cert ? cert.parameters.moisturePct.toFixed(1) : 'NONE',
    certHmf: cert ? cert.parameters.hmfMgKg.toFixed(1) : 'NONE',
    certAdulteration: cert ? cert.parameters.c4SugarAdulteration : 'NONE',
  };
  return JSON.stringify(canonicalObj, Object.keys(canonicalObj).sort());
}

/**
 * Computes the live cryptographic commitment hash for a batch
 */
export async function computeBatchCommitmentHash(
  batch: HoneyBatch,
  cert?: QualityCertificate
): Promise<string> {
  const canonical = canonicalBatchString(batch, cert);
  return await sha256(canonical);
}

/**
 * Verifies whether the batch's current data matches its on-chain anchored hash
 */
export async function verifyBatchIntegrity(
  batch: HoneyBatch
): Promise<{
  verified: boolean;
  computedHash: string;
  onChainHash: string;
  mismatchReason?: string;
}> {
  if (!batch.blockchainRecord) {
    return {
      verified: false,
      computedHash: '',
      onChainHash: '',
      mismatchReason: 'Batch is not yet anchored to blockchain ledger',
    };
  }

  const computed = await computeBatchCommitmentHash(batch, batch.certificate);
  const onChain = batch.blockchainRecord.commitmentHash;

  const matches = computed.toLowerCase() === onChain.toLowerCase();

  return {
    verified: matches,
    computedHash: computed,
    onChainHash: onChain,
    mismatchReason: matches
      ? undefined
      : `Computed hash (${computed.slice(0, 10)}...) does not match immutable on-chain commitment (${onChain.slice(0, 10)}...)! Data was modified after submission.`,
  };
}

/**
 * Generate mock Ethereum/Polygon address or tx hash
 */
export function formatHexShort(hex: string, len: number = 8): string {
  if (!hex) return '';
  if (hex.length <= len * 2 + 2) return hex;
  return `${hex.slice(0, len + 2)}...${hex.slice(-len)}`;
}
