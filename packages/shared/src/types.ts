import type { z } from "zod";
import type {
  brandSchema,
  categorySchema,
  leadSchema,
  productMediaSchema,
  productSchema,
  siteSettingsSchema,
  stockStatusSchema,
} from "./schemas";

export type StockStatus = z.infer<typeof stockStatusSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Brand = z.infer<typeof brandSchema>;
export type ProductMedia = z.infer<typeof productMediaSchema>;
/** @deprecated Use ProductMedia */
export type ProductImage = ProductMedia;
export type Product = z.infer<typeof productSchema>;
export type Lead = z.infer<typeof leadSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
