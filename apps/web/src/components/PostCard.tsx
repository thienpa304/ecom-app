import Link from "next/link";
import type { Post } from "@ecom/shared";
import { SafeImage } from "@/components/SafeImage";
import { formatPostDate } from "@/lib/format";

type Props = {
  post: Post;
  priority?: boolean;
};

export function PostCard({ post, priority = false }: Props) {
  const href = `/cam-nang/${post.slug}`;
  const date = formatPostDate(post.publishedAt ?? post.createdAt);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-accent/40 hover:shadow-md">
      <Link href={href} className="block overflow-hidden bg-gray-50">
        <div className="relative aspect-[16/9]">
          <SafeImage
            src={post.coverUrl}
            alt={post.coverAlt || post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-3.5">
        {date ? (
          <time
            dateTime={post.publishedAt ?? post.createdAt}
            className="text-xs text-gray-500"
          >
            {date}
          </time>
        ) : null}

        <h3 className="mt-1 text-[15px] font-bold leading-snug text-gray-900">
          <Link href={href} className="hover:text-accent">
            {post.title}
          </Link>
        </h3>

        {post.excerpt ? (
          <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-gray-600">
            {post.excerpt}
          </p>
        ) : null}

        <Link
          href={href}
          className="mt-auto pt-3 text-sm font-semibold text-accent hover:underline"
        >
          Đọc tiếp →
        </Link>
      </div>
    </article>
  );
}
