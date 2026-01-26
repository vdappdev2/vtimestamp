<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import QRCode from 'qrcode';
  import { session, isLoggedIn, currentIdentityAddress } from '$lib/stores/session';
  import { hashFile, hashString } from '$lib/hash';
  import FileUpload from '$lib/components/FileUpload.svelte';
  import WalletApproval from '$lib/components/WalletApproval.svelte';

  // Input mode: 'file' or 'text'
  let inputMode = $state<'file' | 'text'>('file');

  // File state
  let selectedFile = $state<File | null>(null);
  let hashProgress = $state(0);

  // Text state
  let textContent = $state('');

  // Computed hash
  let computedHash = $state('');
  let isHashing = $state(false);

  // Duplicate check
  let duplicateInfo = $state<{ exists: boolean; title?: string } | null>(null);
  let isCheckingDuplicate = $state(false);

  // Form fields
  let title = $state('');
  let description = $state('');

  // Submission state
  let isSubmitting = $state(false);
  let submitError = $state('');

  // Wallet approval state
  let showWalletApproval = $state(false);
  let qrDataUrl = $state('');
  let deeplinkUri = $state('');
  let requestId = $state('');

  // Polling
  let pollingInterval: ReturnType<typeof setInterval> | null = null;

  onMount(() => {
    session.init();
  });

  onDestroy(() => {
    stopPolling();
  });

  function startPolling() {
    if (pollingInterval) return;

    pollingInterval = setInterval(async () => {
      if (!requestId) return;

      try {
        const res = await fetch(`/api/timestamp/status?requestId=${requestId}`);
        const data = await res.json();

        if (data.status === 'completed') {
          stopPolling();
          goto('/dashboard?created=true');
        } else if (data.status === 'expired') {
          stopPolling();
          submitError = 'Request expired. Please try again.';
          resetWalletApproval();
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 2000);
  }

  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  }

  function resetWalletApproval() {
    showWalletApproval = false;
    qrDataUrl = '';
    deeplinkUri = '';
    requestId = '';
  }

  async function handleFileSelect(file: File) {
    selectedFile = file;
    computedHash = '';
    duplicateInfo = null;
    isHashing = true;
    hashProgress = 0;

    try {
      const hash = await hashFile(file, (progress) => {
        hashProgress = progress;
      });
      computedHash = hash;

      // Auto-fill title with filename if empty
      if (!title) {
        title = file.name;
      }

      // Check for duplicate
      await checkDuplicate(hash);
    } catch (err) {
      console.error('Hashing error:', err);
      submitError = 'Failed to hash file';
    } finally {
      isHashing = false;
    }
  }

  async function handleTextChange() {
    if (!textContent.trim()) {
      computedHash = '';
      duplicateInfo = null;
      return;
    }

    isHashing = true;
    try {
      const hash = await hashString(textContent);
      computedHash = hash;
      await checkDuplicate(hash);
    } catch (err) {
      console.error('Hashing error:', err);
    } finally {
      isHashing = false;
    }
  }

  async function checkDuplicate(hash: string) {
    if (!$currentIdentityAddress) return;

    isCheckingDuplicate = true;
    try {
      const res = await fetch(`/api/timestamp/check?identity=${$currentIdentityAddress}&sha256=${hash}`);
      const data = await res.json();
      duplicateInfo = data;
    } catch (err) {
      console.error('Duplicate check error:', err);
    } finally {
      isCheckingDuplicate = false;
    }
  }

  async function handleSubmit() {
    if (!computedHash || !title.trim() || !$currentIdentityAddress) {
      return;
    }

    isSubmitting = true;
    submitError = '';

    try {
      const res = await fetch('/api/timestamp/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity: $currentIdentityAddress,
          sha256: computedHash,
          title: title.trim(),
          description: description.trim() || undefined,
          filename: selectedFile?.name,
          filesize: selectedFile?.size,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create timestamp request');
      }

      const data = await res.json();

      // Generate QR code
      qrDataUrl = await QRCode.toDataURL(data.deeplinkUri, {
        width: 256,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });

      deeplinkUri = data.deeplinkUri;
      requestId = data.requestId;
      showWalletApproval = true;

      // Start polling
      startPolling();
    } catch (err) {
      submitError = err instanceof Error ? err.message : 'Failed to create timestamp';
    } finally {
      isSubmitting = false;
    }
  }

  function handleCancelApproval() {
    stopPolling();
    resetWalletApproval();
  }

  function switchMode(mode: 'file' | 'text') {
    inputMode = mode;
    selectedFile = null;
    textContent = '';
    computedHash = '';
    duplicateInfo = null;
    hashProgress = 0;
  }

  // Debounced text hashing
  let textHashTimeout: ReturnType<typeof setTimeout>;
  function onTextInput() {
    clearTimeout(textHashTimeout);
    textHashTimeout = setTimeout(handleTextChange, 500);
  }
</script>

<div class="max-w-2xl mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6">Create Timestamp</h1>

  {#if !$isLoggedIn}
    <!-- Auth Guard -->
    <div class="card text-center py-12">
      <p class="text-secondary mb-4">Login required to create timestamps</p>
      <a href="/" class="btn btn-primary">Go to Home to Login</a>
    </div>
  {:else if showWalletApproval}
    <!-- Wallet Approval Modal -->
    <WalletApproval
      {qrDataUrl}
      {deeplinkUri}
      title="Approve Timestamp"
      message="Scan with Verus Mobile to approve this timestamp:"
      onCancel={handleCancelApproval}
    />
  {:else}
    <!-- Input Mode Toggle -->
    <div class="mode-toggle mb-6">
      <button
        class="mode-btn"
        class:active={inputMode === 'file'}
        onclick={() => switchMode('file')}
      >
        Upload File
      </button>
      <button
        class="mode-btn"
        class:active={inputMode === 'text'}
        onclick={() => switchMode('text')}
      >
        Paste Text
      </button>
    </div>

    <!-- File Upload Mode -->
    {#if inputMode === 'file'}
      <div class="mb-6">
        {#if selectedFile}
          <div class="selected-file card">
            <div class="file-info">
              <span class="file-name">{selectedFile.name}</span>
              <span class="file-size">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button
              class="btn-text"
              onclick={() => {
                selectedFile = null;
                computedHash = '';
                duplicateInfo = null;
              }}
            >
              Remove
            </button>
          </div>
        {:else}
          <FileUpload onFileSelect={handleFileSelect} disabled={isHashing} />
        {/if}
      </div>
    {:else}
      <!-- Text Input Mode -->
      <div class="mb-6">
        <textarea
          class="text-input"
          placeholder="Paste your text content here..."
          bind:value={textContent}
          oninput={onTextInput}
          rows="6"
        ></textarea>
      </div>
    {/if}

    <!-- Hash Progress -->
    {#if isHashing}
      <div class="mb-6">
        <div class="progress-bar">
          <div class="progress-fill" style="width: {hashProgress}%"></div>
        </div>
        <p class="text-secondary text-sm mt-2">Computing hash... {hashProgress}%</p>
      </div>
    {/if}

    <!-- Hash Display -->
    {#if computedHash}
      <div class="card mb-6">
        <span class="block text-sm font-medium mb-2">SHA-256 Hash</span>
        <code class="hash-display">{computedHash}</code>
      </div>
    {/if}

    <!-- Duplicate Warning -->
    {#if duplicateInfo?.exists}
      <div class="warning-card mb-6">
        <p class="warning-text">
          This content has already been timestamped as "{duplicateInfo.timestamp?.title}".
          You can still create this timestamp if needed.
        </p>
      </div>
    {/if}

    <!-- Metadata Form -->
    {#if computedHash}
      <div class="card mb-6">
        <div class="mb-4">
          <label for="title" class="block text-sm font-medium mb-2">
            Title <span class="text-error">*</span>
          </label>
          <input
            id="title"
            type="text"
            class="input"
            placeholder="Enter a title for this timestamp"
            bind:value={title}
          />
        </div>

        <div>
          <label for="description" class="block text-sm font-medium mb-2">
            Description (optional)
          </label>
          <textarea
            id="description"
            class="input"
            placeholder="Add an optional description"
            rows="3"
            bind:value={description}
          ></textarea>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        class="btn btn-primary w-full"
        onclick={handleSubmit}
        disabled={isSubmitting || !title.trim()}
      >
        {#if isSubmitting}
          Creating...
        {:else}
          Create Timestamp
        {/if}
      </button>
    {/if}

    <!-- Error Display -->
    {#if submitError}
      <p class="text-error text-center mt-4">{submitError}</p>
    {/if}
  {/if}
</div>

<style>
  .mode-toggle {
    display: flex;
    gap: 0.5rem;
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 0.25rem;
  }

  .mode-btn {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    background: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--color-text-secondary);
  }

  .mode-btn:hover {
    color: var(--color-text);
  }

  .mode-btn.active {
    background-color: var(--color-primary);
    color: white;
  }

  .selected-file {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .file-name {
    font-weight: 500;
    color: var(--color-text);
  }

  .file-size {
    color: var(--color-text-secondary);
  }

  .btn-text {
    background: none;
    border: none;
    color: var(--color-primary);
    cursor: pointer;
    font-weight: 500;
  }

  .btn-text:hover {
    text-decoration: underline;
  }

  .text-input {
    width: 100%;
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background-color: var(--color-surface);
    color: var(--color-text);
    font-family: inherit;
    font-size: 1rem;
    resize: vertical;
  }

  .text-input:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .progress-bar {
    height: 4px;
    background-color: var(--color-border);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background-color: var(--color-primary);
    transition: width 0.2s;
  }

  .hash-display {
    display: block;
    font-family: ui-monospace, monospace;
    font-size: 0.75rem;
    background-color: var(--color-background);
    padding: 0.75rem;
    border-radius: 6px;
    word-break: break-all;
  }

  .warning-card {
    background-color: color-mix(in srgb, var(--color-warning, #f59e0b) 10%, var(--color-surface));
    border: 1px solid var(--color-warning, #f59e0b);
    border-radius: 8px;
    padding: 1rem;
  }

  .warning-text {
    color: var(--color-warning, #f59e0b);
    margin: 0;
  }

  .input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background-color: var(--color-background);
    color: var(--color-text);
    font-size: 1rem;
  }

  .input:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .w-full {
    width: 100%;
  }

  .text-error {
    color: var(--color-error);
  }
</style>
