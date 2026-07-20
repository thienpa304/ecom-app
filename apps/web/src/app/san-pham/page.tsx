import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogToolbar } from "@/components/CatalogToolbar";
import { MobileFilters } from "@/components/MobileFilters";
import { Pagination } from "@/components/Pagination";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { getBrands, getCategories, getSiteSettings, listProducts } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

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
  const s = await getSiteSettings();
  const q = first(sp.q)?.trim();
  const category = first(sp.category);
  const brand = first(sp.brand);

  const bits = [
    q ? `“${q}”` : null,
    brand ? `thương hiệu ${brand}` : null,
    category ? `danh mục ${category}` : null,
  ].filter(Boolean);

  const title = bits.length ? `Sản phẩm — ${bits.join(", ")}` : "Sản phẩm";
  const description = bits.length
    ? `${title} tại ${s.siteName}. Lọc theo thương hiệu, giá, sắp xếp.`
    : `Danh mục sản phẩm tại ${s.siteName} — lọc theo thương hiệu, giá, sắp xếp.`;

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (brand) params.set("brand", brand);
  if (category) params.set("category", category);
  const qs = params.toString();
  const path = qs ? `/san-pham?${qs}` : "/san-pham";

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      url: absoluteUrl(path),
      title: `${title} | ${s.siteName}`,
      description,
    },
    ...(q || brand || category
      ? { robots: { index: true, follow: true } }
      : {}),
  };
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const brand = first(sp.brand);
  const price = first(sp.price);
  const sort = first(sp.sort) ?? "price_desc";
  const category = first(sp.category);
  const q = first(sp.q);
  const page = Number(first(sp.page) ?? "1") || 1;
  const pageSize = Number(first(sp.pageSize) ?? "12") || 12;

  const query = new URLSearchParams();
  if (brand) query.set("brand", brand);
  if (price) query.set("price", price);
  if (sort) query.set("sort", sort);
  if (category) query.set("category", category);
  if (q) query.set("q", q);
  if (pageSize !== 12) query.set("pageSize", String(pageSize));
  const queryString = query.toString();

  const [brands, categories, result] = await Promise.all([
    getBrands(),
    getCategories(),
    listProducts({
      brandSlug: brand,
      categorySlug: category,
      price,
      sort,
      page,
      pageSize,
      q,
    }),
  ]);

  const brandNames = Object.fromEntries(brands.map((b) => [b.id, b.name]));

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
        <p className="mt-1 text-sm text-gray-600">
          Lọc theo thương hiệu, khoảng giá và sắp xếp phù hợp nhu cầu của bạn.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Suspense
          fallback={
            <div className="hidden h-80 animate-pulse rounded-lg bg-gray-100 lg:block" />
          }
        >
          <div className="hidden lg:block">
            <ProductFilters brands={brands} categories={categories} />
          </div>
        </Suspense>

        <div className="min-w-0 space-y-4">
          <Suspense
            fallback={
              <div className="h-12 animate-pulse rounded-lg bg-gray-100" />
            }
          >
            <MobileFilters brands={brands} categories={categories} />
            <CatalogToolbar shown={result.items.length} total={result.total} />
          </Suspense>

          {result.items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="font-medium text-gray-800">
                Không tìm thấy sản phẩm phù hợp
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Thử bỏ bớt bộ lọc hoặc tìm từ khóa khác.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
              {result.items.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  brandName={brandNames[product.brandId]}
                  priority={index < 3}
                />
              ))}
            </div>
          )}

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            queryString={queryString}
          />
        </div>
      </div>
    </div>
  );
}
