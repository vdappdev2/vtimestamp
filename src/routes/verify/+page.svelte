<script lang="ts">
  import { hashFile, hashString } from '$lib/hash';
  import FileUpload from '$lib/components/FileUpload.svelte';
  import { getTxExplorerUrl, getBlockExplorerUrl } from '$lib/vdxf';

  // Input mode: 'file' or 'text'
  let inputMode = $state<'file' | 'text'>('file');

  // Identity input
  let identity = $state('');

  // File state
  let selectedFile = $state<File | null>(null);
  let hashProgress = $state(0);

  // Text state
  let textContent = $state('');

  // Computed hash
  let computedHash = $state('');
  let isHashing = $state(false);

  // Verification state
  let isVerifying = $state(false);
  let verifyError = $state('');
  let verifyResult = $state<{
    verified: boolean;
    identity: string;
    message?: string;
    timestamp?: {
      sha256: string;
      title: string;
      description?: string;
      filename?: string;
      filesize?: number;
      blockhash: string;
      blockheight: number;
      blocktime?: number;
      txid: string;
    };
  } | null>(null);

  async function handleFileSelect(file: File) {
    selectedFile = file;
    computedHash = '';
    verifyResult = null;
    verifyError = '';
    isHashing = true;
    hashProgress = 0;

    try {
      const hash = await hashFile(file, (progress) => {
        hashProgress = progress;
      });
      computedHash = hash;
    } catch (err) {
      console.error('Hashing error:', err);
      verifyError = 'Failed to hash file';
    } finally {
      isHashing = false;
    }
  }

  async function handleTextChange() {
    if (!textContent.trim()) {
      computedHash = '';
      verifyResult = null;
      return;
    }

    isHashing = true;
    try {
      const hash = await hashString(textContent);
      computedHash = hash;
    } catch (err) {
      console.error('Hashing error:', err);
    } finally {
      isHashing = false;
    }
  }

  async function handleVerify() {
    if (!computedHash || !identity.trim()) {
      return;
    }

    isVerifying = true;
    verifyError = '';
    verifyResult = null;

    try {
      const res = await fetch(`/api/verify?identity=${encodeURIComponent(identity.trim())}&sha256=${computedHash}`);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Verification failed');
      }

      verifyResult = await res.json();
    } catch (err) {
      verifyError = err instanceof Error ? err.message : 'Verification failed';
    } finally {
      isVerifying = false;
    }
  }

  function switchMode(mode: 'file' | 'text') {
    inputMode = mode;
    selectedFile = null;
    textContent = '';
    computedHash = '';
    verifyResult = null;
    verifyError = '';
    hashProgress = 0;
  }

  function resetForm() {
    selectedFile = null;
    textContent = '';
    computedHash = '';
    verifyResult = null;
    verifyError = '';
    hashProgress = 0;
  }

  function formatDate(unixTimestamp: number): string {
    return new Date(unixTimestamp * 1000).toLocaleString();
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // Debounced text hashing
  let textHashTimeout: ReturnType<typeof setTimeout>;
  function onTextInput() {
    verifyResult = null;
    clearTimeout(textHashTimeout);
    textHashTimeout = setTimeout(handleTextChange, 500);
  }

  // Check if form is ready to verify
  let canVerify = $derived(computedHash && identity.trim() && !isHashing && !isVerifying);
</script>

<div class="max-w-2xl mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6">Verify Timestamp</h1>

  <!-- Identity Input -->
  <div class="card mb-6">
    <label for="identity" class="block text-sm font-medium mb-2">VerusID</label>
    <input
      type="text"
      id="identity"
      placeholder="username@ or i-address"
      class="input"
      bind:value={identity}
      onchange={() => { verifyResult = null; }}
    />
    <p class="text-secondary text-sm mt-2">
      Enter the VerusID that created the timestamp you want to verify.
    </p>
  </div>

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
            <span class="file-size">({formatFileSize(selectedFile.size)})</span>
          </div>
          <button class="btn-text" onclick={resetForm}>
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
        placeholder="Paste the exact text content you want to verify..."
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

  <!-- Verify Button -->
  <button
    class="btn btn-primary w-full mb-6"
    onclick={handleVerify}
    disabled={!canVerify}
  >
    {#if isVerifying}
      Verifying...
    {:else}
      Verify Timestamp
    {/if}
  </button>

  <!-- Error Display -->
  {#if verifyError}
    <div class="error-card mb-6">
      <p class="error-text">{verifyError}</p>
    </div>
  {/if}

  <!-- Verification Result -->
  {#if verifyResult}
    {#if verifyResult.verified && verifyResult.timestamp}
      <div class="success-card">
        <div class="success-header">
          <span class="success-icon">✓</span>
          <h2 class="success-title">Timestamp Verified</h2>
        </div>

        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">Identity</span>
            <span class="detail-value">{verifyResult.identity}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Title</span>
            <span class="detail-value">{verifyResult.timestamp.title}</span>
          </div>

          {#if verifyResult.timestamp.description}
            <div class="detail-row">
              <span class="detail-label">Description</span>
              <span class="detail-value">{verifyResult.timestamp.description}</span>
            </div>
          {/if}

          {#if verifyResult.timestamp.filename}
            <div class="detail-row">
              <span class="detail-label">Original Filename</span>
              <span class="detail-value">{verifyResult.timestamp.filename}</span>
            </div>
          {/if}

          {#if verifyResult.timestamp.filesize}
            <div class="detail-row">
              <span class="detail-label">Original File Size</span>
              <span class="detail-value">{formatFileSize(verifyResult.timestamp.filesize)}</span>
            </div>
          {/if}

          {#if verifyResult.timestamp.blocktime}
            <div class="detail-row">
              <span class="detail-label">Timestamp Date</span>
              <span class="detail-value">{formatDate(verifyResult.timestamp.blocktime)}</span>
            </div>
          {/if}

          <div class="detail-row">
            <span class="detail-label">Block Height</span>
            <span class="detail-value">{verifyResult.timestamp.blockheight.toLocaleString()}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">SHA-256 Hash</span>
            <code class="detail-hash">{verifyResult.timestamp.sha256}</code>
          </div>

          <div class="explorer-links">
            <a
              href={getTxExplorerUrl(verifyResult.timestamp.txid)}
              target="_blank"
              rel="noopener noreferrer"
              class="explorer-link"
            >
              View Transaction
            </a>
            <a
              href={getBlockExplorerUrl(verifyResult.timestamp.blockhash)}
              target="_blank"
              rel="noopener noreferrer"
              class="explorer-link"
            >
              View Block
            </a>
          </div>
        </div>
      </div>
    {:else}
      <div class="not-found-card">
        <div class="not-found-header">
          <span class="not-found-icon">✗</span>
          <h2 class="not-found-title">Timestamp Not Found</h2>
        </div>
        <p class="not-found-message">
          No timestamp was found for this content on identity <strong>{verifyResult.identity}</strong>.
        </p>
        <p class="not-found-hint">
          Make sure you're checking the correct identity and that the content matches exactly.
        </p>
      </div>
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

  .error-card {
    background-color: color-mix(in srgb, var(--color-error) 10%, var(--color-surface));
    border: 1px solid var(--color-error);
    border-radius: 8px;
    padding: 1rem;
  }

  .error-text {
    color: var(--color-error);
    margin: 0;
  }

  .success-card {
    background-color: color-mix(in srgb, #22c55e 10%, var(--color-surface));
    border: 1px solid #22c55e;
    border-radius: 12px;
    padding: 1.5rem;
  }

  .success-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .success-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background-color: #22c55e;
    color: white;
    border-radius: 50%;
    font-weight: bold;
  }

  .success-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #22c55e;
    margin: 0;
  }

  .result-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .detail-row {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .detail-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .detail-value {
    color: var(--color-text);
  }

  .detail-hash {
    font-family: ui-monospace, monospace;
    font-size: 0.75rem;
    background-color: var(--color-background);
    padding: 0.5rem;
    border-radius: 4px;
    word-break: break-all;
  }

  .explorer-links {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
  }

  .explorer-link {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 500;
  }

  .explorer-link:hover {
    text-decoration: underline;
  }

  .not-found-card {
    background-color: color-mix(in srgb, var(--color-error) 10%, var(--color-surface));
    border: 1px solid var(--color-error);
    border-radius: 12px;
    padding: 1.5rem;
  }

  .not-found-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .not-found-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background-color: var(--color-error);
    color: white;
    border-radius: 50%;
    font-weight: bold;
  }

  .not-found-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-error);
    margin: 0;
  }

  .not-found-message {
    color: var(--color-text);
    margin-bottom: 0.5rem;
  }

  .not-found-hint {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    margin: 0;
  }
</style>
