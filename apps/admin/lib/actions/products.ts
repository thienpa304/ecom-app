"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Product, StockStatus } from "@ecom/shared";
import {
  createProduct,
  deleteProduct,
  toggleProductPublished,
  updateProduct,
  uploadProductMedia,
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
  const videoRaw = String(formData.get("videoUrl") ?? "").trim();

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
    videoUrl: videoRaw === "" ? null : videoRaw,
    images: parseImages(productId, String(formData.get("imageUrls") ?? "")),
  };
}

function collectFiles(formData: FormData, key: string): File[] {
  return formData
    .getAll(key)
    .filter((f): f is File => f instanceof File && f.size > 0);
}

/** Append multiple uploaded images from `imageFiles`. */
async function appendUploadedImages(
  formData: FormData,
  product: Omit<Product, "id">,
  productId: string,
): Promise<Omit<Product, "id">> {
  // Support both legacy single `imageFile` and new multi `imageFiles`
  const files = [
    ...collectFiles(formData, "imageFiles"),
    ...collectFiles(formData, "imageFile"),
  ];
  if (files.length === 0) return product;

  const uploaded = await Promise.all(
    files.map((file) => uploadProductMedia(file, "img")),
  );

  let nextIndex = product.images.length;
  const extra = uploaded.map((url) => {
    const img = {
      id: `${productId}-img-${nextIndex}`,
      productId,
      url,
      alt: `Ảnh ${nextIndex + 1}`,
      sortOrder: nextIndex,
    };
    nextIndex += 1;
    return img;
  });

  return {
    ...product,
    images: [...product.images, ...extra],
  };
}

/** Optional video file upload — overrides videoUrl when provided. */
async function appendUploadedVideo(
  formData: FormData,
  product: Omit<Product, "id">,
): Promise<Omit<Product, "id">> {
  const files = collectFiles(formData, "videoFile");
  const file = files[0];
  if (!file) return product;

  const url = await uploadProductMedia(file, "video");
  return { ...product, videoUrl: url };
}

export async function createProductAction(formData: FormData): Promise<void> {
  const tempId = `prod-${Date.now()}`;
  let data = readProductForm(formData, tempId);
  data = await appendUploadedImages(formData, data, tempId);
  data = await appendUploadedVideo(formData, data);
  const product = await createProduct(data);
  await updateProduct(product.id, {
    images: data.images.map((img, i) => ({
      ...img,
      id: `${product.id}-img-${i}`,
      productId: product.id,
    })),
    videoUrl: data.videoUrl ?? null,
  });
  revalidatePath("/products");
  revalidatePath("/");
  redirect(`/products/${product.id}/edit`);
}

export async function updateProductAction(
  id: string,
  formData: FormData,
): Promise<void> {
  let data = readProductForm(formData, id);
  data = await appendUploadedImages(formData, data, id);
  data = await appendUploadedVideo(formData, data);
  await updateProduct(id, data);
  revalidatePath("/products");
  revalidatePath(`/products/${id}/edit`);
  revalidatePath("/");
  redirect("/products");
}

export async function deleteProductAction(id: string): Promise<void> {
  await deleteProduct(id);
  revalidatePath("/products");
  revalidatePath("/");
}

export async function togglePublishAction(id: string): Promise<void> {
  await toggleProductPublished(id);
  revalidatePath("/products");
  revalidatePath("/");
}
