/** Shared hedwig branding (UI + copy). */

export const BRAND = {
  name: "hedwig",
  tagline:
    "Share a secret once with an encrypted one-time link, burned after reading if you want.",
  accent: "#034F46",
  background: "#FFFFEB",
  cardBg: "#F4F4E0",
  border: "#D8D8C8",
  text: "#1A1A1A",
} as const;

export function fontDisplay(): string {
  return "'Bricolage Grotesque', sans-serif";
}
