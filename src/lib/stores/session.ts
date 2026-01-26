/**
 * Session Store
 *
 * Manages user session state with localStorage persistence.
 * Sessions expire after 24 hours.
 */

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { SESSION_CONFIG } from '../config';

/**
 * Session data stored for authenticated users
 */
export interface SessionData {
  /** The user's i-address (e.g., "iQ18U7oU9c9NU2Weh87ER3a4D7ZRQq1PwE") */
  identity: string;
  /** Friendly name for display (e.g., "alice@") */
  friendlyName: string;
  /** Session creation timestamp (ms since epoch) */
  createdAt: number;
  /** Session expiry timestamp (ms since epoch) */
  expiresAt: number;
}

/**
 * Internal session state
 */
interface SessionState {
  /** Current session data, or null if not logged in */
  data: SessionData | null;
  /** Whether session has been loaded from storage */
  initialized: boolean;
}

/**
 * Load session from localStorage
 */
function loadSession(): SessionData | null {
  if (!browser) return null;

  try {
    const stored = localStorage.getItem(SESSION_CONFIG.storageKey);
    if (!stored) return null;

    const session: SessionData = JSON.parse(stored);

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_CONFIG.storageKey);
      return null;
    }

    return session;
  } catch {
    // Invalid JSON or other error - clear it
    localStorage.removeItem(SESSION_CONFIG.storageKey);
    return null;
  }
}

/**
 * Save session to localStorage
 */
function saveSession(session: SessionData): void {
  if (!browser) return;
  localStorage.setItem(SESSION_CONFIG.storageKey, JSON.stringify(session));
}

/**
 * Clear session from localStorage
 */
function clearSession(): void {
  if (!browser) return;
  localStorage.removeItem(SESSION_CONFIG.storageKey);
}

/**
 * Create the session store
 */
function createSessionStore() {
  const { subscribe, set, update } = writable<SessionState>({
    data: null,
    initialized: false,
  });

  return {
    subscribe,

    /**
     * Initialize the store by loading from localStorage
     * Call this once when the app starts (in +layout.svelte)
     */
    init() {
      const session = loadSession();
      set({ data: session, initialized: true });
    },

    /**
     * Log in with a new session
     */
    login(identity: string, friendlyName: string) {
      const now = Date.now();
      const session: SessionData = {
        identity,
        friendlyName,
        createdAt: now,
        expiresAt: now + SESSION_CONFIG.duration,
      };
      saveSession(session);
      set({ data: session, initialized: true });
    },

    /**
     * Log out and clear the session
     */
    logout() {
      clearSession();
      set({ data: null, initialized: true });
    },

    /**
     * Check if session is still valid (not expired)
     * Returns false if expired and clears the session
     */
    validate(): boolean {
      const state = get({ subscribe });
      if (!state.data) return false;

      if (Date.now() > state.data.expiresAt) {
        this.logout();
        return false;
      }

      return true;
    },

    /**
     * Get current session data (for use outside of reactive contexts)
     */
    getSession(): SessionData | null {
      return get({ subscribe }).data;
    },
  };
}

/**
 * The session store instance
 */
export const session = createSessionStore();

/**
 * Derived store: whether user is logged in
 */
export const isLoggedIn = derived(session, ($session) => $session.data !== null);

/**
 * Derived store: current user's friendly name for display (or null)
 */
export const currentIdentity = derived(session, ($session) => $session.data?.friendlyName ?? null);

/**
 * Derived store: current user's i-address (or null)
 */
export const currentIdentityAddress = derived(session, ($session) => $session.data?.identity ?? null);

/**
 * Derived store: whether session store has been initialized
 */
export const sessionInitialized = derived(session, ($session) => $session.initialized);
