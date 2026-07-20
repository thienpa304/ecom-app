import {
  PRICE_RANGES,
  seedBrands,
  seedCategories,
  seedProducts,
  type Brand,
  type Category,
  type Lead,
  type Product,
} from "@ecom/shared";

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

const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

/** In-memory leads for mock mode (module-scoped). */
const mockLeads: Lead[] = [];

function publishedProducts(): Product[] {
  return seedProducts.filter((p) => p.isPublished);
}

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

export function getBrands(): Brand[] {
  if (!useMock) {
    // Supabase path reserved — fall back to seed until wired.
    return seedBrands;
  }
  return seedBrands;
}

export function getCategories(): Category[] {
  if (!useMock) {
    return seedCategories;
  }
  return seedCategories;
}

export function getProductBySlug(slug: string): Product | undefined {
  return publishedProducts().find((p) => p.slug === slug);
}

export function listProducts(params: ListProductsParams = {}): ListProductsResult {
  const brands = getBrands();
  const categories = getCategories();
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

  let filtered = publishedProducts().filter((p) => {
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

export function createLead(input: {
  productId?: string | null;
  name: string;
  phone: string;
  note?: string;
}): Lead {
  const lead: Lead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    productId: input.productId ?? null,
    name: input.name.trim(),
    phone: input.phone.trim(),
    note: (input.note ?? "").trim(),
    createdAt: new Date().toISOString(),
  };

  if (useMock) {
    mockLeads.push(lead);
  }
  return lead;
}

export function getMockLeads(): Lead[] {
  return [...mockLeads];
}

export function getBrandById(id: string): Brand | undefined {
  return getBrands().find((b) => b.id === id);
}

export function getCategoryById(id: string): Category | undefined {
  return getCategories().find((c) => c.id === id);
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
