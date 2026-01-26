/**
 * Timestamps List API Endpoint
 *
 * Get all timestamps for an identity.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getIdentityHistory, getBlock } from '$lib/server/verus';
import { parseAllTimestamps, type TimestampRecord } from '$lib/vdxf';

export const GET: RequestHandler = async ({ url }) => {
  const identity = url.searchParams.get('identity');

  if (!identity) {
    throw error(400, 'Missing identity parameter');
  }

  try {
    // Get identity history
    const history = await getIdentityHistory(identity);

    // Parse all timestamps from history
    const timestamps = parseAllTimestamps(history.history);

    // Enrich with block times
    const enrichedTimestamps: TimestampRecord[] = await Promise.all(
      timestamps.map(async (ts) => {
        try {
          const block = await getBlock(ts.blockhash);
          return {
            ...ts,
            blocktime: block.time,
          };
        } catch {
          // If we can't get block time, return without it
          return ts;
        }
      })
    );

    return json({
      success: true,
      timestamps: enrichedTimestamps,
    });
  } catch (err: any) {
    // If identity not found, return empty list
    if (err?.code === -5) {
      return json({
        success: true,
        timestamps: [],
      });
    }

    console.error('Error fetching timestamps:', err);
    throw error(500, 'Failed to fetch timestamps');
  }
};
