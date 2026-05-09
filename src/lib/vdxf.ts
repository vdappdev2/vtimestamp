/**
 * Client-safe VDXF types and pure helpers.
 *
 * Server-only logic (decryptdata-based reader, writer that reads
 * USE_ENCRYPTED_CMM) lives in `$lib/server/vdxf` so this module can be
 * imported from Svelte components and pages without leaking server-only
 * dependencies into the client bundle.
 */

import { CURRENT_NETWORK } from './config';

// ============================================================================
// Types
// ============================================================================

/**
 * Parsed timestamp data from blockchain
 */
export interface TimestampData {
  /** SHA-256 hash of the timestamped content */
  sha256: string;
  /** User-provided title */
  title: string;
  /** Optional description */
  description?: string;
  /** Original filename (if file was uploaded) */
  filename?: string;
  /** File size in bytes (if file was uploaded) */
  filesize?: number;
}

/**
 * Complete timestamp record including blockchain metadata
 */
export interface TimestampRecord {
  /** The timestamp data */
  data: TimestampData;
  /** Block hash where this timestamp was recorded */
  blockhash: string;
  /** Block height where this timestamp was recorded */
  blockheight: number;
  /** Block time as Unix timestamp (seconds) */
  blocktime?: number;
  /** Transaction ID */
  txid: string;
}

/**
 * Input for creating a new timestamp
 */
export interface CreateTimestampInput {
  sha256: string;
  title: string;
  description?: string;
  filename?: string;
  filesize?: number;
}

// ============================================================================
// Pure helpers (safe in client + server bundles)
// ============================================================================

/**
 * Validate a SHA-256 hash string
 */
export function isValidSha256(hash: string): boolean {
  return /^[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Format block time as human-readable date string
 */
export function formatBlockTime(blocktime: number): string {
  return new Date(blocktime * 1000).toLocaleString();
}

/**
 * Get explorer URL for a block
 */
export function getBlockExplorerUrl(blockhash: string): string {
  const baseUrl = CURRENT_NETWORK === 'testnet' ? 'https://testex.verus.io' : 'https://insight.verus.io';
  return `${baseUrl}/block/${blockhash}`;
}

/**
 * Get explorer URL for a transaction
 */
export function getTxExplorerUrl(txid: string): string {
  const baseUrl = CURRENT_NETWORK === 'testnet' ? 'https://testex.verus.io' : 'https://insight.verus.io';
  return `${baseUrl}/tx/${txid}`;
}
