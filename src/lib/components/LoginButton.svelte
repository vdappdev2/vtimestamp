<script lang="ts">
  import { session, isLoggedIn, currentIdentity } from '$lib/stores/session';
  import { onMount, onDestroy } from 'svelte';
  import QRCode from 'qrcode';

  // State for login flow
  let loading = $state(false);
  let error = $state('');
  let qrString = $state('');
  let qrDataUrl = $state('');
  let deeplinkUri = $state('');
  let challengeId = $state('');
  let showQR = $state(false);

  // Polling interval reference
  let pollingInterval: ReturnType<typeof setInterval> | null = null;

  // Check for auth callback on mount
  onMount(() => {
    // Initialize session from localStorage
    session.init();

    // Check for auth success in URL params (legacy redirect callback)
    const params = new URLSearchParams(window.location.search);
    const authSuccess = params.get('auth_success');

    if (authSuccess) {
      try {
        const data = JSON.parse(decodeURIComponent(authSuccess));
        session.login(data.identity, data.friendlyName);
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      } catch (e) {
        console.error('Failed to parse auth success data:', e);
      }
    }

    // Check for error in URL params
    const authError = params.get('error');
    if (authError) {
      error = authError.replace(/_/g, ' ');
      window.history.replaceState({}, '', window.location.pathname);
    }
  });

  // Cleanup polling on component destroy
  onDestroy(() => {
    stopPolling();
  });

  function startPolling() {
    if (pollingInterval) return;

    pollingInterval = setInterval(async () => {
      if (!challengeId) return;

      try {
        const res = await fetch(`/api/auth/status?challengeId=${challengeId}`);
        const data = await res.json();

        if (data.status === 'completed') {
          // Auth successful - log in and clean up
          stopPolling();
          session.login(data.identity, data.friendlyName);
          resetLoginState();
        } else if (data.status === 'expired') {
          // Challenge expired
          stopPolling();
          error = 'Login session expired. Please try again.';
          resetLoginState();
        }
        // 'pending' status - keep polling
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 2000); // Poll every 2 seconds
  }

  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  }

  function resetLoginState() {
    showQR = false;
    qrString = '';
    qrDataUrl = '';
    deeplinkUri = '';
    challengeId = '';
  }

  async function initiateLogin() {
    loading = true;
    error = '';
    resetLoginState();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to initiate login');
      }

      const data = await res.json();
      qrString = data.qrString;
      deeplinkUri = data.deeplinkUri;
      challengeId = data.challengeId;

      // Generate QR code image from deeplink URI (so phones recognize it as app link)
      qrDataUrl = await QRCode.toDataURL(deeplinkUri, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      showQR = true;

      // Start polling for auth completion
      startPolling();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Login failed';
    } finally {
      loading = false;
    }
  }

  function openDeeplink() {
    if (deeplinkUri) {
      window.location.href = deeplinkUri;
    }
  }

  function logout() {
    session.logout();
    stopPolling();
    resetLoginState();
  }

  function cancelLogin() {
    stopPolling();
    resetLoginState();
  }
</script>

<div class="flex flex-col items-center gap-3">
  {#if $isLoggedIn}
    <div class="flex items-center gap-3">
      <span class="font-medium" style="color: var(--color-primary);">{$currentIdentity}</span>
      <button
        class="nav-btn"
        onclick={logout}
      >
        Logout
      </button>
    </div>
  {:else if showQR}
    <div
      class="flex flex-col items-center gap-4 p-6 rounded-xl"
      style="background-color: var(--color-surface); border: 1px solid var(--color-border);"
    >
      <p class="text-sm" style="color: var(--color-text-secondary);">
        Scan with Verus Mobile or click to open:
      </p>
      {#if qrDataUrl}
        <img src={qrDataUrl} alt="Login QR Code" class="rounded-lg" width="256" height="256" />
      {/if}
      <div class="flex gap-3">
        <button class="btn btn-primary" onclick={openDeeplink}>
          Open in Verus Mobile
        </button>
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
          style="background-color: transparent; color: var(--color-text-secondary); border: 1px solid var(--color-border);"
          onclick={cancelLogin}
        >
          Cancel
        </button>
      </div>
    </div>
  {:else}
    <button class="btn btn-primary" onclick={initiateLogin} disabled={loading}>
      {#if loading}
        Connecting...
      {:else}
        Login with VerusID
      {/if}
    </button>
  {/if}

  {#if error}
    <p class="text-sm" style="color: var(--color-error);">{error}</p>
  {/if}
</div>
