import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return [];

  const root = raw.endsWith("/") ? raw.slice(0, -1) : raw;
  return [
    {
      url: `${root}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
