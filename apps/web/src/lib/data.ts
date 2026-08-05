import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  DEFAULT_SITE_SETTINGS,
  PRICE_RANGES,
  mapBrandRow,
  mapCategoryRow,
  mapHomeSectionRow,
  mapLeadRow,
  mapProductRow,
  mapSiteSettingsRow,
  type Brand,
  type BrandRow,
  type Category,
  type CategoryRow,
  type HomeSection,
  type HomeSectionRow,
  type Lead,
  type LeadRow,
  type Product,
  type ProductMediaRow,
  type ProductRow,
  type SiteSettings,
  type SiteSettingsRow,
} from "@ecom/shared";
import { createServerClient } from "./supabase";

export type SortValue =
  | "price_asc"
  | "price_desc"
  | "sold_desc"
  | "newest"
  | string;

export type ListProductsParams = {
  brandSlug?: string | string[];
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  price?: string;
  sort?: SortValue;
  page?: number;
  pageSize?: number;
  q?: string;
};

export type ListProductsResult = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type ProductWithMedia = ProductRow & {
  product_media?: ProductMediaRow[] | null;
};

const REVALIDATE_SECONDS = 60;

function resolvePriceRange(params: ListProductsParams): {
  min?: number;
  max?: number;
} {
  if (params.price) {
    const range = PRICE_RANGES.find((r) => r.value === params.price);
    if (range) {
      return {
        min: range.min,
        max: range.max ?? undefined,
      };
    }
  }
  return { min: params.minPrice, max: params.maxPrice };
}

function clampPageSize(size?: number): number {
  if (size === 24) return 24;
  return 12;
}

function normalizeSlugs(value?: string | string[]): string[] {
  if (!value) return [];
  const arr = Array.isArray(value) ? value : value.split(",");
  return arr.map((s) => s.trim()).filter(Boolean);
}

function mapRows(data: ProductWithMedia[] | null | undefined): Product[] {
  return ((data ?? []) as ProductWithMedia[]).map((row) => {
    const { product_media, ...product } = row;
    return mapProductRow(product, product_media ?? []);
  });
}

function sortColumn(sort?: SortValue): {
  column: string;
  ascending: boolean;
} {
  switch (sort) {
    case "price_asc":
      return { column: "effective_price", ascending: true };
    case "price_desc":
      return { column: "effective_price", ascending: false };
    case "sold_desc":
      return { column: "sold_count", ascending: false };
    case "newest":
    default:
      return { column: "created_at", ascending: false };
  }
}

const loadSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("getSiteSettings:", error.message);
      return DEFAULT_SITE_SETTINGS;
    }
    if (!data) return DEFAULT_SITE_SETTINGS;
    return mapSiteSettingsRow(data as SiteSettingsRow);
  },
  ["site-settings"],
  { revalidate: REVALIDATE_SECONDS, tags: ["site-settings"] },
);

const loadBrands = unstable_cache(
  async (): Promise<Brand[]> => {
    const supabase = createServerClient();
    const { data, error } = await supabase.from("brands").select("*");
    if (error) {
      throw new Error(`Failed to fetch brands: ${error.message}`);
    }
    return ((data ?? []) as BrandRow[]).map(mapBrandRow);
  },
  ["brands"],
  { revalidate: REVALIDATE_SECONDS, tags: ["brands"] },
);

const loadCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const supabase = createServerClient();
    const { data, error } = await supabase.from("categories").select("*");
    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
    return ((data ?? []) as CategoryRow[]).map(mapCategoryRow);
  },
  ["categories"],
  { revalidate: REVALIDATE_SECONDS, tags: ["categories"] },
);

const loadPublishedSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("slug")
      .eq("is_published", true);

    if (error) {
      throw new Error(`Failed to fetch product slugs: ${error.message}`);
    }
    return (data ?? []).map((row) => row.slug as string);
  },
  ["published-product-slugs"],
  { revalidate: REVALIDATE_SECONDS, tags: ["products"] },
);

export const getSiteSettings = cache(() => loadSiteSettings());
export const getBrands = cache(() => loadBrands());
export const getCategories = cache(() => loadCategories());

