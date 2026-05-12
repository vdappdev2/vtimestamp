/**
 * Server-only VDXF logic for vtimestamp.
 *
 * Reader branches on inner DataDescriptor flags to handle both legacy
 * plaintext (flags:96 in practice — LABEL_PRESENT|MIME_TYPE_PRESENT — and
 * any other non-encrypted shape) and public-encrypted (flags:13) entries
 * under proof.basic. Writer switches between legacy plaintext and the
 * encrypted `{data:{}}` envelope based on USE_ENCRYPTED_CMM.
 *
 * Server-only because the reader calls `decryptdata` over RPC and the writer
 * reads `USE_ENCRYPTED_CMM` from `$env/dynamic/private`. Types and pure
 * formatters live in `$lib/vdxf` (client-safe).
 */

import { env } from '$env/dynamic/private';
import { VDXF_KEYS } from '../config';
import type {
  ContentMultiMap,
  DataDescriptor,
  DataDescriptorWrapper,
  IdentityHistoryEntry,
} from './verus';
import { decryptData } from './verus';
import type {
  TimestampData,
  TimestampRecord,
  CreateTimestampInput,
} from '../vdxf';

// Feature flag — gates the writer between legacy plaintext and the new
// public-encrypted envelope. Reader handles both shapes always-on so it is
// safe to flip at any time. Default: false (legacy) until the wallet→daemon
// envelope passthrough is verified end-to-end. Set USE_ENCRYPTED_CMM=1
// (or any truthy value) to opt into encrypted writes.
const USE_ENCRYPTED_CMM =
  env.USE_ENCRYPTED_CMM === '1'
  || env.USE_ENCRYPTED_CMM === 'true'
  || env.USE_ENCRYPTED_CMM === 'yes';

// ============================================================================
// Flag bits on the inner DataDescriptor
// ============================================================================

const FLAG_ENCRYPTED = 1;
const FLAG_HAS_IVK = 8;
const FLAG_DELETED = 32;

function isPublicEncrypted(descriptor: DataDescriptor): boolean {
  return (descriptor.flags & FLAG_ENCRYPTED) !== 0
    && (descriptor.flags & FLAG_HAS_IVK) !== 0;
}

function isPrivateEncrypted(descriptor: DataDescriptor): boolean {
  return (descriptor.flags & FLAG_ENCRYPTED) !== 0
    && (descriptor.flags & FLAG_HAS_IVK) === 0;
}

function isDeleted(descriptor: DataDescriptor): boolean {
  return descriptor.objectdata === null || descriptor.flags === FLAG_DELETED;
}

// ============================================================================
// Legacy plaintext parsing (non-encrypted entries — typically flags:96)
// ============================================================================

function extractStringValue(descriptor: DataDescriptor): string | undefined {
  if (descriptor.objectdata === null) return undefined;
  if (typeof descriptor.objectdata === 'object' && 'message' in descriptor.objectdata) {
    return descriptor.objectdata.message;
  }
  return undefined;
}

function extractNumberValue(descriptor: DataDescriptor): number | undefined {
  if (typeof descriptor.objectdata === 'number') {
    return descriptor.objectdata;
  }
  if (typeof descriptor.objectdata === 'object' && descriptor.objectdata !== null) {
    const msg = (descriptor.objectdata as { message: string }).message;
    if (typeof msg === 'string') {
      const num = parseInt(msg, 10);
      if (!isNaN(num)) return num;
    }
  }
  return undefined;
}

/**
 * Parse legacy plaintext timestamp entries. Each field lives in its own
 * DataDescriptor wrapper, distinguished by `label` (a VDXF i-address). The
 * legacy writer sets both `label` and `mimetype`, so on-chain flags are
 * typically 96 (LABEL_PRESENT|MIME_TYPE_PRESENT) — not 0. Accept any
 * non-encrypted descriptor.
 */
