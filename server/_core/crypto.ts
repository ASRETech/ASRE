/**
 * server/_core/crypto.ts
 * AES-256-GCM application-layer encryption for sensitive OAuth tokens.
 *
 * Usage:
 *   encryptToken(plaintext)  → "<ivHex>:<tagHex>:<ciphertextHex>"
 *   decryptToken(ciphertext) → original plaintext string
 *
 * Environment variable required:
 *   TOKEN_ENCRYPTION_KEY — 64-character hex string (32 bytes)
 *   Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *
 * Migration note: tokens written before this change are stored as plaintext.
 * The decryptToken function detects legacy plaintext (no colons in the expected
 * iv:tag:data format) and returns it as-is so existing sessions continue to
 * work until the next OAuth refresh re-encrypts the token.
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const hex = process.env.TOKEN_ENCRYPTION_KEY;
  if (!hex) {
    // In development without the key set, fall back to a deterministic dev key
    // so the app starts.  Production Railway deployments MUST set TOKEN_ENCRYPTION_KEY.
    if (process.env.NODE_ENV !== "production") {
      return Buffer.alloc(32, 0); // 32 zero bytes — dev only
    }
    throw new Error(
      "TOKEN_ENCRYPTION_KEY environment variable is not set. " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)."
    );
  }
  return key;
}

/**
 * Encrypt a plaintext token string.
 * Returns a colon-delimited string: "<ivHex>:<authTagHex>:<ciphertextHex>"
 */
export function encryptToken(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypt a token previously encrypted with encryptToken().
 * Handles legacy plaintext tokens gracefully (returns them unchanged).
 */
export function decryptToken(ciphertext: string): string {
  // Legacy plaintext detection: encrypted tokens always contain exactly 2 colons
  const parts = ciphertext.split(":");
  if (parts.length !== 3) {
    // Not in our encrypted format — treat as legacy plaintext
    return ciphertext;
  }

  const [ivHex, tagHex, dataHex] = parts;
  try {
    const key = getKey();
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const data = Buffer.from(dataHex, "hex");
    const decipher = createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    return decipher.update(data).toString("utf8") + decipher.final("utf8");
  } catch {
    // Decryption failed — may be a legacy token that happens to contain colons.
    // Return as-is so the OAuth client can attempt to use it; worst case the
    // token is invalid and the user will be prompted to re-authenticate.
    return ciphertext;
  }
}
