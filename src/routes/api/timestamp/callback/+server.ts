/**
 * Timestamp Callback Endpoint
 *
 * Receives and verifies the IdentityUpdateResponse from the wallet.
 * The wallet sends the response here after user approves the timestamp.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { storeTimestampResult, isTimestampRequestActive } from '$lib/server/timestamp';
import { IdentityUpdateResponse } from 'verus-typescript-primitives';

/**
 * Handle POST callback from wallet
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';

    let responseData: string;

    if (contentType.includes('application/json')) {
      const body = await request.json();
      responseData = body.response;
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      responseData = formData.get('response') as string;
    } else {
      responseData = await request.text();
    }

    if (!responseData) {
      throw error(400, 'Missing response data');
    }

    // Parse and extract txid from response
    const result = parseIdentityUpdateResponse(responseData);

    if (!result) {
      return json({
        success: false,
        error: 'Invalid response format',
      }, { status: 400 });
    }

    // Store the result
    storeTimestampResult(result.requestId, result.txid);

    return json({
      success: true,
      txid: result.txid,
    });
  } catch (err) {
    console.error('Error processing timestamp callback:', err);
    throw error(500, 'Failed to process callback');
  }
};

/**
 * Handle GET callback (redirect from wallet)
 */
export const GET: RequestHandler = async ({ url }) => {
  try {
    // Try to get response from query params
    let responseData: string | null = null;

    for (const param of ['response', 'data']) {
      const value = url.searchParams.get(param);
      if (value) {
        responseData = value;
        break;
      }
    }

    // Check for i-address style params
    if (!responseData) {
      for (const [key, value] of url.searchParams) {
        if (key.startsWith('i') && key.length > 30) {
          responseData = value || key;
          break;
        }
      }
    }

    if (!responseData) {
      return new Response(errorPage('Missing response data'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const result = parseIdentityUpdateResponse(responseData);

    if (!result) {
      return new Response(errorPage('Invalid response format'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Store the result
    storeTimestampResult(result.requestId, result.txid);

    return new Response(successPage(), {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (err) {
    console.error('Error processing timestamp callback GET:', err);
    return new Response(errorPage('Failed to process response'), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
};

/**
 * Parse IdentityUpdateResponse and extract requestId and txid
 */
function parseIdentityUpdateResponse(responseData: string): { requestId: string; txid: string } | null {
  try {
    let response: InstanceType<typeof IdentityUpdateResponse>;

    if (responseData.startsWith('verusid://')) {
      response = IdentityUpdateResponse.fromWalletDeeplinkUri(responseData);
    } else {
      response = IdentityUpdateResponse.fromQrString(responseData);
    }

    // Extract requestId from response details
    const details = response.details;
    if (!details) {
      console.error('No details in response');
      return null;
    }

    // Get requestId - convert from BigNumber to i-address
    const requestIdBN = (details as any).requestid;
    if (!requestIdBN) {
      console.error('No requestId in response');
      return null;
    }

    // Get txid from response
    const txidBuffer = (details as any).txid;
    if (!txidBuffer) {
      console.error('No txid in response');
      return null;
    }

    // Convert txid buffer to hex string (reversed for display)
    const txid = Buffer.from(txidBuffer).reverse().toString('hex');

    // Convert requestId BigNumber to i-address
    // This needs to match how we generated it
    const requestIdBuffer = requestIdBN.toBuffer('le', 20);
    const versionByte = Buffer.from([102]);
    // @ts-ignore
    const bs58check = require('bs58check');
    const requestId = bs58check.encode(Buffer.concat([versionByte, requestIdBuffer]));

    return { requestId, txid };
  } catch (err) {
    console.error('Error parsing IdentityUpdateResponse:', err);
    return null;
  }
}

function successPage(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Timestamp Created</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
    .card { background: white; padding: 2rem; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #22c55e; margin: 0 0 0.5rem; }
    p { color: #666; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Timestamp Created</h1>
    <p>Your timestamp has been recorded on the blockchain.</p>
    <p style="margin-top: 1rem;">You can close this tab and return to your browser.</p>
  </div>
</body>
</html>`;
}

function errorPage(message: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Timestamp Failed</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
    .card { background: white; padding: 2rem; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #ef4444; margin: 0 0 0.5rem; }
    p { color: #666; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Timestamp Failed</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
