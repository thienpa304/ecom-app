import { AdminShell } from "@/components/AdminShell";
import { BackButton } from "@/components/BackButton";
import { PostForm } from "@/components/PostForm";
import { createPostAction } from "@/lib/actions/posts";
import { getSiteSettings } from "@/lib/store";

export default async function NewPostPage() {
  const settings = await getSiteSettings();

  return (
    <AdminShell title="Viết bài mới" actions={<BackButton />}>
      <PostForm
        action={createPostAction}
        siteName={settings.siteName}
        submitLabel="Tạo bài viết"
      />
    </AdminShell>
  );
}
