"use server";

import { postInputSchema, sanitizeArticleHtml } from "@ecom/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import {
  createPost,
  deletePost,
  getPost,
  togglePostPublished,
  updatePost,
  type PostInput,
} from "@/lib/store";
import { formatZodError } from "@/lib/validate-form";

export type PostActionState = {
  ok: boolean;
  message: string;
};

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function readPostForm(formData: FormData): PostInput {
  const title = String(formData.get("title") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const publishedAtRaw = String(formData.get("publishedAt") ?? "").trim();

  const parsed = postInputSchema.safeParse({
    title,
    slug: slugRaw || slugify(title),
    excerpt: String(formData.get("excerpt") ?? ""),
    body: sanitizeArticleHtml(String(formData.get("body") ?? "")),
    coverUrl: String(formData.get("coverUrl") ?? ""),
    coverAlt: String(formData.get("coverAlt") ?? ""),
    metaTitle: String(formData.get("metaTitle") ?? ""),
    metaDescription: String(formData.get("metaDescription") ?? ""),
    authorName: String(formData.get("authorName") ?? ""),
    isPublished: formData.get("isPublished") === "on",
    publishedAt: publishedAtRaw || null,
  });

  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }
  return parsed.data;
}

export async function createPostAction(
  formData: FormData,
): Promise<PostActionState> {
  await requireAdmin();

  let postId: string;
  try {
    const data = readPostForm(formData);
    const publishedAt =
      data.isPublished && !data.publishedAt
        ? new Date().toISOString()
        : data.publishedAt;

    const post = await createPost({ ...data, publishedAt });
    postId = post.id;
    revalidatePath("/posts");
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Không tạo được bài viết",
    };
  }

  redirect(`/posts/${postId}/edit`);
}

export async function updatePostAction(
  id: string,
  formData: FormData,
): Promise<PostActionState> {
  await requireAdmin();

  try {
    const data = readPostForm(formData);
    const existing = await getPost(id);
    const publishedAt =
      data.publishedAt ??
      existing?.publishedAt ??
      (data.isPublished ? new Date().toISOString() : null);

    const updated = await updatePost(id, { ...data, publishedAt });
    if (!updated) {
      return { ok: false, message: "Không tìm thấy bài viết" };
    }
    revalidatePath("/posts");
    revalidatePath(`/posts/${id}/edit`);
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Không lưu được bài viết",
    };
  }

  redirect("/posts");
}

export async function deletePostAction(id: string): Promise<void> {
  await requireAdmin();
  await deletePost(id);
  revalidatePath("/posts");
}

export async function togglePostPublishAction(id: string): Promise<void> {
  await requireAdmin();
  await togglePostPublished(id);
  revalidatePath("/posts");
}
