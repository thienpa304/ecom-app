import type { Metadata } from "next";
import Link from "next/link";
import { HOME_SECTION_PRODUCT_COUNT, type Product } from "@ecom/shared";
import { HeroIntro } from "@/components/HeroIntro";
import { HeroSlider } from "@/components/HeroSlider";
import { ProductRow } from "@/components/ProductRow";
import { VideoReviewSection } from "@/components/VideoReviewSection";
import {
  getSiteSettings,
  listHomeCategorySections,
  listHomeSections,
  listProducts,
  listVideoProducts,
} from "@/lib/data";
import { siteShareImage } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: { absolute: `${s.siteName} — Sản phẩm` },
    description: s.metaDescription || s.tagline,
    alternates: { canonical: "/" },
    openGraph: {
      url: absoluteUrl("/"),
      title: `${s.siteName} — Sản phẩm`,
      description: s.metaDescription || s.tagline,
      ...(siteShareImage(s) ? { images: [{ url: siteShareImage(s) }] } : {}),
    },
  };
}

const N = HOME_SECTION_PRODUCT_COUNT;

export default async function HomePage() {
  const [settings, sections] = await Promise.all([
    getSiteSettings(),
    listHomeSections(),
  ]);

  const maxLimit = sections.reduce((m, s) => Math.max(m, s.productLimit), N);
  const soldOffset =
    sections.find((s) => s.kind === "top_sellers")?.productLimit ?? 0;

  const [soldList, newestList, categorySections, videoProducts] =
    await Promise.all([
      listProducts({
        sort: "sold_desc",
        pageSize: soldOffset + maxLimit > 12 ? 24 : 12,
        page: 1,
      }),
      listProducts({
        sort: "newest",
        pageSize: maxLimit > 12 ? 24 : 12,
        page: 1,
      }),
      listHomeCategorySections(maxLimit),
      listVideoProducts(maxLimit),
    ]);

  const categoryById = new Map(categorySections.map((s) => [s.category.id, s]));

  const shelves = sections.map((section) => {
    const found = section.categoryId
      ? categoryById.get(section.categoryId)
      : undefined;

    switch (section.kind) {
      case "top_sellers":
        return {
          section,
          products: soldList.items.slice(0, section.productLimit),
          href: "/san-pham",
        };
      case "featured":
        return {
          section,
          products: soldList.items.slice(
            soldOffset,
            soldOffset + section.productLimit,
          ),
          href: "/san-pham",
        };
      case "video":
        return {
          section,
          products: videoProducts.slice(0, section.productLimit),
          href: "",
        };
      case "category":
        return {
          section,
          products: (found?.items ?? []).slice(0, section.productLimit),
          href: found ? `/danh-muc/${found.category.slug}` : "/san-pham",
        };
      case "all_products":
        return {
          section,
          products: newestList.items.slice(0, section.productLimit),
          href: "/san-pham",
        };
    }
  });

  const tel = settings.phone.replace(/\D/g, "");

  const slides = settings.heroSlides.length
    ? settings.heroSlides
    : settings.heroImageUrl
      ? [{ url: settings.heroImageUrl, alt: "", href: "" }]
      : [];

  return (
    <>
      <section className="border-b border-orange-100 bg-gradient-to-br from-white via-orange-50/60 to-gray-50">
        <div className="container-page grid gap-5 py-6 sm:gap-6 sm:py-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:items-center">
          {/* Mobile: banner lên trước phần giới thiệu; desktop giữ nguyên trái/phải */}
          <div className="order-2 lg:order-1">
            <HeroIntro
              eyebrow={settings.siteName}
              title={settings.heroTitle || "Điện máy & thiết bị gia dụng"}
              highlight={settings.heroHighlight}
              subtitle={settings.heroSubtitle || settings.tagline}
              bullets={settings.heroBullets}
            />
            {/* Ẩn trên mobile — đã có nút gọi/Zalo nổi (ContactFab) */}
            <div className="mt-4 hidden max-w-md space-y-3 lg:block lg:max-w-none">
              <Link href="/san-pham" className="btn-primary w-full">
                Xem tất cả sản phẩm
              </Link>
              <div className="flex flex-wrap gap-3">
                {settings.zaloUrl ? (
                  <a
                    href={settings.zaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 flex-1 basis-36 items-center justify-center gap-2 rounded-md bg-zalo px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zalo-dark focus:outline-none focus:ring-2 focus:ring-zalo/40"
                  >
                    <ZaloGlyphIcon className="h-5 w-5 shrink-0" />
                    Chat Zalo
                  </a>
                ) : null}
                <a
                  href={`tel:${tel}`}
                  className="inline-flex min-h-11 flex-1 basis-36 items-center justify-center gap-2 rounded-md bg-call px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-call-dark focus:outline-none focus:ring-2 focus:ring-call/40"
                >
                  <PhoneIcon className="h-5 w-5 shrink-0" />
                  Gọi tư vấn ngay
                </a>
              </div>
            </div>
          </div>

          <div className="order-1 min-w-0 lg:order-2">
            {slides.length ? (
              <HeroSlider slides={slides} fallbackAlt={settings.siteName} />
            ) : (
              <div className="relative hidden aspect-[16/9] overflow-hidden rounded-2xl border border-orange-100 bg-[radial-gradient(circle_at_30%_20%,#fed7aa,transparent_50%),radial-gradient(circle_at_80%_70%,#ffedd5,transparent_45%)] lg:block lg:aspect-[2/1]" />
            )}
          </div>
        </div>
      </section>

      {shelves.map(({ section, products, href }) => {
        if (!products.length) return null;

        if (section.kind === "video") {
          return (
            <section key={section.id} className="container-page py-5 sm:py-7">
              <SectionHeading title={section.title} />
              <VideoReviewSection products={products} />
            </section>
          );
        }

        if (section.style === "red_banner") {
          return (
            <section key={section.id} className="container-page py-5 sm:py-7">
              <div className="overflow-hidden rounded-2xl border-2 border-sale">
                <div className="bg-sale px-4 py-3">
                  <h2 className="text-center text-base font-extrabold uppercase tracking-wide text-white sm:text-lg">
                    {section.title}
                  </h2>
                </div>
                <div className="bg-sale/5 p-3 sm:p-4">
                  <ProductRow products={products} />
                </div>
              </div>
            </section>
          );
        }

        return (
          <ProductShelf
            key={section.id}
            title={section.title}
            href={href}
            products={products}
          />
        );
      })}
    </>
  );
}

function ZaloGlyphIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.2 2 1.5 6.02 1.5 10.98c0 2.83 1.54 5.35 3.95 7l-.86 3.32a.4.4 0 00.58.45l3.9-2.08c.94.22 1.92.33 2.93.33 5.8 0 10.5-4.02 10.5-8.98S17.8 2 12 2zM7.2 8.02h4.02c.28 0 .5.23.5.5v.34c0 .12-.04.23-.11.32l-3.1 3.9h2.8c.27 0 .5.22.5.5v.36c0 .27-.23.5-.5.5H7.05a.5.5 0 01-.5-.5v-.35c0-.11.04-.22.11-.31l3.1-3.9h-2.6a.5.5 0 01-.5-.5v-.36c0-.27.22-.5.5-.5zm6.13 0c.28 0 .5.23.5.5v5.42c0 .28-.22.5-.5.5h-.35a.5.5 0 01-.5-.5V8.52c0-.27.22-.5.5-.5h.35zm3.36 1.5c1.4 0 2.53 1.13 2.53 2.52a2.53 2.53 0 01-2.53 2.53 2.53 2.53 0 01-2.52-2.53c0-1.39 1.13-2.52 2.52-2.52zm0 1.32c-.66 0-1.2.54-1.2 1.2 0 .67.54 1.21 1.2 1.21.67 0 1.21-.54 1.21-1.2 0-.67-.54-1.21-1.2-1.21z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V21a1 1 0 01-1 1C10.4 22 2 13.6 2 3a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z" />
    </svg>
  );
}

function ProductShelf({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: Product[];
}) {
  return (
    <section className="container-page py-5 sm:py-7">
      <SectionHeading title={title} href={href} />
      <ProductRow products={products} />
    </section>
  );
}

function SectionHeading({
  title,
  href,
}: {
  title: string;
  href?: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4 border-b-2 border-gray-100 pb-2">
      <div className="min-w-0">
        <h2 className="text-lg font-bold uppercase tracking-wide text-brand sm:text-xl">
          {title}
        </h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="inline-flex min-h-10 shrink-0 items-center rounded-md px-2 text-sm font-semibold text-accent hover:bg-orange-50 hover:underline"
        >
          Xem tất cả →
        </Link>
      ) : null}
    </div>
  );
}
