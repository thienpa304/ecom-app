import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogToolbar } from "@/components/CatalogToolbar";
import { MobileFilters } from "@/components/MobileFilters";
import { Pagination } from "@/components/Pagination";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { getBrands, getCategories, listProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description: "Danh mục sản phẩm — lọc theo thương hiệu, giá, sắp xếp.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
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

  const brandNames = Object.fromEntries(
    brands.map((b) => [b.id, b.name]),
  );

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
        <p className="mt-1 text-sm text-gray-600">
          Lọc theo thương hiệu, khoảng giá và sắp xếp phù hợp nhu cầu của bạn.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Suspense fallback={null}>
          <div className="hidden lg:block">
            <ProductFilters brands={brands} categories={categories} />
          </div>
        </Suspense>

        <div className="min-w-0 space-y-4">
          <Suspense fallback={null}>
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
              {result.items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  brandName={brandNames[product.brandId]}
                />
              ))}
            </div>
          )}

          <Suspense fallback={null}>
            <Pagination page={result.page} totalPages={result.totalPages} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
