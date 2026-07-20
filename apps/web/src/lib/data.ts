import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  DEFAULT_SITE_SETTINGS,
  PRICE_RANGES,
  mapBrandRow,
  mapCategoryRow,
  mapLeadRow,
  mapProductRow,
  mapSiteSettingsRow,
  type Brand,
  type BrandRow,
  type Category,
  type CategoryRow,
  type Lead,
  type LeadRow,
  type Product,
  type ProductImageRow,
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
  /** PRICE_RANGES value, e.g. under_1m */
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

type ProductWithImages = ProductRow & {
  product_images?: ProductImageRow[] | null;
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

function mapRows(data: ProductWithImages[] | null | undefined): Product[] {
  return ((data ?? []) as ProductWithImages[]).map((row) => {
    const { product_images, ...product } = row;
    return mapProductRow(product, product_images ?? []);
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

/** Deduped within a single request. */
export const getSiteSettings = cache(() => loadSiteSettings());
export const getBrands = cache(() => loadBrands());
export const getCategories = cache(() => loadCategories());

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
  if (!data) return undefined;
  return mapRows([data as ProductWithImages])[0];
}

export async function listPublishedProductSlugs(): Promise<string[]> {
  return loadPublishedSlugs();
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
    // Unknown category slug → empty result
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
    .select("*, product_images(*)", { count: "exact" })
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
    items: mapRows(data as ProductWithImages[]),
    total,
    page,
    pageSize,
    totalPages,
  };
}

/** PostgREST `or` values with special chars must be double-quoted. */
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

  const cacheKey = JSON.stringify(normalized);
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
