"use server";

import { revalidatePath } from "next/cache";
import {
  deleteMediaAsset,
  listMediaAssets,
  uploadProductMedia,
  type MediaAsset,
} from "@/lib/store";

export async function listMediaAction(
  filter: "image" | "video" | "all" = "all",
): Promise<MediaAsset[]> {
  return listMediaAssets(filter);
}

export async function uploadMediaAction(
  formData: FormData,
): Promise<{ urls: string[]; error?: string }> {
  try {
    const files = formData
      .getAll("files")
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length === 0) {
      return { urls: [], error: "Chưa chọn file nào." };
    }

    const urls: string[] = [];
    for (const file of files) {
      const isVideo = file.type.startsWith("video/");
      const url = await uploadProductMedia(file, isVideo ? "video" : "img");
      urls.push(url);
    }

    revalidatePath("/media");
    revalidatePath("/products");
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
