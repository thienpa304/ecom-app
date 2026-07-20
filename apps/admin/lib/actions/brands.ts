"use server";

import { brandInputSchema } from "@ecom/shared";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { createBrand, deleteBrand } from "@/lib/store";
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

export async function createBrandAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const parsed = brandInputSchema.safeParse({
    name,
    slug: slugRaw || slugify(name),
  });

  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }

  await createBrand(parsed.data);
  revalidatePath("/brands");
}

export async function deleteBrandAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteBrand(id);
  revalidatePath("/brands");
}
