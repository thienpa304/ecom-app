import type { MetadataRoute } from "next";
import { listSitemapEntries, type SitemapEntry } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

function toDate(value?: string): Date | undefined {
  return value ? new Date(value) : undefined;
}

function toSitemapItems(
  entries: SitemapEntry[],
  buildPath: (slug: string) => string,
  changeFrequency: "daily" | "weekly",
  priority: number,
): MetadataRoute.Sitemap {
  return entries.map((entry) => ({
    url: absoluteUrl(buildPath(entry.slug)),
    lastModified: toDate(entry.lastModified),
    changeFrequency,
    priority,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await listSitemapEntries();
  const latest = toDate(entries.latest);

  return [
    {
      url: absoluteUrl("/"),
      lastModified: latest,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/san-pham"),
      lastModified: latest,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...toSitemapItems(
      entries.categories,
      (slug) => `/danh-muc/${slug}`,
      "daily",
      0.85,
    ),
    ...toSitemapItems(
      entries.brands,
      (slug) => `/thuong-hieu/${slug}`,
      "weekly",
      0.8,
    ),
    ...toSitemapItems(
      entries.products,
      (slug) => `/san-pham/${slug}`,
      "weekly",
      0.8,
    ),
  ];
}
