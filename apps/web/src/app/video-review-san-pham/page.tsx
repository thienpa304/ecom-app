import type { Metadata } from "next";
import Link from "next/link";
import { imageMedia, videoMedia } from "@ecom/shared";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { VideoEmbedCard } from "@/components/VideoEmbedCard";
import { getSiteSettings, listVideoProducts } from "@/lib/data";
import { breadcrumbJsonLd, siteShareImage } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

const PATH = "/video-review-san-pham";
const CRUMB = "Video review sản phẩm";
const HEADLINE = "Video review sản phẩm theo từng model";
const META_TITLE = "Video review máy xịt rửa cao áp theo từng model";
const META_DESCRIPTION =
  "Video và shorts review từng model máy xịt rửa cao áp, máy rửa xe đang bán tại cửa hàng, xem trực tiếp ngay trên trang.";
const INTRO =
  "Mỗi model một hàng riêng, gom đủ video dài và shorts của model đó. Bấm vào ảnh để phát, bấm tên model để xem thông số và giá.";
const PRODUCT_LIMIT = 60;

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const image = siteShareImage(settings);

  return {
    title: META_TITLE,
    description: META_DESCRIPTION,
    alternates: { canonical: PATH },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      url: absoluteUrl(PATH),
      title: `${META_TITLE} | ${settings.siteName}`,
      description: META_DESCRIPTION,
      siteName: settings.siteName,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function VideoReviewSanPhamPage() {
  const products = await listVideoProducts(PRODUCT_LIMIT);

  const sections = products
    .map((product) => ({
      product,
      videos: videoMedia(product),
      fallbackPoster: imageMedia(product)[0]?.url,
      modelLabel: product.model.trim() || product.name,
      anchor: `model-${product.slug}`,
    }))
    .filter((section) => section.videos.length > 0);

  return (
    <div className="container-page py-4 sm:py-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Trang chủ", path: "/" },
          { name: CRUMB },
        ])}
      />

      <Breadcrumb
        items={[{ name: "Trang chủ", path: "/" }, { name: CRUMB }]}
      />

      <header className="mb-5 border-b-2 border-gray-100 pb-3">
        <h1 className="text-xl font-extrabold uppercase tracking-wide text-brand sm:text-2xl">
          {HEADLINE}
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm text-gray-600">{INTRO}</p>
      </header>

      {sections.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="font-medium text-gray-800">Chưa có video review nào</p>
          <p className="mt-1 text-sm text-gray-500">
            Video đang được cập nhật cho từng model. Trong lúc chờ, mời bạn xem
            thông số và hình ảnh chi tiết ở trang sản phẩm.
          </p>
          <Link
            href="/san-pham"
            className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
          >
            Xem sản phẩm →
          </Link>
        </div>
      ) : (
        <>
          {sections.length > 1 ? (
            <nav
              aria-label="Danh sách model có video"
              className="mb-6 flex flex-wrap gap-1.5"
            >
              {sections.map((section) => (
                <a
                  key={section.anchor}
                  href={`#${section.anchor}`}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 transition hover:border-accent/40 hover:text-accent"
                >
                  {section.modelLabel}
                </a>
              ))}
            </nav>
          ) : null}

          <div className="space-y-7 sm:space-y-9">
            {sections.map((section, index) => (
              <section
                key={section.product.id}
                id={section.anchor}
                aria-labelledby={`${section.anchor}-heading`}
                className="scroll-mt-24 border-t border-gray-200 pt-6 first:border-t-0 first:pt-0"
              >
                <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-8">
                  <header className="min-w-0 lg:sticky lg:top-24 lg:self-start">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h2
                      id={`${section.anchor}-heading`}
                      className="mt-1 text-lg font-extrabold leading-snug text-brand sm:text-xl"
                    >
                      Video review model {section.modelLabel}
                    </h2>
                    <p className="mt-1.5 line-clamp-3 text-sm text-gray-600">
                      {section.product.name}
                    </p>
                    <p className="mt-2 text-xs font-medium text-gray-500">
                      {section.videos.length} video
                    </p>
                    <Link
                      href={`/san-pham/${section.product.slug}`}
                      className="mt-3 inline-block text-sm font-semibold text-accent hover:underline"
                    >
                      Xem thông số &amp; giá →
                    </Link>
                  </header>

                  <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                    {section.videos.map((media) => (
                      <VideoEmbedCard
                        key={media.id}
                        media={media}
                        label={`Video review model ${section.modelLabel}`}
                        fallbackPoster={section.fallbackPoster}
                      />
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
