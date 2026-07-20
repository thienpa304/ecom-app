"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Product, StockStatus } from "@ecom/shared";
import {
  createProduct,
  deleteProduct,
  toggleProductPublished,
  updateProduct,
} from "@/lib/store";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseSpecs(raw: string): Record<string, string> {
  const specs: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const sep = trimmed.indexOf(":");
    if (sep < 0) continue;
    const key = trimmed.slice(0, sep).trim();
    const val = trimmed.slice(sep + 1).trim();
    if (key) specs[key] = val;
  }
  return specs;
}

function parseImages(productId: string, raw: string): Product["images"] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((url, index) => ({
      id: `${productId}-img-${index}`,
      productId,
      url,
      alt: `Ảnh ${index + 1}`,
      sortOrder: index,
    }));
}

function readProductForm(formData: FormData, productId: string): Omit<Product, "id"> {
  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const saleRaw = String(formData.get("salePrice") ?? "").trim();
  const motorRaw = String(formData.get("motor") ?? "").trim();

  return {
    name,
    slug: slugRaw || slugify(name),
    model: String(formData.get("model") ?? "").trim(),
    brandId: String(formData.get("brandId") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    price: Number(formData.get("price") ?? 0),
    salePrice: saleRaw === "" ? null : Number(saleRaw),
    stockStatus: String(formData.get("stockStatus") ?? "in_stock") as StockStatus,
    soldCount: Number(formData.get("soldCount") ?? 0),
    warranty: String(formData.get("warranty") ?? "").trim(),
    origin: String(formData.get("origin") ?? "").trim(),
    motor: motorRaw === "" ? null : motorRaw,
    specs: parseSpecs(String(formData.get("specs") ?? "")),
    isPublished: formData.get("isPublished") === "on",
    description: String(formData.get("description") ?? "").trim() || undefined,
    images: parseImages(productId, String(formData.get("imageUrls") ?? "")),
  };
}

export async function createProductAction(formData: FormData): Promise<void> {
  const tempId = `prod-${Date.now()}`;
  const data = readProductForm(formData, tempId);
  const product = createProduct(data);
  // Fix image productIds to match created id
  updateProduct(product.id, {
    images: data.images.map((img, i) => ({
      ...img,
      id: `${product.id}-img-${i}`,
      productId: product.id,
    })),
  });
  revalidatePath("/products");
  revalidatePath("/");
  redirect(`/products/${product.id}/edit`);
}

export async function updateProductAction(
  id: string,
  formData: FormData,
): Promise<void> {
  const data = readProductForm(formData, id);
  updateProduct(id, data);
  revalidatePath("/products");
  revalidatePath(`/products/${id}/edit`);
  revalidatePath("/");
  redirect("/products");
}

export async function deleteProductAction(id: string): Promise<void> {
  deleteProduct(id);
  revalidatePath("/products");
  revalidatePath("/");
}

export async function togglePublishAction(id: string): Promise<void> {
  toggleProductPublished(id);
  revalidatePath("/products");
  revalidatePath("/");
}
