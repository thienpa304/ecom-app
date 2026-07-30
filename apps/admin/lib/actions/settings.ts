"use server";

import {
  DEFAULT_HEADER_CTA_LABEL,
  FAQ_MAX,
  HERO_BULLET_MAX,
  HERO_SLIDE_MAX,
  OPENING_HOURS_MAX,
  extractEmbedSrc,
  parseFaqs,
  parseHeroBullets,
  parseHeroSlides,
  parseOpeningHours,
  siteSettingsUpdateSchema,
} from "@ecom/shared";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { updateSiteSettings } from "@/lib/store";
import { formatZodError } from "@/lib/validate-form";

export type SettingsActionState = {
  ok: boolean;
  message: string;
};

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function updateSiteSettingsAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await requireAdmin();

  const parsed = siteSettingsUpdateSchema.safeParse({
    siteName: text(formData, "siteName"),
    tagline: text(formData, "tagline"),
    phone: text(formData, "phone"),
    zaloUrl: text(formData, "zaloUrl") || "https://zalo.me/",
    address: text(formData, "address"),
    email: text(formData, "email"),
    logoUrl: text(formData, "logoUrl"),
    logoSquareUrl: text(formData, "logoSquareUrl"),
    headerCtaLabel:
      text(formData, "headerCtaLabel") || DEFAULT_HEADER_CTA_LABEL,
    heroTitle: text(formData, "heroTitle"),
    heroHighlight: text(formData, "heroHighlight"),
    heroSubtitle: text(formData, "heroSubtitle"),
    heroImageUrl: text(formData, "heroImageUrl"),
    heroCardTitle: text(formData, "heroCardTitle"),
    heroCardCaption: text(formData, "heroCardCaption"),
    heroSlides: parseHeroSlides(text(formData, "heroSlides")).slice(
      0,
      HERO_SLIDE_MAX,
    ),
    heroBullets: parseHeroBullets(text(formData, "heroBullets")).slice(
      0,
      HERO_BULLET_MAX,
    ),
    metaDescription: text(formData, "metaDescription"),
    footerBlurb: text(formData, "footerBlurb"),
    searchPlaceholder:
      text(formData, "searchPlaceholder") || "Tìm sản phẩm...",
    facebookUrl: text(formData, "facebookUrl"),
    youtubeUrl: text(formData, "youtubeUrl"),
    tiktokUrl: text(formData, "tiktokUrl"),
    fanpageEmbedUrl: extractEmbedSrc(text(formData, "fanpageEmbedUrl")),
    mapEmbedUrl: extractEmbedSrc(text(formData, "mapEmbedUrl")),
    addressLocality: text(formData, "addressLocality"),
    addressRegion: text(formData, "addressRegion"),
    postalCode: text(formData, "postalCode"),
    latitude: text(formData, "latitude"),
    longitude: text(formData, "longitude"),
    priceRange: text(formData, "priceRange"),
    openingHours: parseOpeningHours(text(formData, "openingHours")).slice(
      0,
      OPENING_HOURS_MAX,
    ),
    faqs: parseFaqs(text(formData, "faqs")).slice(0, FAQ_MAX),
    shippingPolicy: text(formData, "shippingPolicy"),
    returnPolicy: text(formData, "returnPolicy"),
  });

  if (!parsed.success) {
    return { ok: false, message: formatZodError(parsed.error) };
  }

  try {
    await updateSiteSettings(parsed.data);
    revalidatePath("/settings");
    revalidatePath("/");
    return {
      ok: true,
      message: "Đã lưu cấu hình. Web sẽ cập nhật trong giây lát.",
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Lỗi không xác định";
    return { ok: false, message };
  }
}
