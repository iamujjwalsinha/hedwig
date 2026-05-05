import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import {
  metadataKeywords,
  ogImagePath,
  siteDescription,
  siteTitle,
} from "@/lib/seo";

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

const openGraphExtras = siteMetadataBase
  ? {
      url: siteMetadataBase.href,
      images: [
        {
          url: ogImagePath,
          width: 1200,
          height: 630,
          alt: "hedwig: encrypted one-time link to share a secret once",
        },
      ],
    }
  : {};

const twitterExtras = siteMetadataBase
  ? {
      images: [ogImagePath],
    }
  : {};

export const viewport: Viewport = {
  themeColor: BRAND.accent,
};

export const metadata: Metadata = {
  ...(siteMetadataBase ? { metadataBase: siteMetadataBase } : {}),
  title: { default: siteTitle, template: "%s · hedwig" },
  description: siteDescription,
  keywords: metadataKeywords,
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: "hedwig",
    type: "website",
    ...openGraphExtras,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    ...twitterExtras,
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
