import type { z } from "zod";
import type {
  brandSchema,
  categorySchema,
  leadSchema,
  productImageSchema,
  productSchema,
  siteSettingsSchema,
  stockStatusSchema,
} from "./schemas";

export type StockStatus = z.infer<typeof stockStatusSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Brand = z.infer<typeof brandSchema>;
export type ProductImage = z.infer<typeof productImageSchema>;
export type Product = z.infer<typeof productSchema>;
export type Lead = z.infer<typeof leadSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
