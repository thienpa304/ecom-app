"use server";

import { brandInputSchema } from "@ecom/shared";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { createBrand, deleteBrand, updateBrand } from "@/lib/store";
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

function readBrandForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();

  return brandInputSchema.safeParse({
    name,
    slug: slugRaw || slugify(name),
    description: String(formData.get("description") ?? "").trim(),
    metaTitle: String(formData.get("metaTitle") ?? "").trim(),
    metaDescription: String(formData.get("metaDescription") ?? "").trim(),
  });
}

export async function createBrandAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = readBrandForm(formData);

  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }

  await createBrand(parsed.data);
  revalidatePath("/brands");
  revalidatePath("/");
}

export async function updateBrandAction(
  id: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const parsed = readBrandForm(formData);

  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }

  const updated = await updateBrand(id, parsed.data);
  if (!updated) {
    throw new Error("Không tìm thấy thương hiệu");
  }

  revalidatePath("/brands");
  revalidatePath("/");
}

export async function deleteBrandAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteBrand(id);
  revalidatePath("/brands");
  revalidatePath("/");
}
