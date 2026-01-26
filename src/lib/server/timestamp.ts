/**
 * Timestamp Helpers (Server-Side Only)
 *
 * Handles IdentityUpdateRequest creation for timestamp flow.
 * Follows the same pattern as auth.ts.
 */

import { VerusIdInterface } from 'verusid-ts-client';
import { randomBytes } from 'crypto';
// @ts-ignore - no types available
import bs58check from 'bs58check';
import {
  IdentityUpdateRequest,
  IdentityUpdateRequestDetails,
  PartialIdentity,
  ResponseUri,
  VerusIDSignature,
  IDENTITY_AUTH_SIG_VDXF_KEY,
  IdentityID,
} from 'verus-typescript-primitives';
import { BigNumber } from 'verus-typescript-primitives';
import { env } from '$env/dynamic/private';
import { VERUS_RPC } from '../config';
import { getIdentity } from './verus';
import { buildTimestampContentMap, type CreateTimestampInput } from '../vdxf';

// Environment variables
const SERVICE_IDENTITY_NAME = env.SERVICE_IDENTITY_NAME || 'testidx@';
const SERVICE_IDENTITY_WIF = env.SERVICE_IDENTITY_WIF || '';

// Chain IDs
const CHAIN_IDS = {
  testnet: 'iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq', // VRSCTEST
  mainnet: 'i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV', // VRSC
} as const;

/**
 * Get the VerusIdInterface instance
 */
function getVerusIdInterface(): VerusIdInterface {
  const chainId = CHAIN_IDS[VERUS_RPC.chainId === 'vrsctest' ? 'testnet' : 'mainnet'];
  return new VerusIdInterface(chainId, VERUS_RPC.endpoint);
}

/**
 * Generate a random valid i-address
 */
function generateRandomIAddress(): string {
  const hash = randomBytes(20);
  const versionByte = Buffer.from([102]) as unknown as Uint8Array;
  const payload = Buffer.concat([versionByte, hash as unknown as Uint8Array]);
  return bs58check.encode(payload) as string;
}

/**
 * Pending timestamp requests (in-memory store)
 */
const pendingTimestampRequests = new Map<string, {
  requestId: string;
  userIdentity: string;
  timestampData: CreateTimestampInput;
  createdAt: number;
  expiresAt: number;
}>();

/**
 * Completed timestamps (in-memory store)
 * Stores txid after wallet callback
 */
const completedTimestamps = new Map<string, {
  txid: string;
  completedAt: number;
  expiresAt: number;
}>();

// Clean up expired requests periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, request] of pendingTimestampRequests) {
    if (now > request.expiresAt) {
      pendingTimestampRequests.delete(id);
    }
  }
  for (const [id, result] of completedTimestamps) {
    if (now > result.expiresAt) {
      completedTimestamps.delete(id);
    }
  }
}, 60000); // Every minute

/**
 * Create a timestamp request for wallet approval
 *
 * @param userIdentityAddress - The user's i-address (from session)
 * @param timestampData - The timestamp data (sha256, title, etc.)
 * @param callbackUrl - URL where the wallet will send the response
 * @returns QR string, deeplink URI, and request ID
 */
