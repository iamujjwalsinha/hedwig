/** Shared hedwig branding (UI + copy). */

export const BRAND = {
  name: "hedwig",
  tagline: "Zero-knowledge secret sharing. Encrypted in your browser.",
  accent: "#034F46",
  background: "#FFFFEB",
  cardBg: "#F4F4E0",
  border: "#D8D8C8",
  text: "#1A1A1A",
} as const;

export function fontDisplay(): string {
  return "'Bricolage Grotesque', sans-serif";
}
