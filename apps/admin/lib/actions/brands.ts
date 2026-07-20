"use server";

import { revalidatePath } from "next/cache";
import { createBrand, deleteBrand } from "@/lib/store";

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
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const slugRaw = String(formData.get("slug") ?? "").trim();
  await createBrand({ name, slug: slugRaw || slugify(name) });
  revalidatePath("/brands");
  revalidatePath("/");
}

export async function deleteBrandAction(id: string): Promise<void> {
  await deleteBrand(id);
  revalidatePath("/brands");
  revalidatePath("/");
}
