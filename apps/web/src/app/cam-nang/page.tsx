import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { PostCard } from "@/components/PostCard";
import { getSiteSettings, listPosts } from "@/lib/data";
import { breadcrumbJsonLd, siteShareImage } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PATH = "/cam-nang";
const HEADLINE = "Kiến thức & kinh nghiệm chọn và dùng máy xịt rửa cao áp";
const INTRO =
  "Hướng dẫn chọn máy theo nhu cầu thực tế, giải thích thông số, và cách xử lý các lỗi thường gặp — viết từ kinh nghiệm bán và bảo hành hàng ngày tại cửa hàng.";

export const revalidate = 60;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const page = Number(first(sp.page) ?? "1") || 1;
  const settings = await getSiteSettings();
  const image = siteShareImage(settings);

  const title = page > 1 ? `${HEADLINE} — trang ${page}` : HEADLINE;

  return {
    title,
    description: INTRO,
    alternates: { canonical: page > 1 ? `${PATH}?page=${page}` : PATH },
    robots:
      page > 1 ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: "website",
      url: absoluteUrl(PATH),
      title: `${title} | ${settings.siteName}`,
      description: INTRO,
      siteName: settings.siteName,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function CamNangPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Number(first(sp.page) ?? "1") || 1;
  const result = await listPosts({ page });

  return (
    <div className="container-page py-4 sm:py-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Trang chủ", path: "/" },
          { name: "Kiến thức & Kinh nghiệm" },
        ])}
      />

      <Breadcrumb
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Kiến thức & Kinh nghiệm" },
        ]}
      />

      <header className="mb-5 border-b-2 border-gray-100 pb-3">
        <h1 className="text-xl font-extrabold uppercase tracking-wide text-brand sm:text-2xl">
          {HEADLINE}
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm text-gray-600">{INTRO}</p>
      </header>

      {result.items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="font-medium text-gray-800">Chưa có bài viết nào</p>
          <p className="mt-1 text-sm text-gray-500">
            Nội dung đang được cập nhật, mời bạn quay lại sau.
          </p>
          <Link
            href="/san-pham"
            className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
          >
            Xem sản phẩm →
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {result.items.map((post, index) => (
            <PostCard key={post.id} post={post} priority={index < 3} />
          ))}
        </div>
      )}

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        basePath={PATH}
      />
    </div>
  );
}
