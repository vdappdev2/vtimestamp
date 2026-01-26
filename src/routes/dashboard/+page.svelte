<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { session, isLoggedIn, currentIdentityAddress } from '$lib/stores/session';
  import TimestampCard from '$lib/components/TimestampCard.svelte';
  import type { TimestampRecord } from '$lib/vdxf';

  // Timestamps state
  let timestamps = $state<TimestampRecord[]>([]);
  let isLoading = $state(true);
  let loadError = $state('');

  // Toast state
  let showToast = $state(false);
  let toastMessage = $state('');

  onMount(() => {
    session.init();

    // Check for success redirect
    const created = $page.url.searchParams.get('created');
    if (created === 'true') {
      showSuccessToast('Timestamp created successfully!');
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');
    }
  });

  // Load timestamps when identity changes
  $effect(() => {
    if ($currentIdentityAddress) {
      loadTimestamps();
    } else {
      timestamps = [];
      isLoading = false;
    }
  });

  async function loadTimestamps() {
    if (!$currentIdentityAddress) return;

    isLoading = true;
    loadError = '';

    try {
      const res = await fetch(`/api/timestamps?identity=${$currentIdentityAddress}`);
      const data = await res.json();

      if (data.success) {
        timestamps = data.timestamps;
      } else {
        loadError = 'Failed to load timestamps';
      }
    } catch (err) {
      console.error('Error loading timestamps:', err);
      loadError = 'Failed to load timestamps';
    } finally {
      isLoading = false;
    }
  }

  function showSuccessToast(message: string) {
    toastMessage = message;
    showToast = true;
    setTimeout(() => {
      showToast = false;
    }, 5000);
  }
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-3xl font-bold">My Timestamps</h1>
    {#if $isLoggedIn}
      <div class="flex gap-3">
        <button
          class="btn btn-secondary"
          onclick={loadTimestamps}
          disabled={isLoading}
        >
          Refresh
        </button>
        <a href="/create" class="btn btn-primary">
          Create New
        </a>
      </div>
    {/if}
  </div>

  {#if !$isLoggedIn}
    <!-- Auth Guard -->
    <div class="card text-center py-12">
      <p class="text-secondary mb-4">Login required to view your timestamps</p>
      <a href="/" class="btn btn-primary">Go to Home to Login</a>
    </div>
  {:else if isLoading}
    <!-- Loading State -->
    <div class="card text-center py-12">
      <div class="spinner mb-4"></div>
      <p class="text-secondary">Loading your timestamps...</p>
    </div>
  {:else if loadError}
    <!-- Error State -->
    <div class="card text-center py-12">
      <p class="text-error mb-4">{loadError}</p>
      <button class="btn btn-primary" onclick={loadTimestamps}>
        Try Again
      </button>
    </div>
  {:else if timestamps.length === 0}
    <!-- Empty State -->
    <div class="card text-center py-12">
      <svg
        class="mx-auto mb-4 text-secondary"
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <p class="text-secondary mb-4">You haven't created any timestamps yet</p>
      <a href="/create" class="btn btn-primary">Create Your First Timestamp</a>
    </div>
  {:else}
    <!-- Timestamp List -->
    <div class="timestamps-list">
      {#each timestamps as timestamp (timestamp.txid)}
        <TimestampCard {timestamp} />
      {/each}
    </div>
  {/if}
</div>

<!-- Success Toast -->
{#if showToast}
  <div class="toast">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
    <span>{toastMessage}</span>
  </div>
{/if}

<style>
  .timestamps-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .btn-secondary {
    background-color: transparent;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-secondary:hover:not(:disabled) {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .text-error {
    color: var(--color-error);
  }

  .toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background-color: var(--color-primary);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(1rem);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
</style>
