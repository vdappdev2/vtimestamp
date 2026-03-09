<script lang="ts">
  interface Props {
    qrDataUrl: string;
    deeplinkUri: string;
    title?: string;
    message?: string;
    onCancel: () => void;
  }

  let {
    qrDataUrl,
    deeplinkUri,
    title = 'Approve in Wallet',
    message = 'Scan with Verus Mobile or click to open:',
    onCancel,
  }: Props = $props();

  let copiedLink = $state(false);

  function openDeeplink() {
    if (deeplinkUri) {
      window.location.href = deeplinkUri;
    }
  }

  async function copyDeeplink() {
    try {
      await navigator.clipboard.writeText(deeplinkUri);
      copiedLink = true;
      setTimeout(() => { copiedLink = false; }, 2000);
    } catch (err) {
      console.error('Failed to copy deeplink:', err);
    }
  }
</script>

<div class="wallet-approval">
  <h3 class="approval-title">{title}</h3>
  <p class="approval-message">{message}</p>

  {#if qrDataUrl}
    <img src={qrDataUrl} alt="QR Code" class="qr-code" width="256" height="256" />
  {/if}

  <div class="approval-actions">
    <button class="btn btn-primary" onclick={openDeeplink}>
      Open in Verus Mobile
    </button>
    <button class="btn btn-secondary" onclick={onCancel}>
      Cancel
    </button>
  </div>
  <button class="copy-deeplink" onclick={copyDeeplink}>
    {copiedLink ? '✓ Copied!' : 'Copy deeplink'}
  </button>

  <p class="approval-status">
    Waiting for wallet approval...
  </p>
</div>

<style>
  .wallet-approval {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
  }

  .approval-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text);
  }

  .approval-message {
    color: var(--color-text-secondary);
    margin: 0;
    text-align: center;
  }

  .qr-code {
    border-radius: 8px;
    background: white;
    padding: 0.5rem;
  }

  .approval-actions {
    display: flex;
    gap: 0.75rem;
  }

  .btn-secondary {
    background-color: transparent;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
  }

  .btn-secondary:hover {
    background-color: var(--color-surface);
    border-color: var(--color-text-secondary);
  }

  .copy-deeplink {
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
    transition: color 0.15s ease;
  }

  .copy-deeplink:hover {
    color: var(--color-primary);
  }

  .approval-status {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    margin: 0;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
