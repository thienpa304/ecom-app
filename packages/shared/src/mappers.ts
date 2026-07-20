import type {
  Brand,
  Category,
  Lead,
  Product,
  ProductImage,
  SiteSettings,
  StockStatus,
} from "./types";

/** Snake_case row shapes matching supabase SQL schema. */

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
};

export type BrandRow = {
  id: string;
  name: string;
  slug: string;
};

export type ProductImageRow = {
  id: string;
  product_id: string;
  url: string;
  alt: string;
  sort_order: number;
};

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  model: string;
  brand_id: string;
  category_id: string;
  price: number | string;
  sale_price: number | string | null;
  stock_status: StockStatus;
  sold_count: number;
  warranty: string;
  origin: string;
  motor: string | null;
  specs: Record<string, string> | null;
  is_published: boolean;
  description: string | null;
};

export type LeadRow = {
  id: string;
  product_id: string | null;
  name: string;
  phone: string;
  note: string;
  created_at: string;
};

export type SiteSettingsRow = {
  id: number;
  site_name: string;
  tagline: string;
  phone: string;
  zalo_url: string;
  address: string;
  email: string;
  hero_title: string;
  hero_subtitle: string;
  meta_description: string;
  footer_blurb: string;
  search_placeholder: string;
  updated_at?: string;
};

function toNumber(value: number | string): number {
  return typeof value === "string" ? Number(value) : value;
}

export function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    parentId: row.parent_id,
    sortOrder: row.sort_order,
  };
}

export function mapBrandRow(row: BrandRow): Brand {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
  };
}

export function mapImageRow(row: ProductImageRow): ProductImage {
  return {
    id: row.id,
    productId: row.product_id,
    url: row.url,
    alt: row.alt,
    sortOrder: row.sort_order,
  };
}

export function mapProductRow(
  row: ProductRow,
  images: ProductImageRow[] = [],
): Product {
  const mappedImages = [...images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapImageRow);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    model: row.model,
    brandId: row.brand_id,
    categoryId: row.category_id,
    price: toNumber(row.price),
    salePrice: row.sale_price == null ? null : toNumber(row.sale_price),
    stockStatus: row.stock_status,
    soldCount: row.sold_count,
    warranty: row.warranty,
    origin: row.origin,
    motor: row.motor,
    specs: row.specs ?? {},
    isPublished: row.is_published,
    description: row.description ?? undefined,
    images: mappedImages,
  };
}

export function mapLeadRow(row: LeadRow): Lead {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.name,
    phone: row.phone,
    note: row.note,
    createdAt: row.created_at,
  };
}

export function mapSiteSettingsRow(row: SiteSettingsRow): SiteSettings {
  return {
    id: row.id,
    siteName: row.site_name,
    tagline: row.tagline,
    phone: row.phone,
    zaloUrl: row.zalo_url,
    address: row.address ?? "",
    email: row.email ?? "",
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    metaDescription: row.meta_description,
    footerBlurb: row.footer_blurb,
    searchPlaceholder: row.search_placeholder,
    updatedAt: row.updated_at,
  };
}

export function siteSettingsToRow(
  settings: Omit<SiteSettings, "id" | "updatedAt"> & { id?: number },
): Omit<SiteSettingsRow, "updated_at"> {
  return {
    id: settings.id ?? 1,
    site_name: settings.siteName,
    tagline: settings.tagline,
    phone: settings.phone,
    zalo_url: settings.zaloUrl,
    address: settings.address,
    email: settings.email,
    hero_title: settings.heroTitle,
    hero_subtitle: settings.heroSubtitle,
    meta_description: settings.metaDescription,
    footer_blurb: settings.footerBlurb,
    search_placeholder: settings.searchPlaceholder,
  };
}

/** Convert camelCase Product (without id) to DB insert/update payload. */
export function productToRow(
  product: Omit<Product, "id" | "images"> & { id?: string },
): Omit<ProductRow, "id"> & { id?: string } {
  return {
    ...(product.id ? { id: product.id } : {}),
    name: product.name,
    slug: product.slug,
    model: product.model,
    brand_id: product.brandId,
    category_id: product.categoryId,
    price: product.price,
    sale_price: product.salePrice,
    stock_status: product.stockStatus,
    sold_count: product.soldCount,
    warranty: product.warranty,
    origin: product.origin,
    motor: product.motor,
    specs: product.specs,
    is_published: product.isPublished,
    description: product.description ?? null,
  };
}

export function imageToRow(image: ProductImage): ProductImageRow {
  return {
    id: image.id,
    product_id: image.productId,
    url: image.url,
    alt: image.alt,
    sort_order: image.sortOrder,
  };
}
