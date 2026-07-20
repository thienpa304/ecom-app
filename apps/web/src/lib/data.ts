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

const loadPublishedProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("is_published", true);

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return ((data ?? []) as ProductWithImages[]).map((row) => {
      const { product_images, ...product } = row;
      return mapProductRow(product, product_images ?? []);
    });
  },
  ["published-products"],
  { revalidate: REVALIDATE_SECONDS, tags: ["products"] },
);

/** Deduped within a single request. */
export const getSiteSettings = cache(() => loadSiteSettings());
export const getBrands = cache(() => loadBrands());
export const getCategories = cache(() => loadCategories());
const getPublishedProducts = cache(() => loadPublishedProducts());

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const products = await getPublishedProducts();
  return products.find((p) => p.slug === slug);
}

export async function listPublishedProductSlugs(): Promise<string[]> {
  const products = await getPublishedProducts();
  return products.map((p) => p.slug);
}

export async function listProducts(
  params: ListProductsParams = {},
): Promise<ListProductsResult> {
  const [brands, categories, products] = await Promise.all([
    getBrands(),
    getCategories(),
    getPublishedProducts(),
  ]);

  const brandSlugs = normalizeSlugs(params.brandSlug);
  const brandIds = brandSlugs.length
    ? new Set(
        brands.filter((b) => brandSlugs.includes(b.slug)).map((b) => b.id),
      )
    : null;

  let categoryId: string | null = null;
  if (params.categorySlug) {
    categoryId =
      categories.find((c) => c.slug === params.categorySlug)?.id ?? null;
  }

  const { min, max } = resolvePriceRange(params);
  const q = params.q?.trim().toLowerCase();

  let filtered = products.filter((p) => {
    if (brandIds && !brandIds.has(p.brandId)) return false;
    if (categoryId && p.categoryId !== categoryId) return false;

    const price = effectiveSaleOrPrice(p);
    if (min != null && price < min) return false;
    if (max != null && price > max) return false;

    if (q) {
      const hay = `${p.name} ${p.model} ${p.description ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  filtered = sortProducts(filtered, params.sort);

  const pageSize = clampPageSize(params.pageSize);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, params.page ?? 1), totalPages);
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return { items, total, page, pageSize, totalPages };
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

function normalizeSlugs(value?: string | string[]): string[] {
  if (!value) return [];
  const arr = Array.isArray(value) ? value : value.split(",");
  return arr.map((s) => s.trim()).filter(Boolean);
}

function effectiveSaleOrPrice(p: Product): number {
  return p.salePrice != null && p.salePrice < p.price ? p.salePrice : p.price;
}

function sortProducts(items: Product[], sort?: SortValue): Product[] {
  const copy = [...items];
  switch (sort) {
    case "price_asc":
      return copy.sort(
        (a, b) => effectiveSaleOrPrice(a) - effectiveSaleOrPrice(b),
      );
    case "price_desc":
      return copy.sort(
        (a, b) => effectiveSaleOrPrice(b) - effectiveSaleOrPrice(a),
      );
    case "sold_desc":
      return copy.sort((a, b) => b.soldCount - a.soldCount);
    case "newest":
    default:
      return copy;
  }
}

function clampPageSize(size?: number): number {
  if (size === 24) return 24;
  return 12;
}
