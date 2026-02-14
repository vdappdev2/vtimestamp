/**
 * Authentication Helpers (Server-Side Only)
 *
 * Handles VerusID login consent flow using verusid-ts-client.
 */

import { VerusIdInterface } from 'verusid-ts-client';
import { randomBytes } from 'crypto';
// @ts-ignore - no types available
import bs58check from 'bs58check';
import {
  LoginConsentRequest,
  LoginConsentResponse,
  LoginConsentChallenge,
  RequestedPermission,
  Subject,
  RedirectUri,
  LOGIN_CONSENT_REDIRECT_VDXF_KEY,
  IDENTITY_VIEW,
  ID_FULLYQUALIFIEDNAME_VDXF_KEY,
} from 'verus-typescript-primitives';
import { env } from '$env/dynamic/private';
import { VERUS_RPC } from '../config';
import { getIdentity } from './verus';

// Environment variables (restart server after changing .env)
const SERVICE_IDENTITY_NAME = env.SERVICE_IDENTITY_NAME || 'testidx@';
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
 * Uses base58check encoding with version byte 102 (i-address prefix)
 */
function generateRandomIAddress(): string {
  // Generate 20 random bytes for the hash160
  const hash = randomBytes(20);

  // Version byte for i-addresses is 102 (0x66)
  // Create payload: version byte + 20 bytes hash
  const versionByte = Buffer.from([102]) as unknown as Uint8Array;
  const payload = Buffer.concat([versionByte, hash as unknown as Uint8Array]);

  // bs58check handles the checksum automatically
  return bs58check.encode(payload) as string;
}

/**
 * Pending login challenges (in-memory store)
 * In production, use Redis or a database
 */
const pendingChallenges = new Map<string, {
  sessionId: string;
  createdAt: number;
  expiresAt: number;
}>();

/**
 * Completed authentications (in-memory store)
 * Keyed by challengeId, stores the verified identity info
 * Desktop browser polls this to detect successful mobile auth
 */
const completedAuths = new Map<string, {
  identity: string;
  friendlyName: string;
  completedAt: number;
  expiresAt: number;
}>();

// Clean up expired challenges and completed auths periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, challenge] of pendingChallenges) {
    if (now > challenge.expiresAt) {
      pendingChallenges.delete(id);
    }
  }
  for (const [id, auth] of completedAuths) {
    if (now > auth.expiresAt) {
      completedAuths.delete(id);
    }
  }
}, 60000); // Every minute

/**
 * Create a login consent request
 *
 * @param callbackUrl - URL where the wallet will send the response
 * @returns Object containing the QR string, deeplink URI, and session info
 */
export async function createLoginRequest(callbackUrl: string): Promise<{
  qrString: string;
  deeplinkUri: string;
  sessionId: string;
  challengeId: string;
}> {
  if (!SERVICE_IDENTITY_WIF) {
    throw new Error('SERVICE_IDENTITY_WIF not configured');
  }

  const verusId = getVerusIdInterface();

  const challengeId = generateRandomIAddress();
  const sessionId = generateRandomIAddress();
  const salt = generateRandomIAddress();
  const createdAt = Math.floor(Date.now() / 1000);

  // Store the challenge for verification later
  pendingChallenges.set(challengeId, {
    sessionId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });

  // Create the challenge object
  const challenge = new LoginConsentChallenge({
    challenge_id: challengeId,
    requested_access: [new RequestedPermission(IDENTITY_VIEW.vdxfid)],
    subject: [
      new Subject('', ID_FULLYQUALIFIEDNAME_VDXF_KEY.vdxfid),
    ],
    redirect_uris: [
      new RedirectUri(callbackUrl, LOGIN_CONSENT_REDIRECT_VDXF_KEY.vdxfid),
    ],
    session_id: sessionId,
    created_at: createdAt,
    salt,
  });

  // Create and sign the login consent request (signing_id must be an i-address)
  const request = await verusId.createLoginConsentRequest(
    SERVICE_IDENTITY_IADDRESS,
    challenge,
    SERVICE_IDENTITY_WIF
  );

  return {
    qrString: request.toQrString(),
    deeplinkUri: request.toWalletDeeplinkUri(),
    sessionId,
    challengeId,
  };
}

