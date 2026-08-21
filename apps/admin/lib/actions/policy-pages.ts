"use server";

import { policyPageInputSchema, sanitizeArticleHtml } from "@ecom/shared";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import {
  createPolicyPage,
  deletePolicyPage,
  updatePolicyPage,
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

function readPolicyPageForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();

  return policyPageInputSchema.safeParse({
    title,
    slug: slugRaw || slugify(title),
    body: sanitizeArticleHtml(String(formData.get("body") ?? "")),
    metaTitle: String(formData.get("metaTitle") ?? ""),
    metaDescription: String(formData.get("metaDescription") ?? ""),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    isPublished: formData.get("isPublished") === "on",
  });
}

/**
 * Storefront đọc bảng này ở footer trên MỌI trang, nên phải revalidate cả "/"
 * ngoài trang quản trị.
 */
function revalidatePolicyPages(): void {
  revalidatePath("/policies");
  revalidatePath("/");
}

export async function createPolicyPageAction(
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const parsed = readPolicyPageForm(formData);
  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }

  await createPolicyPage(parsed.data);
  revalidatePolicyPages();
}

export async function updatePolicyPageAction(
  id: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const parsed = readPolicyPageForm(formData);
  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }

  const updated = await updatePolicyPage(id, parsed.data);
  if (!updated) {
    throw new Error("Không tìm thấy trang chính sách");
  }

  revalidatePolicyPages();
}

export async function deletePolicyPageAction(id: string): Promise<void> {
  await requireAdmin();
  await deletePolicyPage(id);
  revalidatePolicyPages();
}