export async function createTimestampRequest(
  userIdentityAddress: string,
  timestampData: CreateTimestampInput,
  callbackUrl: string
): Promise<{
  requestId: string;
  qrString: string;
  deeplinkUri: string;
}> {
  if (!SERVICE_IDENTITY_WIF) {
    throw new Error('SERVICE_IDENTITY_WIF not configured');
  }

  const verusId = getVerusIdInterface();

  // 1. Get service identity i-address (needed for signingid)
  const serviceIdentityInfo = await getIdentity(SERVICE_IDENTITY_NAME);
  const serviceIdentityAddress = serviceIdentityInfo.identity.identityaddress;

  // 2. Get user identity info - use identity.name and identity.parent directly
  const identityInfo = await getIdentity(userIdentityAddress);
  const name = identityInfo.identity.name;
  const parent = identityInfo.identity.parent; // Already an i-address

  // 3. Build contentmultimap
  const contentmultimap = buildTimestampContentMap(timestampData);

  // 4. Create PartialIdentity with just name, parent, and contentmultimap
  const partialIdentity = PartialIdentity.fromJson({
    name,
    parent,
    contentmultimap,
  });

  // 5. Generate request details
  const requestId = generateRandomIAddress();
  const createdAt = Math.floor(Date.now() / 1000);
  const systemId = CHAIN_IDS[VERUS_RPC.chainId === 'vrsctest' ? 'testnet' : 'mainnet'];

  // 6. Create IdentityUpdateRequestDetails
  const requestDetails = new IdentityUpdateRequestDetails({
    requestid: new BigNumber(Buffer.from(bs58check.decode(requestId)).slice(1)),
    createdat: new BigNumber(createdAt),
    identity: partialIdentity,
    systemid: IdentityID.fromAddress(systemId),
    responseuris: [ResponseUri.fromUriString(callbackUrl, ResponseUri.TYPE_REDIRECT)],
  });

  // Enable testnet flag if on testnet
  if (VERUS_RPC.chainId === 'vrsctest') {
    requestDetails.toggleIsTestnet();
  }

  // 7. Create the envelope
  const request = new IdentityUpdateRequest({
    details: requestDetails,
    systemid: IdentityID.fromAddress(systemId),
  });

  // 8. Sign with service identity
  // Get the hash to sign (pass as Buffer for signHashOffline)
  const blockHeight = 0; // Current block height not needed for request signing
  const hashToSign = request.getDetailsHash(blockHeight);

  // Sign using VerusIdInterface - pass hash as Buffer
  const signatureBase64 = await verusId.signHash(
    SERVICE_IDENTITY_NAME,
    hashToSign, // Pass as Buffer
    SERVICE_IDENTITY_WIF
  );

  // Create VerusIDSignature from the base64 signature
  const signature = new VerusIDSignature(
    { signature: signatureBase64 },
    IDENTITY_AUTH_SIG_VDXF_KEY
  );

  // Set signature on request
  request.signature = signature;
  request.signingid = IdentityID.fromAddress(serviceIdentityAddress);
  request.setSigned();

  // 9. Store pending request
  pendingTimestampRequests.set(requestId, {
    requestId,
    userIdentity: userIdentityAddress,
    timestampData,
    createdAt: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });

  // 10. Return QR and deeplink
  return {
    requestId,
    qrString: request.toQrString(),
    deeplinkUri: request.toWalletDeeplinkUri(),
  };
}

/**
 * Get timestamp result by requestId
 * Returns the txid if completed, null otherwise
 */
export function getTimestampResult(requestId: string): {
  status: 'pending' | 'completed' | 'expired';
  txid?: string;
} {
  // Check if completed
  const completed = completedTimestamps.get(requestId);
  if (completed) {
    return { status: 'completed', txid: completed.txid };
  }

  // Check if still pending
  const pending = pendingTimestampRequests.get(requestId);
  if (pending) {
    if (Date.now() > pending.expiresAt) {
      pendingTimestampRequests.delete(requestId);
      return { status: 'expired' };
    }
    return { status: 'pending' };
  }

  return { status: 'expired' };
}

/**
 * Check if a timestamp request is still active
 */
export function isTimestampRequestActive(requestId: string): boolean {
  return pendingTimestampRequests.has(requestId) || completedTimestamps.has(requestId);
}

/**
 * Store a completed timestamp result (called from callback)
 */
export function storeTimestampResult(requestId: string, txid: string): boolean {
  // Check if this request exists
  const pending = pendingTimestampRequests.get(requestId);
  if (!pending) {
    // Request might have already been completed or expired
    // Still store the result in case of race condition
  }

  // Remove from pending
  pendingTimestampRequests.delete(requestId);

  // Store in completed
  completedTimestamps.set(requestId, {
    txid,
    completedAt: Date.now(),
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes to poll
  });

  return true;
}

/**
 * Get pending request info (for debugging)
 */
export function getPendingTimestampRequest(requestId: string) {
  return pendingTimestampRequests.get(requestId);
}

/**
 * Check if timestamp service is configured
 */
export function isTimestampConfigured(): boolean {
  return !!SERVICE_IDENTITY_WIF && SERVICE_IDENTITY_WIF !== 'YOUR_WIF_HERE';
}
