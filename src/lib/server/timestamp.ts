/**
 * Timestamp Helpers (Server-Side Only)
 *
 * Creates signed identity update requests for on-chain timestamp storage.
 * Uses the GenericRequest pattern for wallet compatibility.
 */

import { VerusIdInterface } from 'verusid-ts-client';
import { randomBytes } from 'crypto';
// @ts-ignore - no types available
import bs58check from 'bs58check';
import {
  IdentityUpdateRequestDetails,
  GenericRequest,
  IdentityUpdateRequestOrdinalVDXFObject,
  VerifiableSignatureData,
  CompactIAddressObject,
  ResponseURI,
} from 'verus-typescript-primitives';
// @ts-ignore - no types available
import { BN } from 'bn.js';
import { env } from '$env/dynamic/private';
import { VERUS_RPC } from '../config';
import { getIdentity } from './verus';
import { buildTimestampContentMap, type CreateTimestampInput } from '../vdxf';

// Environment variables
const SERVICE_IDENTITY_WIF = env.SERVICE_IDENTITY_WIF || '';
const SERVICE_IDENTITY_IADDRESS = env.SERVICE_IDENTITY_IADDRESS || '';

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
  const payload = new Uint8Array(21);
  payload[0] = 102; // i-address version byte
  payload.set(hash, 1);
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
  if (!SERVICE_IDENTITY_IADDRESS) {
    throw new Error('SERVICE_IDENTITY_IADDRESS not configured');
  }

  const chainId = CHAIN_IDS[VERUS_RPC.chainId === 'vrsctest' ? 'testnet' : 'mainnet'];
  const isTestnet = VERUS_RPC.chainId === 'vrsctest';
  const verusId = getVerusIdInterface();

  const requestId = generateRandomIAddress();

  // Get user identity info (name + parent needed for the update)
  const identityInfo = await getIdentity(userIdentityAddress);
  const name = identityInfo.identity.name;
  const parent = identityInfo.identity.parent;

  // Build contentmultimap
  const contentmultimap = buildTimestampContentMap(timestampData);

  // Build identity update details from CLI-style JSON
  const details = IdentityUpdateRequestDetails.fromCLIJson(
    { name, parent, contentmultimap },
    { requestid: CompactIAddressObject.fromAddress(requestId).toJson() },
  );

  // Include requestId in callback URL for matching
  const callbackWithRequestId = `${callbackUrl}?requestId=${requestId}`;

  // Build response URIs
  const responseUris = [
    ResponseURI.fromUriString(callbackWithRequestId, ResponseURI.TYPE_REDIRECT),
  ];

  // Create GenericRequest with IdentityUpdateRequestOrdinalVDXFObject
  const request = new GenericRequest({
    details: [
      new IdentityUpdateRequestOrdinalVDXFObject({ data: details }),
    ],
    createdAt: new BN(Math.floor(Date.now() / 1000)),
    responseURIs: responseUris,
  });

  // Initialize signature metadata
  request.signature = new VerifiableSignatureData({
    systemID: CompactIAddressObject.fromAddress(chainId),
    identityID: CompactIAddressObject.fromAddress(SERVICE_IDENTITY_IADDRESS),
  });

  if (isTestnet) {
    request.setIsTestnet();
  }

  // Sign the request - library handles identity validation and height fetching
  const signedRequest = await verusId.signGenericRequest(request, SERVICE_IDENTITY_WIF);

  // Store pending request
  pendingTimestampRequests.set(requestId, {
    requestId,
    userIdentity: userIdentityAddress,
    timestampData,
    createdAt: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });

  return {
    requestId,
    qrString: signedRequest.toWalletDeeplinkUri(),
    deeplinkUri: signedRequest.toWalletDeeplinkUri(),
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
  return !!SERVICE_IDENTITY_WIF && SERVICE_IDENTITY_WIF !== 'YOUR_WIF_HERE' && !!SERVICE_IDENTITY_IADDRESS;
}
