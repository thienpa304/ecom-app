import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getBrands, getSiteSettings, listProducts } from "@/lib/data";

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
              {settings.heroTitle || "Catalog điện máy"}
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
            <div className="aspect-[5/3] bg-[radial-gradient(circle_at_30%_20%,#fed7aa,transparent_50%),radial-gradient(circle_at_80%_70%,#ffedd5,transparent_45%)] p-8">
              <div className="flex h-full flex-col justify-end">
                <p className="text-sm font-medium text-gray-500">
                  Lọc theo thương hiệu · Giá · Tồn kho
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  Trải nghiệm catalog kiểu showroom
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
            className="text-sm font-semibold text-accent hover:underline"
          >
            Xem catalog →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              brandName={brandNames[product.brandId]}
            />
          ))}
        </div>
      </section>
    </>
  );
}
