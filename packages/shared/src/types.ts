import type { z } from "zod";
import type {
  brandSchema,
  categorySchema,
  faqEntrySchema,
  heroBulletIconSchema,
  heroBulletSchema,
  heroSlideSchema,
  leadSchema,
  openingHoursEntrySchema,
  productMediaSchema,
  productSchema,
  siteSettingsSchema,
  stockStatusSchema,
} from "./schemas";

export type StockStatus = z.infer<typeof stockStatusSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Brand = z.infer<typeof brandSchema>;
export type ProductMedia = z.infer<typeof productMediaSchema>;
export type ProductImage = ProductMedia;
export type Product = z.infer<typeof productSchema>;
export type Lead = z.infer<typeof leadSchema>;
export type HeroBulletIcon = z.infer<typeof heroBulletIconSchema>;
export type HeroSlide = z.infer<typeof heroSlideSchema>;
export type HeroBullet = z.infer<typeof heroBulletSchema>;
export type OpeningHoursEntry = z.infer<typeof openingHoursEntrySchema>;
export type FaqEntry = z.infer<typeof faqEntrySchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
