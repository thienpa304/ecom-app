"use server";

import {
  inferMediaKindFromUrl,
  productFormSchema,
  storagePathFromPublicUrl,
  type Product,
} from "@ecom/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import {
  createProduct,
  deleteProduct,
  toggleProductPublished,
  updateProduct,
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

function readProductForm(formData: FormData, productId: string): Omit<Product, "id"> {
  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const saleRaw = String(formData.get("salePrice") ?? "").trim();
  const motorRaw = String(formData.get("motor") ?? "").trim();
  const mediaRaw = String(formData.get("mediaJson") ?? "[]");

  let mediaDrafts: unknown;
  try {
    mediaDrafts = JSON.parse(mediaRaw);
  } catch {
    throw new Error("Dữ liệu media không hợp lệ (JSON)");
  }

  const parsed = productFormSchema.safeParse({
    name,
    slug: slugRaw || slugify(name),
    model: String(formData.get("model") ?? "").trim(),
    brandId: String(formData.get("brandId") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    price: Number(formData.get("price") ?? 0),
    salePrice: saleRaw === "" ? null : Number(saleRaw),
    stockStatus: String(formData.get("stockStatus") ?? "in_stock"),
    soldCount: Number(formData.get("soldCount") ?? 0),
    warranty: String(formData.get("warranty") ?? "").trim(),
    origin: String(formData.get("origin") ?? "").trim(),
    motor: motorRaw === "" ? null : motorRaw,
    specs: parseSpecs(String(formData.get("specs") ?? "")),
    isPublished: formData.get("isPublished") === "on",
    description: String(formData.get("description") ?? "").trim() || undefined,
    media: Array.isArray(mediaDrafts) ? mediaDrafts : [],
  });

  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }

  const data = parsed.data;
  return {
    ...data,
    media: data.media.map((item, index) => {
      const kind = item.kind ?? inferMediaKindFromUrl(item.url);
      return {
        id: item.id || `${productId}-media-${index}`,
        productId,
        kind,
        url: item.url,
        alt:
          item.alt?.trim() ||
          (kind === "image" ? `Ảnh ${index + 1}` : "Video sản phẩm"),
        sortOrder: index,
        storagePath: item.storagePath ?? storagePathFromPublicUrl(item.url),
        posterUrl: item.posterUrl ?? null,
      };
    }),
  };
}

export async function createProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = `prod-${Date.now()}`;
  const data = readProductForm(formData, id);
  const product = await createProduct({ ...data, id });
  revalidatePath("/products");
  redirect(`/products/${product.id}/edit`);
}

export async function updateProductAction(
  id: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const data = readProductForm(formData, id);
  await updateProduct(id, data);
  revalidatePath("/products");
  revalidatePath(`/products/${id}/edit`);
  redirect("/products");
}

export async function deleteProductAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteProduct(id);
  revalidatePath("/products");
}

export async function togglePublishAction(id: string): Promise<void> {
  await requireAdmin();
  await toggleProductPublished(id);
  revalidatePath("/products");
}
