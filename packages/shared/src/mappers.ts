import {
  faqEntrySchema,
  heroBulletSchema,
  heroSlideSchema,
  openingHoursEntrySchema,
} from "./schemas";

import type {

  Brand,

  Category,

  FaqEntry,

  HeroBullet,

  HeroSlide,

  HomeSection,

  HomeSectionKind,

  HomeSectionStyle,

  Lead,

  OpeningHoursEntry,

  PolicyPage,

  Post,

  Product,

  ProductMedia,

  SiteSettings,

  StockStatus,

} from "./types";



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

  description?: string | null;

  meta_title?: string | null;

  meta_description?: string | null;

};



export type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string | null;
  cover_url?: string | null;
  cover_alt?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  author_name?: string | null;
  is_published?: boolean | null;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PolicyPageRow = {
  id: string;
  title: string;
  slug: string;
  body?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  sort_order?: number | null;
  is_published?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ProductMediaRow = {

  id: string;

  product_id: string;

  kind: "image" | "video" | "embed";

  url: string;

  alt: string;

  sort_order: number;

  storage_path: string | null;

  poster_url: string | null;

};



export type ProductImageRow = ProductMediaRow;



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
  meta_title?: string | null;
  meta_description?: string | null;
  seo_keywords?: string | null;

};



export type HomeSectionRow = {

  id: string;

  title: string;

  kind: HomeSectionKind;

  category_id: string | null;

  product_limit: number;

  style: HomeSectionStyle;

  sort_order: number;

  is_published: boolean;

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

  logo_url?: string | null;

  logo_square_url?: string | null;

  header_cta_label?: string | null;

  hero_title: string;

  hero_highlight?: string | null;

  hero_subtitle: string;

  hero_image_url?: string | null;

  hero_card_title?: string | null;

  hero_card_caption?: string | null;

  hero_slides?: unknown;

  hero_bullets?: unknown;

  meta_description: string;

  footer_blurb: string;

  search_placeholder: string;

  facebook_url?: string | null;

  youtube_url?: string | null;

  tiktok_url?: string | null;

  fanpage_embed_url?: string | null;

  map_embed_url?: string | null;

  address_locality?: string | null;

  address_region?: string | null;

  postal_code?: string | null;

  latitude?: string | null;

  longitude?: string | null;

  price_range?: string | null;

  opening_hours?: unknown;

  faqs?: unknown;

  shipping_policy?: string | null;

  return_policy?: string | null;

  updated_at?: string;

};



function toNumber(value: number | string): number {

  return typeof value === "string" ? Number(value) : value;

}



function toArray(value: unknown): unknown[] {

  if (Array.isArray(value)) return value;

  if (typeof value === "string" && value.trim()) {

    try {

      const parsed: unknown = JSON.parse(value);

      return Array.isArray(parsed) ? parsed : [];

    } catch {

      return [];

    }

  }

  return [];

}



export function parseHeroSlides(value: unknown): HeroSlide[] {

  return toArray(value).flatMap((item) => {

    const parsed = heroSlideSchema.safeParse(item);

    return parsed.success && parsed.data.url ? [parsed.data] : [];

  });

}



export function parseHeroBullets(value: unknown): HeroBullet[] {

  return toArray(value).flatMap((item) => {

    const parsed = heroBulletSchema.safeParse(item);

    return parsed.success && (parsed.data.bold || parsed.data.text)

      ? [parsed.data]

      : [];

  });

}



export function parseOpeningHours(value: unknown): OpeningHoursEntry[] {

  return toArray(value).flatMap((item) => {

    const parsed = openingHoursEntrySchema.safeParse(item);

    return parsed.success && parsed.data.days.length

      ? [parsed.data]

      : [];

  });

}



export function parseFaqs(value: unknown): FaqEntry[] {

  return toArray(value).flatMap((item) => {

    const parsed = faqEntrySchema.safeParse(item);

    return parsed.success && parsed.data.question && parsed.data.answer

      ? [parsed.data]

      : [];

  });

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

    description: row.description ?? '',

    metaTitle: row.meta_title ?? '',

    metaDescription: row.meta_description ?? '',

  };

}



export function mapPostRow(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    body: row.body ?? "",
    coverUrl: row.cover_url ?? "",
    coverAlt: row.cover_alt ?? "",
    metaTitle: row.meta_title ?? "",
    metaDescription: row.meta_description ?? "",
    authorName: row.author_name ?? "",
    isPublished: Boolean(row.is_published),
    publishedAt: row.published_at ?? null,
    createdAt: row.created_at ?? "",
    updatedAt: row.updated_at ?? "",
  };
}

export function mapPolicyPageRow(row: PolicyPageRow): PolicyPage {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    body: row.body ?? "",
    metaTitle: row.meta_title ?? "",
    metaDescription: row.meta_description ?? "",
    sortOrder: row.sort_order ?? 0,
    isPublished: Boolean(row.is_published),
    createdAt: row.created_at ?? "",
    updatedAt: row.updated_at ?? "",
  };
}

export function mapMediaRow(row: ProductMediaRow): ProductMedia {

  return {

    id: row.id,

    productId: row.product_id,

    kind: row.kind,

    url: row.url,

    alt: row.alt,

    sortOrder: row.sort_order,

    storagePath: row.storage_path,

    posterUrl: row.poster_url,

  };

}