/**
 * Verify a login consent response from the wallet
 *
 * @param responseData - The response data from the wallet (base64 encoded QR string or deeplink)
 * @returns The verified identity info, or null if invalid
 */
export async function verifyLoginResponse(responseData: string): Promise<{
  identity: string;
  friendlyName: string;
} | null> {
  try {
    const verusId = getVerusIdInterface();

    // Parse the response from different formats
    let response: LoginConsentResponse;

    if (responseData.startsWith('verusid://')) {
      // Deep link format - extract base64 from URI
      // Format: verusid://x-callback-url/auth?i4Jt4EoXsLWXe1rBLTBBggCy2MG6bz3kFa=<base64>
      const url = new URL(responseData);
      const params = url.searchParams;
      // The response is typically in a parameter, find the base64 value
      let base64Data: string | null = null;
      for (const [key, value] of params) {
        // Look for a long base64-like value
        if (value && value.length > 50) {
          base64Data = value;
          break;
        }
        // Or the key itself might be the vdxfkey with value being the data
        if (key.startsWith('i') && key.length > 30) {
          base64Data = value || key;
          break;
        }
      }
      if (!base64Data) {
        console.error('Could not extract response data from deeplink');
        return null;
      }
      const buffer = Buffer.from(base64Data, 'base64');
      response = new LoginConsentResponse();
      response.fromBuffer(buffer);
    } else {
      // QR string format (base64) - decode and parse
      const buffer = Buffer.from(responseData, 'base64');
      response = new LoginConsentResponse();
      response.fromBuffer(buffer);
    }

    // Get the challenge ID from the response
    const challengeId = response.decision?.request?.challenge?.challenge_id;
    if (!challengeId) {
      console.error('No challenge ID in response');
      return null;
    }

    // Check if we have this challenge pending
    const pending = pendingChallenges.get(challengeId);
    if (!pending) {
      console.error('Challenge not found or expired');
      return null;
    }

    // Verify the response signature
    const isValid = await verusId.verifyLoginConsentResponse(response);
    if (!isValid) {
      console.error('Invalid response signature');
      return null;
    }

    // Remove the used challenge
    pendingChallenges.delete(challengeId);

    // Extract identity info from the response
    const signingId = response.signing_id || '';

    // Look up the friendly name via getidentity RPC
    let friendlyName = signingId; // fallback to i-address
    try {
      const identityInfo = await getIdentity(signingId);
      friendlyName = identityInfo.friendlyname;
    } catch (err) {
      console.error('Failed to look up identity friendly name:', err);
      // Continue with i-address as fallback
    }

    const result = {
      identity: signingId,
      friendlyName: friendlyName,
    };

    // Store the completed auth for desktop polling
    completedAuths.set(challengeId, {
      ...result,
      completedAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes to poll
    });

    return result;
  } catch (error) {
    console.error('Error verifying login response:', error);
    return null;
  }
}

/**
 * Check if the service identity WIF is configured
 */
export function isAuthConfigured(): boolean {
  return !!SERVICE_IDENTITY_WIF && SERVICE_IDENTITY_WIF !== 'YOUR_WIF_HERE' && !!SERVICE_IDENTITY_IADDRESS;
}

/**
 * Get pending challenge info (for debugging)
 */
export function getPendingChallenge(challengeId: string) {
  return pendingChallenges.get(challengeId);
}

/**
 * Get completed auth result by challengeId (for polling)
 * Returns the identity info if auth completed, null if pending/not found
 * Optionally consumes the result (removes it after retrieval)
 */
export function getAuthResult(challengeId: string, consume = true): {
  identity: string;
  friendlyName: string;
} | null {
  const auth = completedAuths.get(challengeId);
  if (!auth) {
    return null;
  }

  if (consume) {
    completedAuths.delete(challengeId);
  }

  return {
    identity: auth.identity,
    friendlyName: auth.friendlyName,
  };
}

/**
 * Check if a challenge is still pending (for status checks)
 */
export function isChallengeActive(challengeId: string): boolean {
  return pendingChallenges.has(challengeId) || completedAuths.has(challengeId);
}
