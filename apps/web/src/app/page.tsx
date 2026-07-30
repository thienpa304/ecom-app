import type { Metadata } from "next";
import Link from "next/link";
import {
  HOME_SECTION_PRODUCT_COUNT,
  HOME_TOP_SELLERS_TITLE,
  type Product,
} from "@ecom/shared";
import { HeroIntro } from "@/components/HeroIntro";
import { HeroSlider } from "@/components/HeroSlider";
import { ProductRow } from "@/components/ProductRow";
import { VideoReviewSection } from "@/components/VideoReviewSection";
import {
  getSiteSettings,
  listHomeCategorySections,
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
  const [settings, { items }, categorySections, videoProducts] =
    await Promise.all([
      getSiteSettings(),
      listProducts({ sort: "sold_desc", pageSize: 12, page: 1 }),
      listHomeCategorySections(N),
      listVideoProducts(N),
    ]);

  const tel = settings.phone.replace(/\D/g, "");

  const slides = settings.heroSlides.length
    ? settings.heroSlides
    : settings.heroImageUrl
      ? [{ url: settings.heroImageUrl, alt: "", href: "" }]
      : [];

  const topSellers = items.slice(0, N);
  const featured = items.slice(N, N * 2);

  return (
    <>
      <section className="border-b border-orange-100 bg-gradient-to-br from-white via-orange-50/60 to-gray-50">
        <div className="container-page grid gap-8 py-10 sm:py-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
          <div>
            <HeroIntro
              eyebrow={settings.siteName}
              title={settings.heroTitle || "Điện máy & thiết bị gia dụng"}
              highlight={settings.heroHighlight}
              subtitle={settings.heroSubtitle || settings.tagline}
              bullets={settings.heroBullets}
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/san-pham" className="btn-primary">
                Xem tất cả sản phẩm
              </Link>
              <a href={`tel:${tel}`} className="btn-outline">
                Gọi tư vấn ngay
              </a>
            </div>
          </div>

          {slides.length ? (
            <HeroSlider slides={slides} fallbackAlt={settings.siteName} />
          ) : (
            <div className="relative hidden aspect-[16/10] overflow-hidden rounded-2xl border border-orange-100 bg-[radial-gradient(circle_at_30%_20%,#fed7aa,transparent_50%),radial-gradient(circle_at_80%_70%,#ffedd5,transparent_45%)] lg:block" />
          )}
        </div>
      </section>

      {topSellers.length ? (
        <section className="container-page pt-8 sm:pt-10">
          <div className="overflow-hidden rounded-2xl border-2 border-sale">
            <div className="bg-sale px-4 py-3">
              <h2 className="text-center text-base font-extrabold uppercase tracking-wide text-white sm:text-lg">
                {HOME_TOP_SELLERS_TITLE}
              </h2>
            </div>
            <div className="bg-sale/5 p-3 sm:p-4">
              <ProductRow products={topSellers} priorityCount={2} />
            </div>
          </div>
        </section>
      ) : null}

      {featured.length ? (
        <ProductShelf
          title="Sản phẩm nổi bật"
          subtitle={`Các model bán chạy tại ${settings.siteName}`}
          href="/san-pham"
          products={featured}
        />
      ) : null}

      {categorySections.map(({ category, items: products }) => (
        <ProductShelf
          key={category.id}
          title={category.name}
          href={`/danh-muc/${category.slug}`}
          products={products}
          uppercase
        />
      ))}

      {videoProducts.length ? (
        <section className="container-page py-8 sm:py-10">
          <SectionHeading title="Video review sản phẩm" uppercase />
          <VideoReviewSection products={videoProducts} />
        </section>
      ) : null}
    </>
  );
}

function ProductShelf({
  title,
  subtitle,
  href,
  products,
  uppercase = false,
}: {
  title: string;
  subtitle?: string;
  href: string;
  products: Product[];
  uppercase?: boolean;
}) {
  return (
    <section className="container-page py-8 sm:py-10">
      <SectionHeading
        title={title}
        subtitle={subtitle}
        href={href}
        uppercase={uppercase}
      />
      <ProductRow products={products} />
    </section>
  );
}

function SectionHeading({
  title,
  subtitle,
  href,
  uppercase = false,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  uppercase?: boolean;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 border-b-2 border-gray-100 pb-2.5 sm:mb-5">
      <div className="min-w-0">
        <h2
          className={`text-lg font-bold text-brand sm:text-xl ${
            uppercase ? "uppercase tracking-wide" : ""
          }`}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 truncate text-sm text-gray-600">{subtitle}</p>
        ) : null}
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
