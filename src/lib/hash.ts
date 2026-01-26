/**
 * Client-Side Hashing Utilities
 *
 * Uses Web Crypto API for secure SHA-256 hashing in the browser.
 * All hashing is done client-side - files never leave the user's device.
 */

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash a string using SHA-256
 *
 * @param text - Text to hash
 * @returns SHA-256 hash as 64-character lowercase hex string
 */
export async function hashString(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

/**
 * Hash a File using SHA-256
 *
 * Reads the file in chunks to handle large files efficiently.
 *
 * @param file - File to hash
 * @param onProgress - Optional progress callback (0-100)
 * @returns SHA-256 hash as 64-character lowercase hex string
 */
export async function hashFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  // For small files, read all at once
  if (file.size < 10 * 1024 * 1024) {
    // < 10MB
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    onProgress?.(100);
    return bufferToHex(hashBuffer);
  }

  // For larger files, use streaming approach
  // Note: SubtleCrypto doesn't support streaming directly,
  // so we use a chunked approach with a library-free implementation

  const chunkSize = 64 * 1024 * 1024; // 64MB chunks
  const chunks: ArrayBuffer[] = [];
  let offset = 0;

  while (offset < file.size) {
    const slice = file.slice(offset, offset + chunkSize);
    const buffer = await slice.arrayBuffer();
    chunks.push(buffer);
    offset += chunkSize;
    onProgress?.(Math.min(99, Math.round((offset / file.size) * 100)));
  }

  // Concatenate all chunks
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const combined = new Uint8Array(totalLength);
  let position = 0;
  for (const chunk of chunks) {
    combined.set(new Uint8Array(chunk), position);
    position += chunk.byteLength;
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  onProgress?.(100);
  return bufferToHex(hashBuffer);
}

/**
 * Hash an ArrayBuffer using SHA-256
 *
 * @param buffer - ArrayBuffer to hash
 * @returns SHA-256 hash as 64-character lowercase hex string
 */
export async function hashBuffer(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return bufferToHex(hashBuffer);
}

/**
 * Verify that a hash matches a file
 *
 * @param file - File to verify
 * @param expectedHash - Expected SHA-256 hash (case-insensitive)
 * @param onProgress - Optional progress callback
 * @returns true if hash matches
 */
export async function verifyFileHash(
  file: File,
  expectedHash: string,
  onProgress?: (percent: number) => void
): Promise<boolean> {
  const actualHash = await hashFile(file, onProgress);
  return actualHash.toLowerCase() === expectedHash.toLowerCase();
}

/**
 * Verify that a hash matches a string
 *
 * @param text - Text to verify
 * @param expectedHash - Expected SHA-256 hash (case-insensitive)
 * @returns true if hash matches
 */
export async function verifyStringHash(text: string, expectedHash: string): Promise<boolean> {
  const actualHash = await hashString(text);
  return actualHash.toLowerCase() === expectedHash.toLowerCase();
}
