import type { MetadataRoute } from "next";
import { listPublishedProductSlugs } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await listPublishedProductSlugs();
  const now = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/san-pham"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...slugs.map((slug) => ({
      url: absoluteUrl(`/san-pham/${slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
