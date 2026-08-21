"use server";

import { categoryInputSchema, type Category } from "@ecom/shared";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import {
  createCategory,
  deleteCategory,
  getCategories,
  reorderCategories,
  updateCategory,
} from "@/lib/store";
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

function readCategoryForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const parentRaw = String(formData.get("parentId") ?? "").trim();

  return categoryInputSchema.safeParse({
    name,
    slug: slugRaw || slugify(name),
    parentId: parentRaw === "" ? null : parentRaw,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });
}

function revalidateCategories(): void {
  revalidatePath("/categories");
  revalidatePath("/");
}

/**
 * Collects `id` plus every descendant of `id`. Walking the tree with a visited
 * set keeps this terminating even if the stored data already contains a cycle.
 */
function collectSelfAndDescendants(
  categories: Category[],
  id: string,
): Set<string> {
  const blocked = new Set<string>([id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const category of categories) {
      if (blocked.has(category.id)) continue;
      if (category.parentId && blocked.has(category.parentId)) {
        blocked.add(category.id);
        grew = true;
      }
    }
  }
  return blocked;
}

export async function createCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = readCategoryForm(formData);

  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }

  await createCategory(parsed.data);
  revalidateCategories();
}

export async function updateCategoryAction(
  id: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const parsed = readCategoryForm(formData);

  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }

  const { parentId } = parsed.data;
  if (parentId) {
    const categories = await getCategories();
    if (collectSelfAndDescendants(categories, id).has(parentId)) {
      throw new Error(
        "Không thể chọn chính nó hoặc danh mục con làm danh mục cha",
      );
    }
  }

  const updated = await updateCategory(id, parsed.data);
  if (!updated) {
    throw new Error("Không tìm thấy danh mục");
  }

  revalidateCategories();
}

export async function reorderCategoriesAction(ids: string[]): Promise<void> {
  await requireAdmin();
  await reorderCategories(ids);
  revalidateCategories();
}

export async function deleteCategoryAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteCategory(id);
  revalidateCategories();
}
