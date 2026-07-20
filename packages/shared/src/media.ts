import type { Product, ProductMedia } from "./types";
import { parseVideoUrl } from "./video";

export function inferMediaKindFromUrl(url: string): ProductMedia["kind"] {
  const trimmed = url.trim();
  if (!trimmed) return "image";

  const parsed = parseVideoUrl(trimmed);
  if (parsed?.kind === "youtube" || parsed?.kind === "tiktok") return "embed";
  if (parsed?.kind === "file") return "video";

  if (/\.(jpg|jpeg|png|gif|webp|avif|svg|bmp)(\?|$)/i.test(trimmed)) {
    return "image";
  }
  if (/picsum\.photos|placehold\.co/i.test(trimmed)) return "image";

  return "image";
}

/** Extract storage object path from Supabase public URL. */
export function storagePathFromPublicUrl(url: string): string | null {
  const match = url.match(
    /\/storage\/v1\/object\/public\/product-images\/(.+)$/i,
  );
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function sortProductMedia(
  media: ProductMedia[] | null | undefined,
): ProductMedia[] {
  return [...(media ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Primary catalog/card image — first image by sort order. */
export function primaryImage(
  product: Pick<Product, "media">,
): ProductMedia | undefined {
  const sorted = sortProductMedia(product.media);
  return sorted.find((m) => m.kind === "image") ?? sorted[0];
}

/** All media for gallery, sorted. */
export function galleryMedia(product: Pick<Product, "media">): ProductMedia[] {
  return sortProductMedia(product.media);
}

export function imageMedia(product: Pick<Product, "media">): ProductMedia[] {
  return sortProductMedia(product.media).filter((m) => m.kind === "image");
}

export function videoMedia(product: Pick<Product, "media">): ProductMedia[] {
  return sortProductMedia(product.media).filter(
    (m) => m.kind === "video" || m.kind === "embed",
  );
}
