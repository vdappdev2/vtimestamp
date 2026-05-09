/**
 * vtimestamp Configuration
 *
 * Central configuration for the vtimestamp MVP
 */

import { PUBLIC_VERUS_NETWORK, PUBLIC_SWITCH_NETWORK_URL } from '$env/static/public';

// Environment detection
export const isDev = import.meta.env.DEV;
export const isProd = import.meta.env.PROD;

// Current network - read from environment variable
export const CURRENT_NETWORK: 'testnet' | 'mainnet' =
  PUBLIC_VERUS_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';

// URL of the other network's deployment (for the switch link)
export const SWITCH_NETWORK_URL = PUBLIC_SWITCH_NETWORK_URL || '';

// RPC endpoint configuration lives in lib/server/rpc-config.ts because it
// reads from $env/dynamic/private (server-only) and config.ts is also
// imported by client code. See that file for the env-var contract.

/**
 * VDXF Key Constants
 *
 * These are the VDXF keys (i-addresses) used for storing timestamp data.
 * Using i-addresses instead of friendly names for consistency.
 */

// Testnet VDXF Keys (testidx.vrsctest:: namespace)
const TESTNET_VDXF = {
  // Outer key: testidx.vrsctest::proof.basic
  proofBasic: 'i6UD4js3jqyjz9Mttmbk2Sh4eCuwLKPLyQ',
  // FQN form — used as the outer contentmultimap key when building an
  // IdentityUpdateRequest. Verus Mobile accepts custom keys only when passed
  // as FQN (namespace must match the signing identity).
  proofBasicFqn: 'testidx.vrsctest::proof.basic',

  // Labels (inside DataDescriptor)
  labels: {
    sha256: 'iBCkvv7KC18xd3P164Cvw1pxpLo5FyGEtm',      // .sha256
    title: 'iHXGu1nW4jQoeooBHPGE58qQGf9wMakEtj',       // .title
    description: 'iP1PCTTHPpktP26xTEu1BuwENWMHQaia4D', // .description
    filename: 'i4xgBqX9btMX8tnAjsyVFrgSLnigxPwBw5',    // .filename
    filesize: 'iRz2tyZZEwmrxRPSrwN8UTAC8g5KyVkBiE',   // .filesize
  },
};

// Mainnet VDXF Keys (vtimestamp.vrsc:: namespace)
const MAINNET_VDXF = {
  // Outer key: vtimestamp.vrsc::proof.basic
  proofBasic: 'iJvkQ3uTKmRoFiE3rtP8YJxryLBKu8enmX',
  proofBasicFqn: 'vtimestamp.vrsc::proof.basic',

  // Labels (inside DataDescriptor)
  labels: {
    sha256: 'iPRekBwQwFxNHf6mE68n8i2iXEnVdk1hw8',      // .sha256
    title: 'iJx4aJf4SRByyNAi4Z93FC7QNaysyU5mdP',       // .title
    description: 'iS8HnXSHWPL7GLkxYS4SpC7QW2Bnyp93T2', // .description
    filename: 'iBTcwxUDgvqGXGMC26U52522HrsXC8ggoC',    // .filename
    filesize: 'iHBnDKDyKbXeizg322cxLUps7Uodc1udF4',   // .filesize
  },
};

export const VDXF_KEYS = {
  // DataDescriptor wrapper key (same for testnet and mainnet)
  dataDescriptor: 'i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv',

  // Network-specific keys
  ...(CURRENT_NETWORK === 'testnet' ? TESTNET_VDXF : MAINNET_VDXF),
};

/**
 * Session Configuration
 */
export const SESSION_CONFIG = {
  // Session duration in milliseconds (24 hours)
  duration: 24 * 60 * 60 * 1000,

  // LocalStorage key for session data
  storageKey: 'vtimestamp_session',
};

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  // Maximum file size for hashing (no limit for hash-only mode)
  // This is just for UI feedback, not enforced
  recommendedMaxFileSize: 100 * 1024 * 1024, // 100MB

  // Rate limiting for verification requests (per minute)
  verifyRateLimit: 10,
};

/**
 * App Metadata
 */
export const APP_META = {
  name: 'vtimestamp',
  description: 'Decentralized timestamp service on Verus blockchain',
  version: '0.5.0',
  network: CURRENT_NETWORK,
};
