import type { MetadataRoute } from "next";
import {
  listPolicyPages,
  listSitemapEntries,
  type SitemapEntry,
} from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

function toDate(value?: string): Date | undefined {
  return value ? new Date(value) : undefined;
}

function toSitemapItems(
  entries: SitemapEntry[],
  buildPath: (slug: string) => string,
  changeFrequency: "daily" | "weekly" | "monthly",
  priority: number,
): MetadataRoute.Sitemap {
  return entries.map((entry) => ({
    url: absoluteUrl(buildPath(entry.slug)),
    lastModified: toDate(entry.lastModified),
    changeFrequency,
    priority,
  }));
}

function newestLastModified(entries: SitemapEntry[]): Date | undefined {
  let newest: Date | undefined;
  for (const entry of entries) {
    const date = toDate(entry.lastModified);
    if (date && (!newest || date > newest)) newest = date;
  }
  return newest;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [entries, policyPages] = await Promise.all([
    listSitemapEntries(),
    listPolicyPages(),
  ]);
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
    ...(entries.posts.length
      ? [
          {
            url: absoluteUrl("/cam-nang"),
            lastModified: newestLastModified(entries.posts),
            changeFrequency: "weekly" as const,
            priority: 0.7,
          },
        ]
      : []),
    ...toSitemapItems(
      entries.posts,
      (slug) => `/cam-nang/${slug}`,
      "monthly",
      0.6,
    ),
    ...toSitemapItems(
      policyPages.map((page) => ({
        slug: page.slug,
        lastModified: page.updatedAt,
      })),
      (slug) => `/chinh-sach/${slug}`,
      "monthly",
      0.3,
    ),
  ];
}
