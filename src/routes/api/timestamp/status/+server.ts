/**
 * Timestamp Status API Endpoint
 *
 * Check the status of a timestamp request (for polling).
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTimestampResult } from '$lib/server/timestamp';

export const GET: RequestHandler = async ({ url }) => {
  const requestId = url.searchParams.get('requestId');

  if (!requestId) {
    throw error(400, 'Missing requestId parameter');
  }

  const result = getTimestampResult(requestId);

  return json(result);
};
