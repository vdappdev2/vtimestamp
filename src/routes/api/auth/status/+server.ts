/**
 * Auth Status Endpoint
 *
 * - Without challengeId: Returns auth configuration status
 * - With challengeId: Returns auth result for polling (desktop checks if mobile completed auth)
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isAuthConfigured, getAuthResult, isChallengeActive } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url }) => {
  const challengeId = url.searchParams.get('challengeId');

  // If no challengeId, return config status
  if (!challengeId) {
    return json({
      configured: isAuthConfigured(),
    });
  }

  // Check if auth completed for this challenge
  const result = getAuthResult(challengeId);

  if (result) {
    // Auth completed - return the identity info
    return json({
      status: 'completed',
      identity: result.identity,
      friendlyName: result.friendlyName,
    });
  }

  // Check if challenge is still active (pending or not yet consumed)
  if (isChallengeActive(challengeId)) {
    return json({
      status: 'pending',
    });
  }

  // Challenge not found or expired
  return json({
    status: 'expired',
  });
};