const loadHomeSections = unstable_cache(
  async (): Promise<HomeSection[]> => {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("home_sections")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch home sections: ${error.message}`);
    }
    return ((data ?? []) as HomeSectionRow[]).map(mapHomeSectionRow);
  },
  ["home-sections"],
  { revalidate: REVALIDATE_SECONDS, tags: ["home-sections"] },
);

export const listHomeSections = cache(() => loadHomeSections());

export type HomeCategorySection = {
  category: Category;
  items: Product[];
};

const loadHomeCategorySections = unstable_cache(
  async (limit: number): Promise<HomeCategorySection[]> => {
    const categories = await getCategories();
    const supabase = createServerClient();

    const sections = await Promise.all(
      categories.map(async (category) => {
        const { data, error } = await supabase
          .from("products")
          .select("*, product_media(*)")
          .eq("is_published", true)
          .eq("category_id", category.id)
          .order("sold_count", { ascending: false, nullsFirst: false })
          .limit(limit);

        if (error) {
          throw new Error(
            `Failed to load category section ${category.slug}: ${error.message}`,
          );
        }
        return { category, items: mapRows(data as ProductWithMedia[]) };
      }),
    );

    return sections
      .filter((s) => s.items.length > 0)
      .sort(
        (a, b) =>
          a.category.sortOrder - b.category.sortOrder ||
          a.category.name.localeCompare(b.category.name, "vi"),
      );
  },
  ["home-category-sections"],
  { revalidate: REVALIDATE_SECONDS, tags: ["products", "categories"] },
);

export function listHomeCategorySections(
  limit = 4,
): Promise<HomeCategorySection[]> {
  return loadHomeCategorySections(limit);
}

const loadVideoProducts = unstable_cache(
  async (limit: number): Promise<Product[]> => {
    const supabase = createServerClient();

    const { data: mediaRows, error: mediaError } = await supabase
      .from("product_media")
      .select("product_id")
      .in("kind", ["video", "embed"]);

    if (mediaError) {
      console.error("listVideoProducts:", mediaError.message);
      return [];
    }

    const ids = [
      ...new Set(
        (mediaRows ?? []).map((row) => (row as { product_id: string }).product_id),
      ),
    ];
    if (ids.length === 0) return [];

    const { data, error } = await supabase
      .from("products")
      .select("*, product_media(*)")
      .eq("is_published", true)
      .in("id", ids)
      .order("sold_count", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      console.error("listVideoProducts:", error.message);
      return [];
    }
    return mapRows(data as ProductWithMedia[]);
  },
  ["home-video-products"],
  { revalidate: REVALIDATE_SECONDS, tags: ["products"] },
);

export function listVideoProducts(limit = 4): Promise<Product[]> {
  return loadVideoProducts(limit);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_media(*)")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
  if (!data) return undefined;
  return mapRows([data as ProductWithMedia])[0];
}

export async function listPublishedProductSlugs(): Promise<string[]> {
  return loadPublishedSlugs();
}

const loadPublishedCategorySlugs = unstable_cache(
  async (): Promise<string[]> => {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("category_id")
      .eq("is_published", true);

    if (error) {
      throw new Error(`Failed to fetch published category ids: ${error.message}`);
    }

    const ids = new Set(
      (data ?? [])
        .map((row) => (row as { category_id: string | null }).category_id)
        .filter((id): id is string => Boolean(id)),
    );
    if (ids.size === 0) return [];

    const categories = await getCategories();
    return categories.filter((c) => ids.has(c.id)).map((c) => c.slug);
  },
  ["published-category-slugs"],
  { revalidate: REVALIDATE_SECONDS, tags: ["products", "categories"] },
);

export async function listPublishedCategorySlugs(): Promise<string[]> {
  return loadPublishedCategorySlugs();
}

const loadPublishedBrandSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("brand_id")
      .eq("is_published", true);

    if (error) {
      throw new Error(`Failed to fetch published brand ids: ${error.message}`);
    }

    const ids = new Set(
      (data ?? [])
        .map((row) => (row as { brand_id: string | null }).brand_id)
        .filter((id): id is string => Boolean(id)),
    );
    if (ids.size === 0) return [];

    const brands = await getBrands();
    return brands.filter((b) => ids.has(b.id)).map((b) => b.slug);
  },
  ["published-brand-slugs"],
  { revalidate: REVALIDATE_SECONDS, tags: ["products", "brands"] },
);

export async function listPublishedBrandSlugs(): Promise<string[]> {
  return loadPublishedBrandSlugs();
}

export type SitemapEntry = {
  slug: string;
  lastModified?: string;
};

export type SitemapEntries = {
  products: SitemapEntry[];
  categories: SitemapEntry[];
  brands: SitemapEntry[];
  latest?: string;
};

type SitemapProductRow = {
  slug: string;
  category_id: string | null;
  brand_id: string | null;
  updated_at: string | null;
  created_at: string | null;
};

function parseTimestamp(value: string | null): number | undefined {
  if (!value) return undefined;
  const time = Date.parse(value);
  return Number.isNaN(time) ? undefined : time;
}

function trackLatest(
  store: Map<string, number>,
  key: string | null,
  time: number,
): void {
  if (!key) return;
  const current = store.get(key);
  if (current === undefined || time > current) {
    store.set(key, time);
  }
}

function toSitemapEntries(
  items: { id: string; slug: string }[],
  times: Map<string, number>,
): SitemapEntry[] {
  return items.flatMap((item) => {
    const time = times.get(item.id);
    if (time === undefined) return [];
    return [{ slug: item.slug, lastModified: new Date(time).toISOString() }];
  });
}

const loadSitemapEntries = unstable_cache(
  async (): Promise<SitemapEntries> => {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("slug, category_id, brand_id, updated_at, created_at")
      .eq("is_published", true);

    if (error) {
      throw new Error(`Failed to fetch sitemap entries: ${error.message}`);
    }

    const rows = (data ?? []) as SitemapProductRow[];
    const categoryTimes = new Map<string, number>();
    const brandTimes = new Map<string, number>();
    let latestTime: number | undefined;

    const products = rows.map((row) => {
      const time = parseTimestamp(row.updated_at ?? row.created_at);
      if (time === undefined) return { slug: row.slug };

      if (latestTime === undefined || time > latestTime) {
        latestTime = time;
      }
      trackLatest(categoryTimes, row.category_id, time);
      trackLatest(brandTimes, row.brand_id, time);

      return { slug: row.slug, lastModified: new Date(time).toISOString() };
    });

    const [categories, brands] = await Promise.all([
      getCategories(),
      getBrands(),
    ]);

    return {
      products,
      categories: toSitemapEntries(categories, categoryTimes),
      brands: toSitemapEntries(brands, brandTimes),
      latest:
        latestTime === undefined
          ? undefined
          : new Date(latestTime).toISOString(),
    };
  },
  ["sitemap-entries"],
  {
    revalidate: REVALIDATE_SECONDS,
    tags: ["products", "categories", "brands"],
  },
);

export async function listSitemapEntries(): Promise<SitemapEntries> {
  return loadSitemapEntries();
}

async function queryListProducts(
  params: ListProductsParams,
): Promise<ListProductsResult> {
  const pageSize = clampPageSize(params.pageSize);
  const requestedPage = Math.max(1, params.page ?? 1);
  const { min, max } = resolvePriceRange(params);
  const q = params.q?.trim();
  const brandSlugs = normalizeSlugs(params.brandSlug);
  const { column, ascending } = sortColumn(params.sort);

  const [brands, categories] = await Promise.all([
    getBrands(),
    getCategories(),
  ]);

  const brandIds = brandSlugs.length
    ? brands.filter((b) => brandSlugs.includes(b.slug)).map((b) => b.id)
    : [];

  let categoryId: string | null = null;
  if (params.categorySlug) {
    categoryId =
      categories.find((c) => c.slug === params.categorySlug)?.id ?? null;
    if (!categoryId) {
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize,
        totalPages: 1,
      };
    }
  }

  if (brandSlugs.length && brandIds.length === 0) {
    return {
      items: [],
      total: 0,
      page: 1,
      pageSize,
      totalPages: 1,
    };
  }

  const supabase = createServerClient();
  let query = supabase
    .from("products")
    .select("*, product_media(*)", { count: "exact" })
    .eq("is_published", true);

  if (brandIds.length === 1) {
    query = query.eq("brand_id", brandIds[0]!);
  } else if (brandIds.length > 1) {
    query = query.in("brand_id", brandIds);
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (min != null) {
    query = query.gte("effective_price", min);
  }
  if (max != null) {
    query = query.lte("effective_price", max);
  }

  if (q) {
    const searchOr = buildSearchOr(q);
    if (searchOr) query = query.or(searchOr);
  }

  const from = (requestedPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order(column, { ascending, nullsFirst: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to list products: ${error.message}`);
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const page = Math.min(requestedPage, totalPages);

  return {
    items: mapRows(data as ProductWithMedia[]),
    total,
    page,
    pageSize,
    totalPages,
  };
}

