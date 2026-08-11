import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
  storagePathFromPublicUrl,
} from "@ecom/shared";
import { PRODUCT_IMAGES_BUCKET, createServerClient } from "./supabase";

export type MediaKind = "image" | "video" | "other";

export type MediaAsset = {
  path: string;
  url: string;
  name: string;
  label: string | null;
  size: number | null;
  kind: MediaKind;
  updatedAt: string | null;
};

export const MAX_MEDIA_LABEL_LENGTH = 60;

const MEDIA_LABELS_TABLE = "media_labels";
const MEDIA_LABEL_FETCH_LIMIT = 2000;
const FOLDER_FETCH_LIMIT = 200;

const IMAGE_EXT = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "avif",
  "svg",
  "bmp",
]);
const VIDEO_EXT = new Set(["mp4", "webm", "mov", "ogg", "m4v"]);
const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
  "image/bmp",
]);
const ALLOWED_VIDEO_MIME = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/ogg",
  "video/x-m4v",
]);

export function slugifyMediaName(input: string): string {
  return input
    .replace(/[đĐ]/g, "d")
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, MAX_MEDIA_LABEL_LENGTH)
    .replace(/^-+|-+$/g, "");
}

function mediaKindFromName(name: string): MediaKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (IMAGE_EXT.has(ext)) return "image";
  if (VIDEO_EXT.has(ext)) return "video";
  return "other";
}

function validateUploadFile(file: File): void {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `File "${file.name}" vượt quá ${MAX_UPLOAD_MB}MB (giới hạn upload)`,
    );
  }

  const kind = mediaKindFromName(file.name);
  if (kind === "other") {
    throw new Error(`File "${file.name}" không phải ảnh hoặc video`);
  }

  if (file.type) {
    if (kind === "image" && !ALLOWED_IMAGE_MIME.has(file.type)) {
      throw new Error(`Định dạng ảnh không hỗ trợ: ${file.type}`);
    }
    if (kind === "video" && !ALLOWED_VIDEO_MIME.has(file.type)) {
      throw new Error(`Định dạng video không hỗ trợ: ${file.type}`);
    }
  }
}

function publicUrlFor(path: string): string {
  const supabase = createServerClient();
  return supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path)
    .data.publicUrl;
}

export async function setMediaLabel(
  path: string,
  label: string,
): Promise<void> {
  const supabase = createServerClient();
  const trimmed = label.trim().slice(0, MAX_MEDIA_LABEL_LENGTH);

  const { error } = trimmed
    ? await supabase.from(MEDIA_LABELS_TABLE).upsert(
        {
          storage_path: path,
          label: trimmed,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "storage_path" },
      )
    : await supabase.from(MEDIA_LABELS_TABLE).delete().eq("storage_path", path);

  if (error) {
    throw new Error(`Failed to save media label: ${error.message}`);
  }
}

async function deleteMediaLabels(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const supabase = createServerClient();
  const { error } = await supabase
    .from(MEDIA_LABELS_TABLE)
    .delete()
    .in("storage_path", paths);
  if (error) {
    console.error("deleteMediaLabels:", error.message);
  }
}

async function fetchMediaLabels(): Promise<Map<string, string>> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from(MEDIA_LABELS_TABLE)
    .select("storage_path, label")
    .limit(MEDIA_LABEL_FETCH_LIMIT);

  if (error) {
    console.error("fetchMediaLabels:", error.message);
    return new Map();
  }

  return new Map(
    ((data ?? []) as { storage_path: string; label: string }[]).map((row) => [
      row.storage_path,
      row.label,
    ]),
  );
}

export async function uploadProductImage(file: File): Promise<string> {
  return uploadProductMedia(file, "img");
}

