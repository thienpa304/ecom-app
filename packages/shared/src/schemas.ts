import { z } from "zod";

export const stockStatusSchema = z.enum([
  "in_stock",
  "out_of_stock",
  "discontinued",
]);

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  parentId: z.string().nullable(),
  sortOrder: z.number().int(),
  description: z.string(),
});

export const brandSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
});

export const productMediaKindSchema = z.enum(["image", "video", "embed"]);

export const productMediaSchema = z.object({
  id: z.string(),
  productId: z.string(),
  kind: productMediaKindSchema,
  url: z.string().url(),
  alt: z.string(),
  sortOrder: z.number().int(),
  storagePath: z.string().nullable().optional(),
  posterUrl: z.string().nullable().optional(),
});

export const productImageSchema = productMediaSchema;

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  model: z.string(),
  brandId: z.string(),
  categoryId: z.string(),
  price: z.number().nonnegative(),
  salePrice: z.number().nonnegative().nullable(),
  stockStatus: stockStatusSchema,
  soldCount: z.number().int().nonnegative(),
  warranty: z.string(),
  origin: z.string(),
  motor: z.string().nullable(),
  specs: z.record(z.string(), z.string()),
  isPublished: z.boolean(),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  media: z.array(productMediaSchema),
});

export const postSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  body: z.string(),
  coverUrl: z.string(),
  coverAlt: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  authorName: z.string(),
  isPublished: z.boolean(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const policyPageSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  body: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  sortOrder: z.number(),
  isPublished: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const leadSchema = z.object({
  id: z.string(),
  productId: z.string().nullable(),
  name: z.string(),
  phone: z.string(),
  note: z.string(),
  createdAt: z.string(),
});

export const homeSectionKindSchema = z.enum([
  "top_sellers",
  "featured",
  "video",
  "category",
  "all_products",
]);

export const homeSectionStyleSchema = z.enum(["plain", "red_banner"]);

export const homeSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: homeSectionKindSchema,
  categoryId: z.string().nullable(),
  productLimit: z.number().int(),
  style: homeSectionStyleSchema,
  sortOrder: z.number().int(),
  isPublished: z.boolean(),
});

export const heroBulletIconSchema = z.enum([
  "globe",
  "star",
  "check",
  "gear",
  "shield",
  "truck",
]);

export const heroSlideSchema = z.object({
  url: z.string().min(1),
  alt: z.string().default(""),
  href: z.string().default(""),
});

export const heroBulletSchema = z.object({
  icon: heroBulletIconSchema.catch("check"),
  bold: z.string().default(""),
  text: z.string().default(""),
});

export const openingHoursEntrySchema = z.object({
  days: z.array(z.string()),
  opens: z.string(),
  closes: z.string(),
});

export const faqEntrySchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const siteSettingsSchema = z.object({
  id: z.number().int(),
  siteName: z.string().min(1),
  tagline: z.string(),
  phone: z.string().min(1),
  zaloUrl: z.string().min(1),
  address: z.string(),
  email: z.string(),
  logoUrl: z.string(),
  logoSquareUrl: z.string(),
  headerCtaLabel: z.string(),
  heroTitle: z.string(),
  heroHighlight: z.string(),
  heroSubtitle: z.string(),
  heroImageUrl: z.string(),
  heroCardTitle: z.string(),
  heroCardCaption: z.string(),
  heroSlides: z.array(heroSlideSchema),
  heroBullets: z.array(heroBulletSchema),
  metaDescription: z.string(),
  footerBlurb: z.string(),
  searchPlaceholder: z.string(),
  facebookUrl: z.string(),
  youtubeUrl: z.string(),
  tiktokUrl: z.string(),
  fanpageEmbedUrl: z.string(),
  mapEmbedUrl: z.string(),
  addressLocality: z.string(),
  addressRegion: z.string(),
  postalCode: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  priceRange: z.string(),
  openingHours: z.array(openingHoursEntrySchema),
  faqs: z.array(faqEntrySchema),
  shippingPolicy: z.string(),
  returnPolicy: z.string(),
  updatedAt: z.string().optional(),
});

