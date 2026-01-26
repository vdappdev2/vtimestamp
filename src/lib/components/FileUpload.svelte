<script lang="ts">
  interface Props {
    onFileSelect: (file: File) => void;
    disabled?: boolean;
    accept?: string;
  }

  let { onFileSelect, disabled = false, accept = '*' }: Props = $props();

  let isDragging = $state(false);
  let fileInput: HTMLInputElement;

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (!disabled) {
      isDragging = true;
    }
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;

    if (disabled) return;

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }

  function handleFileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }

  function triggerFileInput() {
    if (!disabled) {
      fileInput.click();
    }
  }
</script>

<div
  role="button"
  tabindex="0"
  class="file-upload-zone"
  class:dragging={isDragging}
  class:disabled={disabled}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  onclick={triggerFileInput}
  onkeydown={(e) => e.key === 'Enter' && triggerFileInput()}
>
  <input
    bind:this={fileInput}
    type="file"
    {accept}
    onchange={handleFileInput}
    {disabled}
    class="hidden"
  />

  <div class="upload-content">
    <svg
      class="upload-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
    <p class="upload-text">
      <span class="font-medium">Click to upload</span> or drag and drop
    </p>
    <p class="upload-hint">Any file type supported</p>
  </div>
</div>

<style>
  .file-upload-zone {
    border: 2px dashed var(--color-border);
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: var(--color-surface);
  }

  .file-upload-zone:hover:not(.disabled) {
    border-color: var(--color-primary);
    background-color: color-mix(in srgb, var(--color-primary) 5%, var(--color-surface));
  }

  .file-upload-zone.dragging {
    border-color: var(--color-primary);
    background-color: color-mix(in srgb, var(--color-primary) 10%, var(--color-surface));
  }

  .file-upload-zone.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .upload-icon {
    color: var(--color-text-secondary);
    margin-bottom: 0.5rem;
  }

  .dragging .upload-icon,
  .file-upload-zone:hover:not(.disabled) .upload-icon {
    color: var(--color-primary);
  }

  .upload-text {
    color: var(--color-text);
    margin: 0;
  }

  .upload-hint {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    margin: 0;
  }

  .hidden {
    display: none;
  }
</style>
