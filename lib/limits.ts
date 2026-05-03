/** Defensive caps for API payloads (~512 KiB ciphertext after base64). */

export const MAX_CIPHERTEXT_CHARS = 700_000;
export const MAX_IV_CHARS = 64;

export function isValidCipherPayload(ciphertext: string, iv: string): boolean {
  if (typeof ciphertext !== "string" || typeof iv !== "string") return false;
  if (
    ciphertext.length === 0 ||
    iv.length === 0 ||
    ciphertext.length > MAX_CIPHERTEXT_CHARS ||
    iv.length > MAX_IV_CHARS
  ) {
    return false;
  }
  return true;
}
