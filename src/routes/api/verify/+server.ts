/**
 * Verify Timestamp API Endpoint
 *
 * Public endpoint to verify if a hash exists as a timestamp on an identity.
 * No authentication required - anyone can verify any timestamp.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getIdentityHistory, getBlock, VerusRpcError, RPC_ERROR_CODES } from '$lib/server/verus';
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
    throw error(400, 'Invalid sha256 format - must be 64 hex characters');
  }

  try {
    // Get identity history
    const historyResponse = await getIdentityHistory(identity);

    // Search for timestamp with this hash
    const timestamp = findTimestampByHash(historyResponse.history, sha256);

    if (!timestamp) {
      return json({
        verified: false,
        identity: historyResponse.fullyqualifiedname,
        message: 'No timestamp found for this hash on this identity',
      });
    }

    // Get block time for the timestamp
    let blocktime: number | undefined;
    try {
      const block = await getBlock(timestamp.blockhash);
      blocktime = block.time;
    } catch {
      // Block time is optional, continue without it
    }

    return json({
      verified: true,
      identity: historyResponse.fullyqualifiedname,
      timestamp: {
        sha256: timestamp.data.sha256,
        title: timestamp.data.title,
        description: timestamp.data.description,
        filename: timestamp.data.filename,
        filesize: timestamp.data.filesize,
        blockhash: timestamp.blockhash,
        blockheight: timestamp.blockheight,
        blocktime,
        txid: timestamp.txid,
      },
    });
  } catch (err) {
    if (err instanceof VerusRpcError) {
      if (err.code === RPC_ERROR_CODES.IDENTITY_NOT_FOUND) {
        throw error(404, `Identity not found: ${identity}`);
      }
    }

    console.error('Error verifying timestamp:', err);
    throw error(500, 'Failed to verify timestamp');
  }
};
