/**
 * Server-side Verus RPC configuration.
 *
 * Endpoint list is overridable via the `VERUS_RPC_ENDPOINTS` env var, a
 * comma-separated list of URLs tried in order on network errors. RPC errors
 * (-5 not found, -32601 method not whitelisted) are not retried — they're
 * authoritative. Whitespace around URLs is trimmed; empty entries are
 * dropped. If unset, falls back to per-network defaults below.
 *
 * Network defaults:
 * - Mainnet primary is `rpc.vrsc.syncproof.net` because it has `decryptdata`
 *   whitelisted; `api.verus.services` is the fallback (no decryptdata, but
 *   covers network-level outages on syncproof).
 * - Testnet has no public endpoint with `decryptdata` enabled. Encrypted
 *   reads on testnet require `VERUS_RPC_ENDPOINTS=http://127.0.0.1:<port>`
 *   pointing at a local vrsctest daemon. See workspace-root
 *   `transition_plan.md` for the constraint.
 *
 * Server-only — kept out of `lib/config.ts` because that module is also
 * imported by client code; `$env/dynamic/private` would break the client
 * bundle.
 */

import { env } from '$env/dynamic/private';
import { CURRENT_NETWORK } from '../config';

const NETWORK_DEFAULTS: Record<'testnet' | 'mainnet', readonly string[]> = {
  testnet: ['https://api.verustest.net'],
  mainnet: ['https://rpc.vrsc.syncproof.net', 'https://api.verus.services'],
};

function parseEndpoints(): string[] {
  const raw = env.VERUS_RPC_ENDPOINTS?.trim();
  if (raw) {
    const parts = raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (parts.length > 0) return parts;
  }
  return [...NETWORK_DEFAULTS[CURRENT_NETWORK]];
}

export const VERUS_RPC = {
  endpoints: parseEndpoints(),
  chainId: CURRENT_NETWORK === 'testnet' ? 'vrsctest' : 'vrsc',
  timeout: 30_000,
} as const;
