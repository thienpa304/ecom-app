"use server";

import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@ecom/shared";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import {
  MAX_MEDIA_LABEL_LENGTH,
  deleteMediaAssets,
  findMediaUsage,
  listMediaAssets,
  setMediaLabel,
  uploadProductMedia,
  type ListMediaParams,
  type ListMediaResult,
  type MediaAsset,
  type MediaUsage,
} from "@/lib/media-store";

const STORAGE_PATH_RE = /^(img|video|media)\/.+/;

export async function listMediaAction(
  filterOrParams: "image" | "video" | "all" | ListMediaParams = "all",
): Promise<ListMediaResult> {
  await requireAdmin();
  return listMediaAssets(filterOrParams);
}

export async function uploadMediaAction(
  formData: FormData,
): Promise<{ urls: string[]; error?: string }> {
  await requireAdmin();

  try {
    const files = formData
      .getAll("files")
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length === 0) {
      return { urls: [], error: "Chưa chọn file nào." };
    }

    for (const file of files) {
      if (file.size > MAX_UPLOAD_BYTES) {
        return {
          urls: [],
          error: `File "${file.name}" vượt quá ${MAX_UPLOAD_MB}MB.`,
        };
      }
    }

    const label = String(formData.get("label") ?? "").trim();

    const urls: string[] = [];
    for (const file of files) {
      const isVideo = file.type.startsWith("video/");
      const url = await uploadProductMedia(
        file,
        isVideo ? "video" : "img",
        label || undefined,
      );
      urls.push(url);
    }

    revalidatePath("/media");
    return { urls };
  } catch (e) {
    return {
      urls: [],
      error: e instanceof Error ? e.message : "Upload thất bại",
    };
  }
}

function validatePaths(paths: string[]): { unique: string[]; error?: string } {
  const unique = [...new Set(paths.filter(Boolean))];
  if (unique.length === 0) {
    return { unique, error: "Chưa chọn file nào." };
  }
  for (const path of unique) {
    if (!STORAGE_PATH_RE.test(path)) {
      return { unique, error: `Đường dẫn không hợp lệ: ${path}` };
    }
  }
  return { unique };
}

export async function renameMediaAction(
  path: string,
  label: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const { error } = validatePaths([path]);
  if (error) return { ok: false, error };

  if (label.trim().length > MAX_MEDIA_LABEL_LENGTH) {
    return {
      ok: false,
      error: `Tên file tối đa ${MAX_MEDIA_LABEL_LENGTH} ký tự.`,
    };
  }

  try {
    await setMediaLabel(path, label);
    revalidatePath("/media");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Không lưu được tên file",
    };
  }
}

export async function checkMediaUsageAction(
  paths: string[],
): Promise<{ usage: MediaUsage[]; error?: string }> {
  await requireAdmin();

  const { unique, error } = validatePaths(paths);
  if (error) return { usage: [], error };

  try {
    return { usage: await findMediaUsage(unique) };
  } catch (e) {
    return {
      usage: [],
      error: e instanceof Error ? e.message : "Không kiểm tra được liên kết",
    };
  }
}

export type DeleteMediaResponse = {
  ok: boolean;
  error?: string;
  deleted?: number;
  inUse?: MediaUsage[];
  referencesRemoved?: number;
};

export async function deleteMediaAction(
  path: string,
  opts: { force?: boolean } = {},
): Promise<DeleteMediaResponse> {
  return deleteMediaBulkAction([path], opts);
}

export async function deleteMediaBulkAction(
  paths: string[],
  opts: { force?: boolean } = {},
): Promise<DeleteMediaResponse> {
  await requireAdmin();

  const { unique, error } = validatePaths(paths);
  if (error) return { ok: false, error };

  try {
    const usage = await findMediaUsage(unique);
    if (usage.length > 0 && !opts.force) {
      const count = usage.reduce((n, u) => n + u.refs.length, 0);
      return {
        ok: false,
        inUse: usage,
        error: `${usage.length} file đang được dùng ở ${count} vị trí trong sản phẩm.`,
      };
    }

    const res = await deleteMediaAssets(unique, {
      purgeReferences: usage.length > 0,
    });

    revalidatePath("/media");
    if (res.referencesRemoved > 0) {
      revalidatePath("/products");
      for (const productId of new Set(
        usage.flatMap((u) => u.refs.map((r) => r.productId)),
      )) {
        revalidatePath(`/products/${productId}`);
      }
    }

    return {
      ok: true,
      deleted: res.deleted,
      referencesRemoved: res.referencesRemoved,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Xóa thất bại",
    };
  }
}

export type { MediaAsset, MediaUsage };
