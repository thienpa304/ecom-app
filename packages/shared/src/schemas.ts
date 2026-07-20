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
});

export const brandSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export const productImageSchema = z.object({
  id: z.string(),
  productId: z.string(),
  url: z.string().url(),
  alt: z.string(),
  sortOrder: z.number().int(),
});

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
  images: z.array(productImageSchema),
});

export const leadSchema = z.object({
  id: z.string(),
  productId: z.string().nullable(),
  name: z.string(),
  phone: z.string(),
  note: z.string(),
  createdAt: z.string(),
});

export const siteSettingsSchema = z.object({
  id: z.number().int(),
  siteName: z.string().min(1),
  tagline: z.string(),
  phone: z.string().min(1),
  zaloUrl: z.string().min(1),
  address: z.string(),
  email: z.string(),
  heroTitle: z.string(),
  heroSubtitle: z.string(),
  metaDescription: z.string(),
  footerBlurb: z.string(),
  searchPlaceholder: z.string(),
  updatedAt: z.string().optional(),
});

export const siteSettingsUpdateSchema = siteSettingsSchema.omit({
  id: true,
  updatedAt: true,
});
