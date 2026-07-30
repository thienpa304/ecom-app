import type { MetadataRoute } from "next";
import {
  listPublishedCategorySlugs,
  listPublishedProductSlugs,
} from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, categorySlugs] = await Promise.all([
    listPublishedProductSlugs(),
    listPublishedCategorySlugs(),
  ]);
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
    ...categorySlugs.map((slug) => ({
      url: absoluteUrl(`/danh-muc/${slug}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.85,
    })),
    ...slugs.map((slug) => ({
      url: absoluteUrl(`/san-pham/${slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
