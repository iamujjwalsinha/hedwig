/** Allowed TTL values (seconds); must stay in sync with API validation and the create form UI. */

export const ALLOWED_TTL_SECONDS = [900, 1800, 2700, 3600] as const;

export type AllowedTtlSeconds = (typeof ALLOWED_TTL_SECONDS)[number];

export const DEFAULT_TTL_SECONDS: AllowedTtlSeconds = ALLOWED_TTL_SECONDS[0];

export function normalizeTtlSeconds(value: unknown): AllowedTtlSeconds | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const rounded = Math.trunc(value);
  return ALLOWED_TTL_SECONDS.includes(rounded as AllowedTtlSeconds)
    ? (rounded as AllowedTtlSeconds)
    : null;
}