export function mapImageRow(row: ProductMediaRow): ProductMedia {

  return mapMediaRow(row);

}



export function mapProductRow(

  row: ProductRow,

  media: ProductMediaRow[] = [],

): Product {

  const mappedMedia = [...(media ?? [])]

    .sort((a, b) => a.sort_order - b.sort_order)

    .map(mapMediaRow);



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
    metaTitle: row.meta_title || undefined,
    metaDescription: row.meta_description || undefined,
    seoKeywords: row.seo_keywords || undefined,

    media: mappedMedia,

  };

}



export function mapHomeSectionRow(row: HomeSectionRow): HomeSection {

  return {

    id: row.id,

    title: row.title,

    kind: row.kind,

    categoryId: row.category_id,

    productLimit: row.product_limit,

    style: row.style,

    sortOrder: row.sort_order,

    isPublished: row.is_published,

  };

}



export function homeSectionToRow(

  section: Omit<HomeSection, "id"> & { id?: string },

): Omit<HomeSectionRow, "id"> & { id?: string } {

  return {

    ...(section.id ? { id: section.id } : {}),

    title: section.title,

    kind: section.kind,

    category_id: section.kind === "category" ? section.categoryId : null,

    product_limit: section.productLimit,

    style: section.style,

    sort_order: section.sortOrder,

    is_published: section.isPublished,

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

    logoUrl: row.logo_url ?? '',

    logoSquareUrl: row.logo_square_url ?? '',

    headerCtaLabel: row.header_cta_label ?? '',

    heroTitle: row.hero_title,

    heroHighlight: row.hero_highlight ?? '',

    heroSubtitle: row.hero_subtitle,

    heroImageUrl: row.hero_image_url ?? '',

    heroCardTitle: row.hero_card_title ?? '',

    heroCardCaption: row.hero_card_caption ?? '',

    heroSlides: parseHeroSlides(row.hero_slides),

    heroBullets: parseHeroBullets(row.hero_bullets),

    metaDescription: row.meta_description,

    footerBlurb: row.footer_blurb,

    searchPlaceholder: row.search_placeholder,

    facebookUrl: row.facebook_url ?? '',

    youtubeUrl: row.youtube_url ?? '',

    tiktokUrl: row.tiktok_url ?? '',

    fanpageEmbedUrl: row.fanpage_embed_url ?? '',

    mapEmbedUrl: row.map_embed_url ?? '',

    addressLocality: row.address_locality ?? '',

    addressRegion: row.address_region ?? '',

    postalCode: row.postal_code ?? '',

    latitude: row.latitude ?? '',

    longitude: row.longitude ?? '',

    priceRange: row.price_range ?? '',

    openingHours: parseOpeningHours(row.opening_hours),

    faqs: parseFaqs(row.faqs),

    shippingPolicy: row.shipping_policy ?? '',

    returnPolicy: row.return_policy ?? '',

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

    logo_url: settings.logoUrl ?? '',

    logo_square_url: settings.logoSquareUrl ?? '',

    header_cta_label: settings.headerCtaLabel ?? '',

    hero_title: settings.heroTitle,

    hero_highlight: settings.heroHighlight ?? '',

    hero_subtitle: settings.heroSubtitle,

    hero_image_url: settings.heroImageUrl ?? '',

    hero_card_title: settings.heroCardTitle ?? '',

    hero_card_caption: settings.heroCardCaption ?? '',

    hero_slides: settings.heroSlides ?? [],

    hero_bullets: settings.heroBullets ?? [],

    meta_description: settings.metaDescription,

    footer_blurb: settings.footerBlurb,

    search_placeholder: settings.searchPlaceholder,

    facebook_url: settings.facebookUrl ?? '',

    youtube_url: settings.youtubeUrl ?? '',

    tiktok_url: settings.tiktokUrl ?? '',

    fanpage_embed_url: settings.fanpageEmbedUrl ?? '',

    map_embed_url: settings.mapEmbedUrl ?? '',

    address_locality: settings.addressLocality ?? '',

    address_region: settings.addressRegion ?? '',

    postal_code: settings.postalCode ?? '',

    latitude: settings.latitude ?? '',

    longitude: settings.longitude ?? '',

    price_range: settings.priceRange ?? '',

    opening_hours: settings.openingHours ?? [],

    faqs: settings.faqs ?? [],

    shipping_policy: settings.shippingPolicy ?? '',

    return_policy: settings.returnPolicy ?? '',

  };

}



export function productToRow(

  product: Omit<Product, "id" | "media"> & { id?: string },

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
    meta_title: product.metaTitle ?? '',
    meta_description: product.metaDescription ?? '',
    seo_keywords: product.seoKeywords ?? '',

  };

}



export function mediaToRow(media: ProductMedia): ProductMediaRow {

  return {

    id: media.id,

    product_id: media.productId,

    kind: media.kind,

    url: media.url,

    alt: media.alt,

    sort_order: media.sortOrder,

    storage_path: media.storagePath ?? null,

    poster_url: media.posterUrl ?? null,

  };

}



export function imageToRow(image: ProductMedia): ProductMediaRow {

  return mediaToRow({ ...image, kind: "image" });

}


