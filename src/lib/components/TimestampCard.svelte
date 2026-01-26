<script lang="ts">
  import type { TimestampRecord } from '$lib/vdxf';
  import { formatBlockTime, getBlockExplorerUrl, getTxExplorerUrl } from '$lib/vdxf';

  interface Props {
    timestamp: TimestampRecord;
  }

  let { timestamp }: Props = $props();

  let expanded = $state(false);
  let copied = $state(false);

  function toggleExpanded() {
    expanded = !expanded;
  }

  async function copyHash() {
    try {
      await navigator.clipboard.writeText(timestamp.data.sha256);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
</script>

<div class="timestamp-card">
  <button class="card-header" onclick={toggleExpanded}>
    <div class="header-content">
      <h3 class="card-title">{timestamp.data.title}</h3>
      {#if timestamp.blocktime}
        <p class="card-date">{formatBlockTime(timestamp.blocktime)}</p>
      {:else}
        <p class="card-date">Block #{timestamp.blockheight}</p>
      {/if}
    </div>
    <svg
      class="expand-icon"
      class:expanded
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </button>

  {#if expanded}
    <div class="card-details">
      <div class="detail-row">
        <span class="detail-label">SHA-256 Hash</span>
        <div class="hash-container">
          <code class="hash-value">{timestamp.data.sha256}</code>
          <button class="copy-btn" onclick={copyHash} title="Copy hash">
            {#if copied}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            {/if}
          </button>
        </div>
      </div>

      {#if timestamp.data.description}
        <div class="detail-row">
          <span class="detail-label">Description</span>
          <span class="detail-value">{timestamp.data.description}</span>
        </div>
      {/if}

      {#if timestamp.data.filename}
        <div class="detail-row">
          <span class="detail-label">Original File</span>
          <span class="detail-value">
            {timestamp.data.filename}
            {#if timestamp.data.filesize}
              ({formatFileSize(timestamp.data.filesize)})
            {/if}
          </span>
        </div>
      {/if}

      <div class="detail-row">
        <span class="detail-label">Block</span>
        <a href={getBlockExplorerUrl(timestamp.blockhash)} target="_blank" rel="noopener" class="detail-link">
          #{timestamp.blockheight}
        </a>
      </div>

      <div class="detail-row">
        <span class="detail-label">Transaction</span>
        <a href={getTxExplorerUrl(timestamp.txid)} target="_blank" rel="noopener" class="detail-link">
          {timestamp.txid.slice(0, 8)}...{timestamp.txid.slice(-8)}
        </a>
      </div>
    </div>
  {/if}
</div>

<style>
  .timestamp-card {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    overflow: hidden;
  }

  .card-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.2s;
  }

  .card-header:hover {
    background-color: color-mix(in srgb, var(--color-primary) 5%, var(--color-surface));
  }

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .card-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text);
  }

  .card-date {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .expand-icon {
    color: var(--color-text-secondary);
    transition: transform 0.2s;
    flex-shrink: 0;
  }

  .expand-icon.expanded {
    transform: rotate(180deg);
  }

  .card-details {
    padding: 0 1.25rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    border-top: 1px solid var(--color-border);
    padding-top: 1rem;
  }

  .detail-row {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .detail-label {
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-secondary);
  }

  .detail-value {
    color: var(--color-text);
  }

  .hash-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .hash-value {
    font-family: ui-monospace, monospace;
    font-size: 0.75rem;
    background-color: var(--color-background);
    padding: 0.5rem;
    border-radius: 6px;
    word-break: break-all;
    flex: 1;
  }

  .copy-btn {
    padding: 0.5rem;
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .copy-btn:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .detail-link {
    color: var(--color-primary);
    text-decoration: none;
  }

  .detail-link:hover {
    text-decoration: underline;
  }
</style>
