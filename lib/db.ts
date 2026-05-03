import { getSupabaseAdmin } from "@/lib/supabase-server";

/** Row shape returned after fetch_secret RPC (JSON field names). */
type FetchSecretRow = {
  ciphertext: string;
  iv: string;
  burn_on_read: boolean;
};

export interface SecretWritePayload {
  ciphertext: string;
  iv: string;
  burnOnRead: boolean;
  createdAtMs: number;
}

export interface SecretReadResult {
  ciphertext: string;
  iv: string;
  burnOnRead: boolean;
}

export async function storeSecret(
  id: string,
  payload: SecretWritePayload,
  ttlSeconds: number
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const expiresAt = new Date(
    payload.createdAtMs + ttlSeconds * 1000
  ).toISOString();
  const createdAt = new Date(payload.createdAtMs).toISOString();

  const { error } = await supabase.from("secrets").insert({
    id,
    ciphertext: payload.ciphertext,
    iv: payload.iv,
    burn_on_read: payload.burnOnRead,
    created_at: createdAt,
    expires_at: expiresAt,
  });

  if (error) throw error;
}

/**
 * Single round-trip: locks row, rejects expired, deletes if burn_on_read, returns payload.
 */
export async function fetchAndConsumeSecret(
  id: string
): Promise<SecretReadResult | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("fetch_secret", { p_id: id });

  if (error) {
    console.error("fetch_secret RPC error:", error);
    throw error;
  }

  if (data == null) return null;

  const row = data as FetchSecretRow;
  return {
    ciphertext: row.ciphertext,
    iv: row.iv,
    burnOnRead: row.burn_on_read,
  };
}
