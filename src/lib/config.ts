/**
 * vtimestamp Configuration
 *
 * Central configuration for the vtimestamp MVP
 */

import { PUBLIC_VERUS_NETWORK, PUBLIC_SWITCH_NETWORK_URL } from '$env/static/public';

// Environment detection
export const isDev = import.meta.env.DEV;
export const isProd = import.meta.env.PROD;

/**
 * Verus RPC Configuration
 */
export const RPC_ENDPOINTS = {
  testnet: {
    primary: 'https://api.verustest.net',
    fallback: 'https://rpc.vrsc.syncproof.net',
  },
  mainnet: {
    primary: 'https://api.verus.services',
    fallback: 'https://rpc.vrsc.syncproof.net',
  },
};

// Current network - read from environment variable
export const CURRENT_NETWORK: 'testnet' | 'mainnet' =
  PUBLIC_VERUS_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';

// URL of the other network's deployment (for the switch link)
export const SWITCH_NETWORK_URL = PUBLIC_SWITCH_NETWORK_URL || '';

export const VERUS_RPC = {
  // Public daemon RPC endpoints (primary with fallback)
  endpoint: RPC_ENDPOINTS[CURRENT_NETWORK].primary,
  fallbackEndpoint: RPC_ENDPOINTS[CURRENT_NETWORK].fallback,

  // Chain ID
  chainId: CURRENT_NETWORK === 'testnet' ? 'vrsctest' : 'vrsc',

  // Request timeout in milliseconds
  timeout: 30000,
};

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

  // Labels (inside DataDescriptor)
  labels: {
    sha256: 'iBCkvv7KC18xd3P164Cvw1pxpLo5FyGEtm',      // .sha256
    title: 'iHXGu1nW4jQoeooBHPGE58qQGf9wMakEtj',       // .title
    description: 'iP1PCTTHPpktP26xTEu1BuwENWMHQaia4D', // .description
    filename: 'i4xgBqX9btMX8tnAjsyVFrgSLnigxPwBw5',    // .filename
    filesize: 'iRz2tyZZEwmrxRPSrwN8UTAC8g5KyVkBiE',   // .filesize
  },
};

// Mainnet VDXF Keys (TBD - will use different namespace)
const MAINNET_VDXF = {
  proofBasic: '', // TBD
  labels: {
    sha256: '',
    title: '',
    description: '',
    filename: '',
    filesize: '',
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
  version: '0.4.0',
  network: CURRENT_NETWORK,
};
