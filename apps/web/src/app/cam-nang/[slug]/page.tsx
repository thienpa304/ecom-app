import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { stripHtml } from "@ecom/shared";
import { ArticleBody, readingMinutes } from "@/components/ArticleBody";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { PostCard } from "@/components/PostCard";
import { SafeImage } from "@/components/SafeImage";
import {
  getPostBySlug,
  getSiteSettings,
  listLatestPosts,
  listPublishedPostSlugs,
} from "@/lib/data";
import { formatPostDate } from "@/lib/format";
import { articleJsonLd, breadcrumbJsonLd, siteShareImage } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

type Params = Promise<{ slug: string }>;

const META_DESCRIPTION_MAX = 160;
const RELATED_LIMIT = 3;

export const revalidate = 60;

function derivedDescription(excerpt: string, body: string): string {
  const source = excerpt.trim() || stripHtml(body);
  if (!source) return "";
  if (source.length <= META_DESCRIPTION_MAX) return source;

  const clipped = source.slice(0, META_DESCRIPTION_MAX);
  const lastStop = Math.max(
    clipped.lastIndexOf(". "),
    clipped.lastIndexOf("! "),
    clipped.lastIndexOf("? "),
  );
  if (lastStop > 60) return clipped.slice(0, lastStop + 1);

  const lastSpace = clipped.lastIndexOf(" ");
  const cut = lastSpace > 0 ? lastSpace : clipped.length;
  return `${clipped.slice(0, cut).trimEnd()}…`;
}

export async function generateStaticParams() {
  const slugs = await listPublishedPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Không tìm thấy bài viết",
      robots: { index: false, follow: false },
    };
  }

  const settings = await getSiteSettings();
  const path = `/cam-nang/${post.slug}`;
  const title = post.metaTitle.trim() || post.title;
  const description =
    post.metaDescription.trim() || derivedDescription(post.excerpt, post.body);
  const image = post.coverUrl.trim() || siteShareImage(settings);
  const published = post.publishedAt ?? post.createdAt;

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      url: absoluteUrl(path),
      title: `${title} | ${settings.siteName}`,
      description,
      siteName: settings.siteName,
      ...(published ? { publishedTime: published } : {}),
      ...(post.updatedAt ? { modifiedTime: post.updatedAt } : {}),
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [settings, related] = await Promise.all([
    getSiteSettings(),
    listLatestPosts(RELATED_LIMIT, post.slug),
  ]);

  const published = post.publishedAt ?? post.createdAt;
  const publishedLabel = formatPostDate(published);
  const minutes = readingMinutes(post.body);
  const tel = settings.phone.replace(/\D/g, "");

  return (
    <div className="container-page py-4 sm:py-6">
      <JsonLd data={articleJsonLd(post, settings)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Trang chủ", path: "/" },
          { name: "Kiến thức & Kinh nghiệm", path: "/cam-nang" },
          { name: post.title },
        ])}
      />

      <Breadcrumb
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Kiến thức & Kinh nghiệm", path: "/cam-nang" },
          { name: post.title },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="min-w-0">
          <header className="border-b-2 border-gray-100 pb-4">
            <h1 className="text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl">
              {post.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
              {publishedLabel ? (
                <time dateTime={published}>{publishedLabel}</time>
              ) : null}
              {minutes ? <span>· {minutes} phút đọc</span> : null}
              {post.authorName ? <span>· {post.authorName}</span> : null}
            </div>
            {post.excerpt ? (
              <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
                {post.excerpt}
              </p>
            ) : null}
          </header>

          {post.coverUrl ? (
            <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-xl bg-gray-50">
              <SafeImage
                src={post.coverUrl}
                alt={post.coverAlt || post.title}
                fill
                sizes="(max-width: 1024px) 100vw, 720px"
                priority
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="mt-6">
            <ArticleBody html={post.body} />
          </div>

          <aside className="mt-8 rounded-xl border border-accent/30 bg-accent/5 p-4 sm:p-5">
            <p className="text-base font-bold text-gray-900">
              Chưa chắc model nào hợp với nhu cầu của bạn?
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Gọi hoặc nhắn Zalo, mô tả công việc bạn cần làm — cửa hàng tư vấn
              đúng loại máy, không bán dư công suất.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={`tel:${tel}`}
                className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white hover:opacity-90"
              >
                Gọi {settings.phone}
              </a>
              {settings.zaloUrl ? (
                <a
                  href={settings.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-lg border border-accent bg-white px-4 text-sm font-bold text-accent hover:bg-accent/5"
                >
                  Chat Zalo
                </a>
              ) : null}
              <Link
                href="/san-pham"
                className="inline-flex min-h-11 items-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:border-accent hover:text-accent"
              >
                Xem sản phẩm
              </Link>
            </div>
          </aside>
        </article>

        <aside className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">Bài viết khác</p>
          {related.length ? (
            <div className="mt-3 space-y-3">
              {related.map((item) => (
                <PostCard key={item.id} post={item} />
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              Chưa có bài viết nào khác.
            </p>
          )}
          <Link
            href="/cam-nang"
            className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
          >
            Xem tất cả cẩm nang →
          </Link>
        </aside>
      </div>
    </div>
  );
}
