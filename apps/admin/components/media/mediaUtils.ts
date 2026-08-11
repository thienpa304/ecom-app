import type { MediaAsset } from "@/lib/media-store";

export const MAX_LABEL_LENGTH = 60;

export function formatBytes(n: number | null): string {
  if (n == null) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function slugifyLabel(input: string): string {
  return input
    .replace(/[đĐ]/g, "d")
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, MAX_LABEL_LENGTH)
    .replace(/^-+|-+$/g, "");
}

export function displayName(asset: MediaAsset): string {
  return asset.label?.trim() || asset.name;
}
