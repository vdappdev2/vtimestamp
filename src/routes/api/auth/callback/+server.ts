/**
 * Auth Callback Endpoint
 *
 * Receives and verifies the login consent response from the wallet.
 * The wallet sends the signed response here after user approves.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyLoginResponse } from '$lib/server/auth';

/**
 * Handle POST callback from wallet (for API/programmatic use)
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';

    let responseData: string;

    if (contentType.includes('application/json')) {
      // JSON body with response field
      const body = await request.json();
      responseData = body.response;
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      // Form data
      const formData = await request.formData();
      responseData = formData.get('response') as string;
    } else {
      // Raw body (base64 string)
      responseData = await request.text();
    }

    if (!responseData) {
      throw error(400, 'Missing response data');
    }

    const result = await verifyLoginResponse(responseData);

    if (!result) {
      return json({
        success: false,
        error: 'Invalid or expired login response',
      }, { status: 401 });
    }

    // Return the verified identity info
    // The client will use this to establish the session
    return json({
      success: true,
      identity: result.identity,
      friendlyName: result.friendlyName,
    });
  } catch (err) {
    console.error('Error processing auth callback:', err);
    throw error(500, 'Failed to process authentication');
  }
};

/**
 * Handle GET callback (for redirect-based flow from wallet)
 * The wallet redirects here with the response in query params.
 * We verify and store the result; the desktop browser polls for it.
 */
export const GET: RequestHandler = async ({ url }) => {
  try {
    // Try to get response from query params
    // The wallet might send it as a base64 string or in a specific param
    let responseData: string | null = null;

    // Check common parameter names
    for (const param of ['response', 'data', 'auth']) {
      const value = url.searchParams.get(param);
      if (value) {
        responseData = value;
        break;
      }
    }

    // Also check for the deeplink format params (i-address keys)
    if (!responseData) {
      for (const [key, value] of url.searchParams) {
        if (key.startsWith('i') && key.length > 30) {
          // This looks like a vdxf key parameter
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

    const result = await verifyLoginResponse(responseData);

    if (!result) {
      return new Response(errorPage('Invalid or expired login response'), {
        status: 401,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Success - the result is now stored in completedAuths
    // The desktop browser will poll and pick it up
    return new Response(successPage(), {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (err) {
    console.error('Error processing auth callback GET:', err);
    return new Response(errorPage('Authentication failed'), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
};

function successPage(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login Successful</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
    .card { background: white; padding: 2rem; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #22c55e; margin: 0 0 0.5rem; }
    p { color: #666; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Login Successful</h1>
    <p>You can close this tab and return to your browser.</p>
  </div>
</body>
</html>`;
}

function errorPage(message: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login Failed</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
    .card { background: white; padding: 2rem; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #ef4444; margin: 0 0 0.5rem; }
    p { color: #666; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Login Failed</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
