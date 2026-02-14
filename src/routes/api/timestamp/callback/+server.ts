/**
 * Timestamp Callback Endpoint
 *
 * Receives and verifies the GenericRequest response from the wallet.
 * The wallet sends the response here after user approves the timestamp.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { storeTimestampResult } from '$lib/server/timestamp';
import {
  GenericRequest,
  IdentityUpdateResponseOrdinalVDXFObject,
  IdentityUpdateResponseDetails,
} from 'verus-typescript-primitives';

/**
 * Handle POST callback from wallet
 */
export const POST: RequestHandler = async ({ request, url }) => {
  try {
    const requestId = url.searchParams.get('requestId');
    if (!requestId) {
      throw error(400, 'Missing requestId parameter');
    }

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
    storeTimestampResult(requestId, result.txid);

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
    const requestId = url.searchParams.get('requestId');
    if (!requestId) {
      return new Response(errorPage('Missing requestId parameter'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Find the response data from query params
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
        if (key === 'requestId') continue;
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
    storeTimestampResult(requestId, result.txid);

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
 * Parse GenericRequest response envelope and extract txid
 */
function parseIdentityUpdateResponse(responseData: string): { txid: string } | null {
  try {
    let response: GenericRequest;

    if (responseData.startsWith('verus://') || responseData.includes('://')) {
      response = GenericRequest.fromWalletDeeplinkUri(responseData);
    } else {
      response = GenericRequest.fromQrString(responseData);
    }

    // Extract IdentityUpdateResponseDetails from the first detail
    const detail = response.details[0];
    if (!(detail instanceof IdentityUpdateResponseOrdinalVDXFObject)) {
      console.error('Response does not contain identity update response');
      return null;
    }

    const responseDetails = detail.data as IdentityUpdateResponseDetails;
    const txidBuffer = responseDetails.txid;
    if (!txidBuffer) {
      console.error('No txid in response');
      return null;
    }

    // txid is stored in natural order, reverse for display
    const txid = Buffer.from(txidBuffer as unknown as Uint8Array).reverse().toString('hex');

    return { txid };
  } catch (err) {
    console.error('Error parsing GenericRequest response:', err);
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
