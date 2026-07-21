import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getBrands, getSiteSettings, listProducts } from "@/lib/data";
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
    },
  };
}

export default async function HomePage() {
  const [settings, { items }, brands] = await Promise.all([
    getSiteSettings(),
    listProducts({ sort: "sold_desc", pageSize: 12, page: 1 }),
    getBrands(),
  ]);
  const featured = items.slice(0, 8);
  const brandNames = Object.fromEntries(brands.map((b) => [b.id, b.name]));
  const tel = settings.phone.replace(/\D/g, "");

  return (
    <>
      <section className="border-b border-orange-100 bg-gradient-to-br from-white via-orange-50/60 to-gray-50">
        <div className="container-page grid gap-8 py-12 sm:py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              {settings.siteName}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {settings.heroTitle || "Điện máy & thiết bị gia dụng"}
            </h1>
            <p className="mt-3 max-w-xl text-base text-gray-600">
              {settings.heroSubtitle || settings.tagline}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/san-pham" className="btn-primary">
                Xem tất cả sản phẩm
              </Link>
              <a href={`tel:${tel}`} className="btn-outline">
                Gọi tư vấn ngay
              </a>
            </div>
          </div>
          <div className="relative hidden overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm lg:block">
            <div className="relative aspect-[5/3]">
              {settings.heroImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.heroImageUrl}
                  alt={
                    settings.heroCardTitle ||
                    settings.heroTitle ||
                    settings.siteName
                  }
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#fed7aa,transparent_50%),radial-gradient(circle_at_80%_70%,#ffedd5,transparent_45%)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="text-sm font-medium text-white/85">
                  {settings.heroCardCaption ||
                    "Lọc theo thương hiệu · Giá · Tồn kho"}
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {settings.heroCardTitle ||
                    "Xem hàng như tại cửa hàng"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-10 sm:py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Sản phẩm nổi bật
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Các model bán chạy tại {settings.siteName}
            </p>
          </div>
          <Link
            href="/san-pham"
            className="inline-flex min-h-10 shrink-0 items-center rounded-md px-2 text-sm font-semibold text-accent hover:bg-orange-50 hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              brandName={brandNames[product.brandId]}
              priority={index < 4}
            />
          ))}
        </div>
      </section>
    </>
  );
}
