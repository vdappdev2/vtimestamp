/**
 * VDXF Helpers for vtimestamp
 *
 * Provides functions to parse and build VDXF structures for timestamp data.
 */

import { VDXF_KEYS, CURRENT_NETWORK } from './config';
import type {
  ContentMultiMap,
  DataDescriptor,
  DataDescriptorWrapper,
  IdentityHistoryEntry,
} from './server/verus';

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
// Parsing Functions
// ============================================================================

/**
 * Check if a DataDescriptor is a deletion marker
 */
function isDeleted(descriptor: DataDescriptor): boolean {
  return descriptor.objectdata === null || descriptor.flags === 32;
}

/**
 * Extract string value from DataDescriptor objectdata
 */
function extractStringValue(descriptor: DataDescriptor): string | undefined {
  if (descriptor.objectdata === null) return undefined;
  if (typeof descriptor.objectdata === 'object' && 'message' in descriptor.objectdata) {
    return descriptor.objectdata.message;
  }
  return undefined;
}

/**
 * Extract number value from DataDescriptor objectdata
 */
function extractNumberValue(descriptor: DataDescriptor): number | undefined {
  if (typeof descriptor.objectdata === 'number') {
    return descriptor.objectdata;
  }
  // Handle case where number is stored as string in message
  if (typeof descriptor.objectdata === 'object' && descriptor.objectdata !== null) {
    const msg = descriptor.objectdata.message;
    if (typeof msg === 'string') {
      const num = parseInt(msg, 10);
      if (!isNaN(num)) return num;
    }
  }
  return undefined;
}

/**
 * Parse timestamp data from a contentmultimap entry
 *
 * @param entries - Array of DataDescriptor wrappers from contentmultimap
 * @returns Parsed timestamp data, or null if required fields are missing
 */
export function parseTimestampData(entries: DataDescriptorWrapper[]): TimestampData | null {
  const data: Partial<TimestampData> = {};

  for (const wrapper of entries) {
    const descriptor = wrapper[VDXF_KEYS.dataDescriptor];
    if (!descriptor || isDeleted(descriptor)) continue;

    const label = descriptor.label;
    if (!label) continue;

    // Match label to known fields
    if (label === VDXF_KEYS.labels.sha256) {
      data.sha256 = extractStringValue(descriptor);
    } else if (label === VDXF_KEYS.labels.title) {
      data.title = extractStringValue(descriptor);
    } else if (label === VDXF_KEYS.labels.description) {
      data.description = extractStringValue(descriptor);
    } else if (label === VDXF_KEYS.labels.filename) {
      data.filename = extractStringValue(descriptor);
    } else if (label === VDXF_KEYS.labels.filesize) {
      data.filesize = extractNumberValue(descriptor);
    }
  }

  // Validate required fields
  if (!data.sha256 || !data.title) {
    return null;
  }

  return data as TimestampData;
}

/**
 * Parse timestamps from a single identity history entry
 *
 * @param entry - A single history entry from getidentityhistory
 * @returns TimestampRecord if entry contains valid timestamp, null otherwise
 */
export function parseHistoryEntry(entry: IdentityHistoryEntry): TimestampRecord | null {
  const contentmultimap = entry.identity.contentmultimap;
  if (!contentmultimap) return null;

  // Look for our timestamp proof outer key
  const entries = contentmultimap[VDXF_KEYS.proofBasic];
  if (!entries || entries.length === 0) return null;

  const data = parseTimestampData(entries);
  if (!data) return null;

  return {
    data,
    blockhash: entry.blockhash,
    blockheight: entry.height,
    txid: entry.output.txid,
  };
}

/**
 * Parse all timestamps from identity history
 *
 * @param history - Array of history entries from getidentityhistory
 * @returns Array of timestamp records, newest first
 */
export function parseAllTimestamps(history: IdentityHistoryEntry[]): TimestampRecord[] {
  const timestamps: TimestampRecord[] = [];

  for (const entry of history) {
    const record = parseHistoryEntry(entry);
    if (record) {
      timestamps.push(record);
    }
  }

  // Sort by block height descending (newest first)
  timestamps.sort((a, b) => b.blockheight - a.blockheight);

  return timestamps;
}

/**
 * Find a timestamp by its SHA-256 hash
 *
 * @param history - Array of history entries from getidentityhistory
 * @param sha256 - The hash to search for
 * @returns TimestampRecord if found, null otherwise
 */
export function findTimestampByHash(
  history: IdentityHistoryEntry[],
  sha256: string
): TimestampRecord | null {
  // Normalize hash to lowercase for comparison
  const normalizedHash = sha256.toLowerCase();

  for (const entry of history) {
    const record = parseHistoryEntry(entry);
    if (record && record.data.sha256.toLowerCase() === normalizedHash) {
      return record;
    }
  }

  return null;
}

// ============================================================================
// Building Functions (for creating timestamps)
// ============================================================================

/**
 * Build a single DataDescriptor entry
 */
function buildDataDescriptor(
  label: string,
  value: string | number,
  mimetype: string = 'text/plain'
): DataDescriptorWrapper {
  const objectdata =
    typeof value === 'number' ? { message: value.toString() } : { message: value };

  return {
    [VDXF_KEYS.dataDescriptor]: {
      version: 1,
      label,
      mimetype,
      objectdata,
    } as DataDescriptor,
  };
}

/**
 * Build contentmultimap structure for a new timestamp
 *
 * This creates the structure needed for updateidentity.
 * Note: The actual updateidentity call is done via wallet, not direct RPC.
 *
 * @param input - Timestamp input data
 * @returns ContentMultiMap structure ready for updateidentity
 */
export function buildTimestampContentMap(input: CreateTimestampInput): ContentMultiMap {
  const entries: DataDescriptorWrapper[] = [];

  // Required fields
  entries.push(buildDataDescriptor(VDXF_KEYS.labels.sha256, input.sha256));
  entries.push(buildDataDescriptor(VDXF_KEYS.labels.title, input.title));

  // Optional fields
  if (input.description) {
    entries.push(buildDataDescriptor(VDXF_KEYS.labels.description, input.description));
  }
  if (input.filename) {
    entries.push(buildDataDescriptor(VDXF_KEYS.labels.filename, input.filename));
  }
  if (input.filesize !== undefined) {
    entries.push(buildDataDescriptor(VDXF_KEYS.labels.filesize, input.filesize));
  }

  return {
    [VDXF_KEYS.proofBasic]: entries,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validate a SHA-256 hash string
 *
 * @param hash - String to validate
 * @returns true if valid 64-character hex string
 */
export function isValidSha256(hash: string): boolean {
  return /^[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Format block time as human-readable date string
 *
 * @param blocktime - Unix timestamp in seconds
 * @returns Formatted date string
 */
export function formatBlockTime(blocktime: number): string {
  return new Date(blocktime * 1000).toLocaleString();
}

/**
 * Get explorer URL for a block
 *
 * @param blockhash - Block hash
 * @returns Explorer URL
 */
export function getBlockExplorerUrl(blockhash: string): string {
  const baseUrl = CURRENT_NETWORK === 'testnet' ? 'https://testex.verus.io' : 'https://insight.verus.io';
  return `${baseUrl}/block/${blockhash}`;
}

/**
 * Get explorer URL for a transaction
 *
 * @param txid - Transaction ID
 * @returns Explorer URL
 */
export function getTxExplorerUrl(txid: string): string {
  const baseUrl = CURRENT_NETWORK === 'testnet' ? 'https://testex.verus.io' : 'https://insight.verus.io';
  return `${baseUrl}/tx/${txid}`;
}
