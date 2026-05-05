import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  const rules = {
    userAgent: "*",
    allow: "/" as const,
  };

  if (!raw) {
    return { rules };
  }

  const root = raw.endsWith("/") ? raw.slice(0, -1) : raw;
  return {
    rules,
    sitemap: `${root}/sitemap.xml`,
  };
}
