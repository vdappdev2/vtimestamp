/**
 * vtimestamp Configuration
 *
 * Central configuration for the vtimestamp MVP
 */

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

// Current network (change to 'mainnet' for production)
export const CURRENT_NETWORK: 'testnet' | 'mainnet' = 'testnet';

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
 *
 * Full key reference: documentation/vtimestamp_vdxf_keys.md
 */

// Testnet VDXF Keys (testidx.vrsc:: namespace)
const TESTNET_VDXF = {
  // Outer key: testidx.vrsc::timestamp.proof
  timestampProof: 'iLeir1axD1rL5U8Rr2bXXatn5WxXZwZMhJ',

  // Labels (inside DataDescriptor)
  labels: {
    sha256: 'iQtu5fBXoin42zMHAjKQaQsydV2qREko3s',      // .sha256
    title: 'i5qsAsbxfCUWurxW2uXsemrxumu1gtKoBS',       // .title
    description: 'iHkJUXJfk74wr7ic2pmNkFj7TGvmoCNqcv', // .description
    filename: 'iEyMgwmBuxc5Bhb5H5d8oWHs588Bng3UQ4',    // .filename
    filesize: 'iLpPqXLkyk4ktPKtSFtKBzEwCDWXwQxVVw',   // .filesize
  },
};

// Mainnet VDXF Keys (TBD - will use different namespace)
const MAINNET_VDXF = {
  timestampProof: '', // TBD
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
  version: '0.1.0',
  network: CURRENT_NETWORK,
};
