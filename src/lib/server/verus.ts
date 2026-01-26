/**
 * Verus RPC Client (Server-Side Only)
 *
 * Handles communication with Verus daemon via JSON-RPC 1.0.
 * This module should only be imported in server-side code (+server.ts files).
 */

import { VERUS_RPC } from '../config';

/**
 * RPC Error with code and message from daemon
 */
export class VerusRpcError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = 'VerusRpcError';
    this.code = code;
  }
}

/**
 * Common RPC error codes
 */
export const RPC_ERROR_CODES = {
  IDENTITY_NOT_FOUND: -5,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
} as const;

/**
 * JSON-RPC 1.0 request structure
 */
interface RpcRequest {
  jsonrpc: '1.0';
  id: string;
  method: string;
  params: unknown[];
}

/**
 * JSON-RPC response structure
 */
interface RpcResponse<T> {
  result: T | null;
  error: { code: number; message: string } | null;
  id: string;
}

/**
 * Make a raw RPC call to a specific endpoint
 */
async function rpcCallToEndpoint<T>(
  endpoint: string,
  method: string,
  params: unknown[] = []
): Promise<T> {
  const request: RpcRequest = {
    jsonrpc: '1.0',
    id: `vtimestamp-${Date.now()}`,
    method,
    params,
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(VERUS_RPC.timeout),
  });

  if (!response.ok) {
    throw new Error(`RPC HTTP error: ${response.status} ${response.statusText}`);
  }

  const data: RpcResponse<T> = await response.json();

  if (data.error) {
    throw new VerusRpcError(data.error.code, data.error.message);
  }

  return data.result as T;
}

/**
 * Make a raw RPC call to Verus daemon with automatic fallback
 *
 * Tries the primary endpoint first, falls back to secondary on network errors.
 * RPC errors (like identity not found) are NOT retried on fallback.
 */
async function rpcCall<T>(method: string, params: unknown[] = []): Promise<T> {
  try {
    return await rpcCallToEndpoint<T>(VERUS_RPC.endpoint, method, params);
  } catch (error) {
    // Don't retry RPC errors (these are valid responses from the daemon)
    if (error instanceof VerusRpcError) {
      throw error;
    }

    // Try fallback for network/timeout errors
    if (VERUS_RPC.fallbackEndpoint) {
      console.log(`Primary RPC failed, trying fallback: ${VERUS_RPC.fallbackEndpoint}`);
      return await rpcCallToEndpoint<T>(VERUS_RPC.fallbackEndpoint, method, params);
    }

    throw error;
  }
}

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * DataDescriptor structure from contentmultimap
 */
export interface DataDescriptor {
  version: number;
  flags: number;
  objectdata: { message: string } | number | null;
  label?: string;
  mimetype?: string;
}

/**
 * Wrapper containing a DataDescriptor
 */
export interface DataDescriptorWrapper {
  [wrapperKey: string]: DataDescriptor;
}

/**
 * ContentMultiMap structure
 */
export interface ContentMultiMap {
  [outerKey: string]: DataDescriptorWrapper[];
}

/**
 * Identity structure within history entry
 */
export interface IdentityData {
  version: number;
  flags: number;
  name: string;
  identityaddress: string;
  parent: string;
  contentmultimap?: ContentMultiMap;
}

/**
 * Single history entry from getidentityhistory
 */
export interface IdentityHistoryEntry {
  identity: IdentityData;
  blockhash: string;
  height: number;
  output: {
    txid: string;
    voutnum: number;
  };
}

/**
 * Response from getidentityhistory
 */
export interface IdentityHistoryResponse {
  fullyqualifiedname: string;
  status: string;
  history: IdentityHistoryEntry[];
}

/**
 * Block data from getblock
 */
export interface BlockData {
  hash: string;
  height: number;
  time: number;
  // Other fields omitted for brevity
}

// ============================================================================
// RPC Methods
// ============================================================================

/**
 * Get identity history with all updates
 *
 * Each history entry contains blockhash and height for that specific update,
 * allowing us to determine when each timestamp was created.
 *
 * @param identity - Identity name (e.g., "alice@" or "sub.alice@")
 * @param heightStart - Optional start height (default: 0)
 * @param heightEnd - Optional end height (default: 0 = current)
 * @returns Identity history with all update entries
 * @throws VerusRpcError with code -5 if identity not found
 */
export async function getIdentityHistory(
  identity: string,
  heightStart: number = 0,
  heightEnd: number = 0
): Promise<IdentityHistoryResponse> {
  const params: unknown[] = [identity];
  if (heightStart > 0 || heightEnd > 0) {
    params.push(heightStart, heightEnd);
  }

  return rpcCall<IdentityHistoryResponse>('getidentityhistory', params);
}

/**
 * Get block data by hash
 *
 * Used to get the timestamp (time field) for a specific block.
 *
 * @param blockhash - Block hash
 * @returns Block data including time
 */
export async function getBlock(blockhash: string): Promise<BlockData> {
  return rpcCall<BlockData>('getblock', [blockhash]);
}

/**
 * Get current block count (chain height)
 *
 * @returns Current block height
 */
export async function getBlockCount(): Promise<number> {
  return rpcCall<number>('getblockcount', []);
}

/**
 * Check if RPC endpoint is reachable
 *
 * @returns true if endpoint responds, false otherwise
 */
export async function checkConnection(): Promise<boolean> {
  try {
    await getBlockCount();
    return true;
  } catch {
    return false;
  }
}

/**
 * Response from getidentity
 */
export interface GetIdentityResponse {
  friendlyname: string;
  fullyqualifiedname: string;
  identity: IdentityData;
  status: string;
  canspendfor: boolean;
  cansignfor: boolean;
  blockheight: number;
  txid: string;
  vout: number;
}

/**
 * Get identity by name or i-address
 *
 * @param identity - Identity name (e.g., "alice@") or i-address
 * @returns Identity data including friendlyname
 * @throws VerusRpcError with code -5 if identity not found
 */
export async function getIdentity(identity: string): Promise<GetIdentityResponse> {
  return rpcCall<GetIdentityResponse>('getidentity', [identity]);
}
