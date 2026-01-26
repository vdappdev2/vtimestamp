/**
 * Create Timestamp API Endpoint
 *
 * Creates an IdentityUpdateRequest for wallet approval.
 * Requires authenticated session.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createTimestampRequest, isTimestampConfigured } from '$lib/server/timestamp';
import { isValidSha256 } from '$lib/vdxf';

export const POST: RequestHandler = async ({ request, url }) => {
  // Check if timestamp service is configured
  if (!isTimestampConfigured()) {
    throw error(503, 'Timestamp service not configured. Please set SERVICE_IDENTITY_WIF in .env');
  }

  try {
    const body = await request.json();

    // Validate required fields
    const { identity, sha256, title, description, filename, filesize } = body;

    if (!identity) {
      throw error(400, 'Missing identity (user must be logged in)');
    }

    if (!sha256) {
      throw error(400, 'Missing sha256 hash');
    }

    if (!isValidSha256(sha256)) {
      throw error(400, 'Invalid sha256 hash format (must be 64 hex characters)');
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw error(400, 'Title is required');
    }

    // Build callback URL
    const callbackUrl = `${url.origin}/api/timestamp/callback`;

    // Create the timestamp request
    const result = await createTimestampRequest(
      identity,
      {
        sha256: sha256.toLowerCase(),
        title: title.trim(),
        description: description?.trim(),
        filename: filename?.trim(),
        filesize: typeof filesize === 'number' ? filesize : undefined,
      },
      callbackUrl
    );

    return json({
      success: true,
      requestId: result.requestId,
      qrString: result.qrString,
      deeplinkUri: result.deeplinkUri,
    });
  } catch (err) {
    console.error('Error creating timestamp request:', err);
    if (err && typeof err === 'object' && 'status' in err) {
      throw err; // Re-throw SvelteKit errors
    }
    const message = err instanceof Error ? err.message : 'Failed to create timestamp request';
    throw error(500, message);
  }
};
