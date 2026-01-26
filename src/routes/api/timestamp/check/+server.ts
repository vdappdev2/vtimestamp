/**
 * Timestamp Check API Endpoint
 *
 * Check if a hash already exists for an identity (duplicate detection).
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getIdentityHistory } from '$lib/server/verus';
import { findTimestampByHash, isValidSha256 } from '$lib/vdxf';

export const GET: RequestHandler = async ({ url }) => {
  const identity = url.searchParams.get('identity');
  const sha256 = url.searchParams.get('sha256');

  if (!identity) {
    throw error(400, 'Missing identity parameter');
  }

  if (!sha256) {
    throw error(400, 'Missing sha256 parameter');
  }

  if (!isValidSha256(sha256)) {
    throw error(400, 'Invalid sha256 format');
  }

  try {
    // Get identity history
    const history = await getIdentityHistory(identity);

    // Search for existing timestamp with this hash
    const existing = findTimestampByHash(history.history, sha256);

    if (existing) {
      return json({
        exists: true,
        timestamp: {
          title: existing.data.title,
          blockhash: existing.blockhash,
          blockheight: existing.blockheight,
          txid: existing.txid,
        },
      });
    }

    return json({ exists: false });
  } catch (err: any) {
    // If identity not found, no duplicates
    if (err?.code === -5) {
      return json({ exists: false });
    }

    console.error('Error checking for duplicate hash:', err);
    throw error(500, 'Failed to check for duplicate');
  }
};
