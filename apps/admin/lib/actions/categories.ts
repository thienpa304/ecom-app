"use server";

import { revalidatePath } from "next/cache";
import { createCategory, deleteCategory } from "@/lib/store";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createCategoryAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const parentRaw = String(formData.get("parentId") ?? "").trim();
  createCategory({
    name,
    slug: slugRaw || slugify(name),
    parentId: parentRaw === "" ? null : parentRaw,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });
  revalidatePath("/categories");
  revalidatePath("/");
}

export async function deleteCategoryAction(id: string): Promise<void> {
  deleteCategory(id);
  revalidatePath("/categories");
  revalidatePath("/");
}
