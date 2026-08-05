"use server";

import { HOME_SECTION_PRODUCT_COUNT, homeSectionInputSchema } from "@ecom/shared";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import {
  createHomeSection,
  deleteHomeSection,
  listHomeSections,
  reorderHomeSections,
  updateHomeSection,
} from "@/lib/store";
import { formatZodError } from "@/lib/validate-form";

function toInt(value: FormDataEntryValue | null, fallback: number): number {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

function readHomeSectionForm(formData: FormData) {
  const categoryId = String(formData.get("categoryId") ?? "").trim();

  return homeSectionInputSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    kind: String(formData.get("kind") ?? ""),
    categoryId: categoryId || null,
    productLimit: toInt(
      formData.get("productLimit"),
      HOME_SECTION_PRODUCT_COUNT,
    ),
    style: String(formData.get("style") ?? "plain"),
    sortOrder: toInt(formData.get("sortOrder"), 0),
    isPublished: String(formData.get("isPublished") ?? "") === "on",
  });
}

function revalidateHomeSections(): void {
  revalidatePath("/home-sections");
  revalidatePath("/");
}

export async function createHomeSectionAction(
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const parsed = readHomeSectionForm(formData);

  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }

  await createHomeSection(parsed.data);
  revalidateHomeSections();
}

export async function updateHomeSectionAction(
  id: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const parsed = readHomeSectionForm(formData);

  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }

  const updated = await updateHomeSection(id, parsed.data);
  if (!updated) {
    throw new Error("Không tìm thấy section");
  }

  revalidateHomeSections();
}

export async function deleteHomeSectionAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteHomeSection(id);
  revalidateHomeSections();
}

export async function reorderHomeSectionsAction(ids: string[]): Promise<void> {
  await requireAdmin();
  await reorderHomeSections(ids);
  revalidateHomeSections();
}

export async function setHomeSectionPublishedAction(
  id: string,
  isPublished: boolean,
): Promise<void> {
  await requireAdmin();

  const sections = await listHomeSections();
  const target = sections.find((section) => section.id === id);
  if (!target) {
    throw new Error("Không tìm thấy section");
  }

  const updated = await updateHomeSection(id, {
    title: target.title,
    kind: target.kind,
    categoryId: target.categoryId,
    productLimit: target.productLimit,
    style: target.style,
    sortOrder: target.sortOrder,
    isPublished,
  });
  if (!updated) {
    throw new Error("Không tìm thấy section");
  }

  revalidateHomeSections();
}
