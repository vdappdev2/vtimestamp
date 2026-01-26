/**
 * Test API Endpoint
 *
 * Tests RPC connection and basic functionality.
 * Access via: GET /api/test
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
  getBlockCount,
  getIdentityHistory,
  getBlock,
  checkConnection,
  VerusRpcError,
  RPC_ERROR_CODES,
} from '$lib/server/verus';
import { parseAllTimestamps } from '$lib/vdxf';
import { VERUS_RPC } from '$lib/config';

export const GET: RequestHandler = async ({ url }) => {
  const identity = url.searchParams.get('identity');

  const results: Record<string, unknown> = {
    endpoint: VERUS_RPC.endpoint,
    tests: {},
  };

  // Test 1: Connection check
  try {
    const connected = await checkConnection();
    results.tests = {
      ...results.tests as object,
      connection: { success: connected },
    };
  } catch (e) {
    results.tests = {
      ...results.tests as object,
      connection: { success: false, error: String(e) },
    };
  }

  // Test 2: Get block count
  try {
    const blockCount = await getBlockCount();
    results.tests = {
      ...results.tests as object,
      blockCount: { success: true, height: blockCount },
    };
  } catch (e) {
    results.tests = {
      ...results.tests as object,
      blockCount: { success: false, error: String(e) },
    };
  }

  // Test 3: Get identity history (if identity provided)
  if (identity) {
    try {
      const history = await getIdentityHistory(identity);
      const timestamps = parseAllTimestamps(history.history);

      // Get block time for first timestamp if exists
      let firstTimestampWithBlockTime = null;
      if (timestamps.length > 0) {
        const block = await getBlock(timestamps[0].blockhash);
        firstTimestampWithBlockTime = {
          ...timestamps[0],
          blocktime: block.time,
        };
      }

      results.tests = {
        ...results.tests as object,
        identity: {
          success: true,
          name: history.fullyqualifiedname,
          status: history.status,
          historyEntries: history.history.length,
          timestampsFound: timestamps.length,
          timestamps: timestamps.slice(0, 5), // First 5 only
          firstWithBlockTime: firstTimestampWithBlockTime,
        },
      };
    } catch (e) {
      if (e instanceof VerusRpcError && e.code === RPC_ERROR_CODES.IDENTITY_NOT_FOUND) {
        results.tests = {
          ...results.tests as object,
          identity: { success: false, error: 'Identity not found', code: e.code },
        };
      } else {
        results.tests = {
          ...results.tests as object,
          identity: { success: false, error: String(e) },
        };
      }
    }
  }

  return json(results, { status: 200 });
};