export const siteSettingsUpdateSchema = siteSettingsSchema.omit({
  id: true,
  updatedAt: true,
});

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugInputSchema = z
  .string()
  .trim()
  .min(1, "Slug không được để trống")
  .regex(slugPattern, "Slug chỉ gồm chữ thường, số và dấu gạch ngang");

export const brandInputSchema = z.object({
  name: z.string().trim().min(1, "Nhập tên thương hiệu"),
  slug: slugInputSchema,
  description: z.string().default(""),
  metaTitle: z.string().default(""),
  metaDescription: z.string().default(""),
});

export const postInputSchema = z.object({
  title: z.string().trim().min(1, "Nhập tiêu đề bài viết"),
  slug: slugInputSchema,
  excerpt: z.string().trim().default(""),
  body: z.string().default(""),
  coverUrl: z.string().trim().default(""),
  coverAlt: z.string().trim().default(""),
  metaTitle: z.string().trim().default(""),
  metaDescription: z.string().trim().default(""),
  authorName: z.string().trim().default(""),
  isPublished: z.boolean(),
  publishedAt: z.string().trim().nullable(),
});

export const policyPageInputSchema = z.object({
  title: z.string().trim().min(1, "Nhập tiêu đề trang"),
  slug: slugInputSchema,
  body: z.string().default(""),
  metaTitle: z.string().trim().default(""),
  metaDescription: z.string().trim().default(""),
  sortOrder: z.number().int().nonnegative(),
  isPublished: z.boolean(),
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, "Nhập tên danh mục"),
  slug: slugInputSchema,
  parentId: z.string().nullable(),
  sortOrder: z.number().int().nonnegative(),
  description: z.string().trim().default(""),
});

export const homeSectionInputSchema = z
  .object({
    title: z.string().trim().min(1, "Nhập tiêu đề section"),
    kind: homeSectionKindSchema,
    categoryId: z.string().nullable(),
    productLimit: z
      .number()
      .int()
      .min(1, "Số sản phẩm phải từ 1 trở lên")
      .max(48, "Số sản phẩm tối đa là 48"),
    style: homeSectionStyleSchema,
    sortOrder: z.number().int().nonnegative(),
    isPublished: z.boolean(),
  })
  .refine((d) => d.kind !== "category" || Boolean(d.categoryId), {
    message: "Chọn danh mục cho section theo danh mục",
    path: ["categoryId"],
  });

export const productMediaDraftSchema = z.object({
  id: z.string().optional(),
  kind: productMediaKindSchema.optional(),
  url: z.string().url("URL media không hợp lệ"),
  alt: z.string().optional(),
  storagePath: z.string().nullable().optional(),
  posterUrl: z.string().nullable().optional(),
});

export const productFormSchema = z
  .object({
    name: z.string().trim().min(1, "Nhập tên sản phẩm"),
    slug: slugInputSchema,
    model: z.string().trim().min(1, "Nhập model"),
    brandId: z.string().min(1, "Chọn thương hiệu"),
    categoryId: z.string().min(1, "Chọn danh mục"),
    price: z.number().finite().nonnegative("Giá phải >= 0"),
    salePrice: z.number().finite().nonnegative().nullable(),
    stockStatus: stockStatusSchema,
    soldCount: z.number().int().nonnegative(),
    warranty: z.string(),
    origin: z.string(),
    motor: z.string().nullable(),
    specs: z.record(z.string(), z.string()),
    isPublished: z.boolean(),
    description: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    seoKeywords: z.string().optional(),
    media: z.array(productMediaDraftSchema),
  })
  .refine((d) => d.salePrice == null || d.salePrice <= d.price, {
    message: "Giá khuyến mãi phải nhỏ hơn hoặc bằng giá gốc",
    path: ["salePrice"],
  });
