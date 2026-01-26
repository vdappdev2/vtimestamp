/**
 * Login API Endpoint
 *
 * Creates a VerusID login consent request for wallet authentication.
 * Returns QR string and deeplink URI for the wallet to scan/open.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createLoginRequest, isAuthConfigured } from '$lib/server/auth';

export const POST: RequestHandler = async ({ url }) => {
  // Check if auth is configured
  if (!isAuthConfigured()) {
    throw error(503, 'Authentication not configured. Please set SERVICE_IDENTITY_WIF in .env');
  }

  // Build the callback URL for the wallet response
  const callbackUrl = `${url.origin}/api/auth/callback`;

  try {
    const { qrString, deeplinkUri, sessionId, challengeId } = await createLoginRequest(callbackUrl);

    return json({
      success: true,
      qrString,
      deeplinkUri,
      sessionId,
      challengeId,
    });
  } catch (err) {
    console.error('Error creating login request:', err);
    const message = err instanceof Error ? err.message : 'Failed to create login request';
    throw error(500, message);
  }
};

export const GET: RequestHandler = async () => {
  // GET method just checks if auth is configured
  return json({
    configured: isAuthConfigured(),
  });
};
