"use server";

import { categoryInputSchema } from "@ecom/shared";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { createCategory, deleteCategory } from "@/lib/store";
import { formatZodError } from "@/lib/validate-form";

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
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const parentRaw = String(formData.get("parentId") ?? "").trim();
  const parsed = categoryInputSchema.safeParse({
    name,
    slug: slugRaw || slugify(name),
    parentId: parentRaw === "" ? null : parentRaw,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });

  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }

  await createCategory(parsed.data);
  revalidatePath("/categories");
}

export async function deleteCategoryAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteCategory(id);
  revalidatePath("/categories");
}
