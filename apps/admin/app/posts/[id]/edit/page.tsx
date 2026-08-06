import { notFound } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { BackButton } from "@/components/BackButton";
import { PostForm } from "@/components/PostForm";
import { updatePostAction } from "@/lib/actions/posts";
import { getPost, getSiteSettings } from "@/lib/store";

type Params = Promise<{ id: string }>;

export default async function EditPostPage({ params }: { params: Params }) {
  const { id } = await params;
  const [post, settings] = await Promise.all([getPost(id), getSiteSettings()]);
  if (!post) notFound();

  const action = updatePostAction.bind(null, id);

  return (
    <AdminShell title="Sửa bài viết" actions={<BackButton />}>
      <PostForm
        action={action}
        post={post}
        siteName={settings.siteName}
        submitLabel="Lưu thay đổi"
      />
    </AdminShell>
  );
}
