import { AdminShell } from "@/components/AdminShell";
import { PostsManager } from "@/components/PostsManager";
import { getPosts } from "@/lib/store";

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <AdminShell title="Cẩm nang">
      <PostsManager posts={posts} />
    </AdminShell>
  );
}