function buildSearchOr(q: string): string {
  const safe = q.replace(/[%_",]/g, " ").replace(/\s+/g, " ").trim();
  if (!safe) return "";
  const p = `%${safe}%`;
  return `name.ilike."${p}",model.ilike."${p}",description.ilike."${p}"`;
}

export async function listProducts(
  params: ListProductsParams = {},
): Promise<ListProductsResult> {
  const normalized: ListProductsParams = {
    brandSlug: normalizeSlugs(params.brandSlug).join(",") || undefined,
    categorySlug: params.categorySlug || undefined,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    price: params.price || undefined,
    sort: params.sort || "newest",
    page: Math.max(1, params.page ?? 1),
    pageSize: clampPageSize(params.pageSize),
    q: params.q?.trim() || undefined,
  };

  const cacheKey = JSON.stringify({ v: 2, ...normalized });
  return unstable_cache(
    () => queryListProducts(normalized),
    ["list-products", cacheKey],
    { revalidate: REVALIDATE_SECONDS, tags: ["products"] },
  )();
}

export async function createLead(input: {
  productId?: string | null;
  name: string;
  phone: string;
  note?: string;
}): Promise<Lead> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      product_id: input.productId ?? null,
      name: input.name.trim(),
      phone: input.phone.trim(),
      note: (input.note ?? "").trim(),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create lead: ${error.message}`);
  }

  return mapLeadRow(data as LeadRow);
}

export async function getBrandById(id: string): Promise<Brand | undefined> {
  const brands = await getBrands();
  return brands.find((b) => b.id === id);
}

export async function getCategoryById(
  id: string,
): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((c) => c.id === id);
}
