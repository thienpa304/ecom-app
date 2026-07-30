"use client";

import { PRICE_RANGES, type Brand, type Category } from "@ecom/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useId, useTransition } from "react";

const CATALOG_ROOT_PATH = "/san-pham";
const NO_DROP_PARAMS: readonly string[] = [];

type Props = {
  brands: Brand[];
  categories: Category[];
  className?: string;
  basePath?: string;
  activeCategorySlug?: string;
  activeBrandSlug?: string;
  dropParams?: readonly string[];
  categoryHrefBase?: string;
  brandHrefBase?: string;
};

export function ProductFilters({
  brands,
  categories,
  className,
  basePath = CATALOG_ROOT_PATH,
  activeCategorySlug,
  activeBrandSlug,
  dropParams = NO_DROP_PARAMS,
  categoryHrefBase,
  brandHrefBase,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const uid = useId();
  const priceName = `price-${uid}`;
  const categoryName = `category-${uid}`;

  const selectedBrands = new Set(
    activeBrandSlug
      ? [activeBrandSlug]
      : (searchParams.get("brand") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
  );
  const selectedPrice = searchParams.get("price") ?? "";
  const selectedCategory = activeCategorySlug ?? searchParams.get("category") ?? "";

  const updateParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.delete("page");
      for (const key of dropParams) params.delete(key);
      startTransition(() => {
        const qs = params.toString();
        router.push(`${basePath}${qs ? `?${qs}` : ""}`);
      });
    },
    [router, searchParams, basePath, dropParams],
  );

  function toggleBrand(slug: string) {
    if (brandHrefBase) {
      const target =
        !slug || selectedBrands.has(slug)
          ? CATALOG_ROOT_PATH
          : `${brandHrefBase}/${slug}`;
      startTransition(() => router.push(target));
      return;
    }

    updateParams((params) => {
      const next = new Set(selectedBrands);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      if (next.size === 0) params.delete("brand");
      else params.set("brand", Array.from(next).join(","));
    });
  }

  function setPrice(value: string) {
    updateParams((params) => {
      if (!value || value === selectedPrice) params.delete("price");
      else params.set("price", value);
    });
  }

  function setCategory(slug: string) {
    if (categoryHrefBase) {
      const target =
        !slug || slug === selectedCategory
          ? CATALOG_ROOT_PATH
          : `${categoryHrefBase}/${slug}`;
      startTransition(() => router.push(target));
      return;
    }

    updateParams((params) => {
      if (!slug || slug === selectedCategory) params.delete("category");
      else params.set("category", slug);
    });
  }

  function clearAll() {
    startTransition(() => router.push(basePath));
  }

  return (
    <aside
      className={`space-y-6 rounded-lg border border-gray-200 bg-white p-4 ${className ?? ""} ${pending ? "opacity-70" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900">
          Bộ lọc
        </h2>
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex min-h-10 items-center rounded-md px-2 text-sm font-medium text-accent hover:bg-orange-50 hover:underline"
        >
          Xóa lọc
        </button>
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-800">Thương hiệu</h3>
        <ul className="space-y-1">
          {brands.map((brand) => (
            <li key={brand.id}>
              <label className="flex min-h-10 cursor-pointer items-center gap-2.5 py-1 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={selectedBrands.has(brand.slug)}
                  onChange={() => toggleBrand(brand.slug)}
                  className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                />
                {brand.name}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-800">Khoảng giá</h3>
        <ul className="space-y-1">
          {PRICE_RANGES.map((range) => (
            <li key={range.value}>
              <label className="flex min-h-10 cursor-pointer items-center gap-2.5 py-1 text-sm text-gray-700">
                <input
                  type="radio"
                  name={priceName}
                  checked={selectedPrice === range.value}
                  onChange={() => setPrice(range.value)}
                  className="h-4 w-4 border-gray-300 text-accent focus:ring-accent"
                />
                {range.labelVi}
              </label>
            </li>
          ))}
        </ul>
      </section>

      {categories.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-gray-800">Danh mục</h3>
          <ul className="space-y-1">
            {categories.map((cat) => (
              <li key={cat.id}>
                <label className="flex min-h-10 cursor-pointer items-center gap-2.5 py-1 text-sm text-gray-700">
                  <input
                    type="radio"
                    name={categoryName}
                    checked={selectedCategory === cat.slug}
                    onChange={() => setCategory(cat.slug)}
                    className="h-4 w-4 border-gray-300 text-accent focus:ring-accent"
                  />
                  {cat.name}
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