export async function uploadProductMedia(
  file: File,
  prefix = "media",
  label?: string,
): Promise<string> {
  validateUploadFile(file);

  const supabase = createServerClient();
  const kind = mediaKindFromName(file.name);
  const folder =
    prefix === "img" || prefix === "video" || prefix === "media"
      ? prefix
      : kind === "video"
        ? "video"
        : "img";
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const trimmedLabel = label?.trim() ?? "";
  const baseName = slugifyMediaName(
    trimmedLabel || file.name.replace(/\.[^.]*$/, ""),
  );
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `${folder}/${baseName ? `${baseName}-` : ""}${suffix}.${ext}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (error) {
    throw new Error(`Failed to upload media: ${error.message}`);
  }

  if (trimmedLabel) {
    await setMediaLabel(path, trimmedLabel);
  }

  return publicUrlFor(path);
}

export type ListMediaParams = {
  filter?: "image" | "video" | "all";
  q?: string;
  page?: number;
  pageSize?: number;
};

export type ListMediaResult = {
  items: MediaAsset[];
  total: number;
  page: number;
  pageSize: number;
};

function foldersFor(filter: "image" | "video" | "all"): string[] {
  if (filter === "image") return ["img", "media", ""];
  if (filter === "video") return ["video", "media", ""];
  return ["img", "video", "media", ""];
}

function matchesQuery(asset: MediaAsset, q: string): boolean {
  if (!q) return true;
  return (
    asset.name.toLowerCase().includes(q) ||
    asset.path.toLowerCase().includes(q) ||
    (asset.label?.toLowerCase().includes(q) ?? false)
  );
}

async function listFolderAssets(
  folder: string,
  filter: "image" | "video" | "all",
): Promise<MediaAsset[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .list(folder || undefined, {
      limit: FOLDER_FETCH_LIMIT,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) {
    console.error(`listMediaAssets(${folder}):`, error.message);
    return [];
  }

  const assets: MediaAsset[] = [];
  for (const item of data ?? []) {
    if (!item.name || item.id == null) continue;
    const kind = mediaKindFromName(item.name);
    if (filter === "image" && kind !== "image") continue;
    if (filter === "video" && kind !== "video") continue;
    const storagePath = folder ? `${folder}/${item.name}` : item.name;
    assets.push({
      path: storagePath,
      url: publicUrlFor(storagePath),
      name: item.name,
      label: null,
      size: item.metadata?.size ?? null,
      kind,
      updatedAt: item.updated_at ?? item.created_at ?? null,
    });
  }
  return assets;
}

export async function listMediaAssets(
  filterOrParams: "image" | "video" | "all" | ListMediaParams = "all",
): Promise<ListMediaResult> {
  const params: ListMediaParams =
    typeof filterOrParams === "string"
      ? { filter: filterOrParams }
      : filterOrParams;
  const filter = params.filter ?? "all";
  const q = params.q?.trim().toLowerCase() ?? "";
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 24));

  const [folderResults, labels] = await Promise.all([
    Promise.all(
      foldersFor(filter).map((folder) => listFolderAssets(folder, filter)),
    ),
    fetchMediaLabels(),
  ]);

  const seen = new Set<string>();
  const all = folderResults
    .flat()
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
    .filter((asset) => {
      if (seen.has(asset.path)) return false;
      seen.add(asset.path);
      return true;
    })
    .map((asset) => ({ ...asset, label: labels.get(asset.path) ?? null }))
    .filter((asset) => matchesQuery(asset, q));

  const from = (page - 1) * pageSize;
  return {
    items: all.slice(from, from + pageSize),
    total: all.length,
    page,
    pageSize,
  };
}

export type MediaUsageRef = {
  mediaId: string;
  productId: string;
  productName: string;
};

export type MediaUsage = {
  path: string;
  refs: MediaUsageRef[];
};

const MEDIA_REF_COLUMNS = "id, url, storage_path, product_id";

type MediaRefRow = {
  id: string;
  url: string;
  storage_path: string | null;
  product_id: string;
};

export async function findMediaUsage(paths: string[]): Promise<MediaUsage[]> {
  const wanted = [...new Set(paths.filter(Boolean))];
  if (wanted.length === 0) return [];

  const supabase = createServerClient();

  const [matched, legacy] = await Promise.all([
    supabase
      .from("product_media")
      .select(MEDIA_REF_COLUMNS)
      .in("storage_path", wanted),
    supabase
      .from("product_media")
      .select(MEDIA_REF_COLUMNS)
      .is("storage_path", null),
  ]);

  for (const res of [matched, legacy]) {
    if (res.error) {
      throw new Error(`Failed to check media usage: ${res.error.message}`);
    }
  }

  const wantedSet = new Set(wanted);
  const byPath = new Map<string, MediaRefRow[]>();
  const collect = (row: MediaRefRow, path: string | null) => {
    if (!path || !wantedSet.has(path)) return;
    const list = byPath.get(path);
    if (list) list.push(row);
    else byPath.set(path, [row]);
  };

  for (const row of (matched.data ?? []) as MediaRefRow[]) {
    collect(row, row.storage_path);
  }
  for (const row of (legacy.data ?? []) as MediaRefRow[]) {
    collect(row, storagePathFromPublicUrl(row.url));
  }

  if (byPath.size === 0) return [];

  const productIds = [
    ...new Set([...byPath.values()].flat().map((row) => row.product_id)),
  ];
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("id, name")
    .in("id", productIds);
  if (prodError) {
    throw new Error(`Failed to check media usage: ${prodError.message}`);
  }

  const nameById = new Map(
    ((products ?? []) as { id: string; name: string }[]).map((p) => [
      p.id,
      p.name,
    ]),
  );

  return wanted
    .filter((path) => byPath.has(path))
    .map((path) => ({
      path,
      refs: (byPath.get(path) ?? []).map((row) => ({
        mediaId: row.id,
        productId: row.product_id,
        productName: nameById.get(row.product_id) ?? row.product_id,
      })),
    }));
}

export async function purgeMediaReferences(paths: string[]): Promise<number> {
  const usage = await findMediaUsage(paths);
  const mediaIds = usage.flatMap((u) => u.refs.map((r) => r.mediaId));
  if (mediaIds.length === 0) return 0;

  const supabase = createServerClient();
  const { error } = await supabase
    .from("product_media")
    .delete()
    .in("id", mediaIds);
  if (error) {
    throw new Error(`Failed to clear media references: ${error.message}`);
  }
  return mediaIds.length;
}

export type DeleteMediaResult = {
  deleted: number;
  referencesRemoved: number;
};

export async function deleteMediaAsset(
  path: string,
  opts: { purgeReferences?: boolean } = {},
): Promise<DeleteMediaResult> {
  return deleteMediaAssets([path], opts);
}

export async function deleteMediaAssets(
  paths: string[],
  opts: { purgeReferences?: boolean } = {},
): Promise<DeleteMediaResult> {
  if (paths.length === 0) return { deleted: 0, referencesRemoved: 0 };

  const referencesRemoved = opts.purgeReferences
    ? await purgeMediaReferences(paths)
    : 0;

  const supabase = createServerClient();
  const { error } = await supabase
    .storage.from(PRODUCT_IMAGES_BUCKET)
    .remove(paths);
  if (error) {
    throw new Error(`Failed to delete media: ${error.message}`);
  }

  await deleteMediaLabels(paths);

  return { deleted: paths.length, referencesRemoved };
}
