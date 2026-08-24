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

function decodePath(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * Recover the storage object key from a public media URL.
 *
 * Handles both the Cloudflare R2 host media lives on now and the legacy
 * Supabase Storage URLs still present on rows written before the migration.
 */
export function storagePathFromPublicUrl(url: string): string | null {
  const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/+$/, "");
  if (mediaBase && url.startsWith(`${mediaBase}/`)) {
    return decodePath(url.slice(mediaBase.length + 1)) || null;
  }

  const legacy = url.match(
    /\/storage\/v1\/object\/public\/product-images\/(.+)$/i,
  );
  if (legacy?.[1]) return decodePath(legacy[1]);

  return null;
}

export function sortProductMedia(
  media: ProductMedia[] | null | undefined,
): ProductMedia[] {
  return [...(media ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function primaryImage(
  product: Pick<Product, "media">,
): ProductMedia | undefined {
  const sorted = sortProductMedia(product.media);
  return sorted.find((m) => m.kind === "image") ?? sorted[0];
}

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
