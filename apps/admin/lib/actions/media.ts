"use server";

import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@ecom/shared";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import {
  deleteMediaAsset,
  listMediaAssets,
  uploadProductMedia,
  type MediaAsset,
} from "@/lib/store";

const STORAGE_PATH_RE = /^(img|video|media)\/.+/;

export async function listMediaAction(
  filter: "image" | "video" | "all" = "all",
): Promise<MediaAsset[]> {
  await requireAdmin();
  return listMediaAssets(filter);
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

    const urls: string[] = [];
    for (const file of files) {
      const isVideo = file.type.startsWith("video/");
      const url = await uploadProductMedia(file, isVideo ? "video" : "img");
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

export async function deleteMediaAction(
  path: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  if (!STORAGE_PATH_RE.test(path)) {
    return { ok: false, error: "Đường dẫn file không hợp lệ." };
  }

  try {
    await deleteMediaAsset(path);
    revalidatePath("/media");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Xóa thất bại",
    };
  }
}
