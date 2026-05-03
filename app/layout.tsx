import type { Metadata } from "next";
import "./globals.css";
import { BRAND } from "@/lib/brand";

function metadataBase(): URL | undefined {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return undefined;
  try {
    const u = raw.endsWith("/") ? raw.slice(0, -1) : raw;
    return new URL(`${u}/`);
  } catch {
    return undefined;
  }
}

const siteMetadataBase = metadataBase();

const title = "hedwig — Zero-Knowledge Secret Sharing";
const description =
  "Share secrets securely. End-to-end encrypted in your browser. hedwig never sees your plaintext.";

export const metadata: Metadata = {
  ...(siteMetadataBase ? { metadataBase: siteMetadataBase } : {}),
  title: { default: title, template: "%s · hedwig" },
  description,
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    siteName: "hedwig",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="min-h-screen antialiased"
        style={{ backgroundColor: BRAND.background, color: BRAND.text }}
      >
        {children}
      </body>
    </html>
  );
}