function parseLegacyPlaintextEntries(entries: DataDescriptorWrapper[]): TimestampData | null {
  const data: Partial<TimestampData> = {};

  for (const wrapper of entries) {
    const descriptor = wrapper[VDXF_KEYS.dataDescriptor];
    if (!descriptor || isDeleted(descriptor)) continue;
    if ((descriptor.flags & FLAG_ENCRYPTED) !== 0) continue;

    const label = descriptor.label;
    if (!label) continue;

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

  if (!data.sha256 || !data.title) {
    return null;
  }

  return data as TimestampData;
}

// ============================================================================
// Encrypted parsing (flags:13 entries)
// ============================================================================

/** Cache decryptdata results — daemon round-trip is the dominant cost on bulk reads. */
const decryptCache = new Map<string, TimestampData | null>();

function cacheKeyFor(descriptor: DataDescriptor, txid: string): string {
  const od = typeof descriptor.objectdata === 'string'
    ? descriptor.objectdata
    : JSON.stringify(descriptor.objectdata);
  return `${txid}|${od}`;
}

async function decryptEnvelopeEntry(
  descriptor: DataDescriptor,
  txid: string
): Promise<TimestampData | null> {
  const cacheKey = cacheKeyFor(descriptor, txid);
  const cached = decryptCache.get(cacheKey);
  if (cached !== undefined) return cached;

  let parsed: TimestampData | null = null;
  try {
    const decrypted = await decryptData(descriptor, txid);
    if (decrypted.length > 0) {
      const hex = decrypted[0].objectdata;
      const json = Buffer.from(hex, 'hex').toString('utf8');
      const payload = JSON.parse(json) as Partial<TimestampData>;
      if (payload.sha256 && payload.title) {
        parsed = {
          sha256: payload.sha256,
          title: payload.title,
          description: payload.description,
          filename: payload.filename,
          filesize: payload.filesize,
        };
      }
    }
  } catch {
    parsed = null;
  }

  decryptCache.set(cacheKey, parsed);
  return parsed;
}

// ============================================================================
// Unified read path — handles legacy + encrypted entries under proof.basic
// ============================================================================

/**
 * Parse timestamps from a single identity history entry. Branches on the
 * inner DataDescriptor's flags: 0/96 = legacy plaintext, 13 = public-encrypted.
 */
export async function parseHistoryEntry(entry: IdentityHistoryEntry): Promise<TimestampRecord | null> {
  const contentmultimap = entry.identity.contentmultimap;
  if (!contentmultimap) return null;

  // Accept either key form. The daemon may normalize FQN to i-address on store,
  // or it may preserve the submitted form — check both so we're robust either way.
  const entries = contentmultimap[VDXF_KEYS.proofBasic] ?? contentmultimap[VDXF_KEYS.proofBasicFqn];
  if (!entries || entries.length === 0) return null;

  const txid = entry.output.txid;

  for (const wrapper of entries) {
    const descriptor = wrapper[VDXF_KEYS.dataDescriptor];
    if (!descriptor || isDeleted(descriptor)) continue;

    if (isPublicEncrypted(descriptor)) {
      const data = await decryptEnvelopeEntry(descriptor, txid);
      if (data) {
        return {
          data,
          blockhash: entry.blockhash,
          blockheight: entry.height,
          txid,
        };
      }
      continue;
    }

    if (isPrivateEncrypted(descriptor)) {
      // Not produced by this app; we don't hold keys.
      continue;
    }

    // Legacy plaintext path.
    const data = parseLegacyPlaintextEntries(entries);
    if (data) {
      return {
        data,
        blockhash: entry.blockhash,
        blockheight: entry.height,
        txid,
      };
    }
    return null;
  }

  return null;
}

/**
 * Parse all timestamps from identity history. Decryption fans out across
 * entries; results are sorted by descending block height (newest first).
 */
export async function parseAllTimestamps(history: IdentityHistoryEntry[]): Promise<TimestampRecord[]> {
  const records = await Promise.all(history.map(parseHistoryEntry));
  const timestamps = records.filter((r): r is TimestampRecord => r !== null);
  timestamps.sort((a, b) => b.blockheight - a.blockheight);
  return timestamps;
}

/**
 * Find a timestamp by its SHA-256 hash. Sequential scan to short-circuit on
 * first match — avoids decrypting every entry when an early one matches.
 */
export async function findTimestampByHash(
  history: IdentityHistoryEntry[],
  sha256: string,
): Promise<TimestampRecord | null> {
  const normalizedHash = sha256.toLowerCase();

  for (const entry of history) {
    const record = await parseHistoryEntry(entry);
    if (record && record.data.sha256.toLowerCase() === normalizedHash) {
      return record;
    }
  }

  return null;
}

// ============================================================================
// Writer — outer key uses the FQN form (Verus Mobile validator requirement,
// see upgrade-plan.md §9.2)
// ============================================================================

/**
 * Legacy plaintext writer. Emits per-field `DataDescriptor` wrappers under
 * proof.basic — each field stored as flags:0 with `label`/`mimetype`/
 * `objectdata.message`. Kept behind the USE_ENCRYPTED_CMM flag for rollback.
 */
function buildLegacyDataDescriptor(
  label: string,
  value: string | number,
  mimetype: string = 'text/plain',
): DataDescriptorWrapper {
  const objectdata =
    typeof value === 'number' ? { message: value.toString() } : { message: value };

  return {
    [VDXF_KEYS.dataDescriptor]: {
      version: 1,
      flags: 0,
      label,
      mimetype,
      objectdata,
    } as DataDescriptor,
  };
}

function buildLegacyTimestampContentMap(input: CreateTimestampInput): ContentMultiMap {
  const entries: DataDescriptorWrapper[] = [];

  entries.push(buildLegacyDataDescriptor(VDXF_KEYS.labels.sha256, input.sha256));
  entries.push(buildLegacyDataDescriptor(VDXF_KEYS.labels.title, input.title));

  if (input.description) {
    entries.push(buildLegacyDataDescriptor(VDXF_KEYS.labels.description, input.description));
  }
  if (input.filename) {
    entries.push(buildLegacyDataDescriptor(VDXF_KEYS.labels.filename, input.filename));
  }
  if (input.filesize !== undefined) {
    entries.push(buildLegacyDataDescriptor(VDXF_KEYS.labels.filesize, input.filesize));
  }

  return {
    [VDXF_KEYS.proofBasicFqn]: entries,
  };
}

/**
 * Encrypted writer — wallet-path test using the SDK's signdata shortcut.
 *
 * `IdentityUpdateRequestDetails.fromCLIJson` (IdentityUpdateRequestDetails.ts:357-372)
 * detects a single `{data: ...}` object as a cmm value and diverts it into
 * `signDataMap` → `PartialSignData.fromCLIJson`. That path accepts
 * `messagehex` (PartialSignData.ts:649). The wallet then runs `signdata` and
 * substitutes the resulting DataDescriptor into the cmm before submitting.
 *
 * Open question this test answers: what `flags` does that produce on-chain?
 * Without `encrypttoaddress` it's likely signed plaintext (flags:2-ish), not
 * the flags:13 public-encrypted shape the daemon's own `{data:{}}` envelope
 * yields. Inspect via `getidentity` after a wallet write.
 *
 * Note: cmm value is a single object (not an array). The array form falls
 * through to `VdxfUniValue.fromJson` and throws — that was the previous
 * failure mode logged in transition_plan.md §"Wallet-path encryption".
 */
function buildEncryptedTimestampContentMap(input: CreateTimestampInput): ContentMultiMap {
  const payload: TimestampData = {
    sha256: input.sha256,
    title: input.title,
    ...(input.description ? { description: input.description } : {}),
    ...(input.filename ? { filename: input.filename } : {}),
    ...(input.filesize !== undefined ? { filesize: input.filesize } : {}),
  };

  const messagehex = Buffer.from(JSON.stringify(payload), 'utf-8').toString('hex');
  const envelope = { data: { messagehex } };

  return {
    [VDXF_KEYS.proofBasicFqn]: envelope as unknown as DataDescriptorWrapper[],
  };
}

/**
 * Build a contentmultimap entry for a new timestamp. Switches between the
 * encrypted envelope and the legacy plaintext shape based on the
 * USE_ENCRYPTED_CMM env var. The reader path handles both shapes always-on,
 * so the flag controls writes only.
 */
export function buildTimestampContentMap(input: CreateTimestampInput): ContentMultiMap {
  return USE_ENCRYPTED_CMM
    ? buildEncryptedTimestampContentMap(input)
    : buildLegacyTimestampContentMap(input);
}
