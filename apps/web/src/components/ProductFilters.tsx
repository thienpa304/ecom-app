"use client";

import { PRICE_RANGES, type Brand, type Category } from "@ecom/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

type Props = {
  brands: Brand[];
  categories: Category[];
  className?: string;
};

export function ProductFilters({ brands, categories, className }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const selectedBrands = new Set(
    (searchParams.get("brand") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const selectedPrice = searchParams.get("price") ?? "";
  const selectedCategory = searchParams.get("category") ?? "";

  const updateParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.delete("page");
      startTransition(() => {
        const qs = params.toString();
        router.push(`/san-pham${qs ? `?${qs}` : ""}`);
      });
    },
    [router, searchParams],
  );

  function toggleBrand(slug: string) {
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
    updateParams((params) => {
      if (!slug || slug === selectedCategory) params.delete("category");
      else params.set("category", slug);
    });
  }

  function clearAll() {
    startTransition(() => router.push("/san-pham"));
  }

  return (
    <aside
      className={`space-y-6 rounded-lg border border-gray-200 bg-white p-4 ${className ?? ""} ${pending ? "opacity-70" : ""}`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900">
          Bộ lọc
        </h2>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-medium text-accent hover:underline"
        >
          Xóa lọc
        </button>
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-800">Thương hiệu</h3>
        <ul className="space-y-2">
          {brands.map((brand) => (
            <li key={brand.id}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={selectedBrands.has(brand.slug)}
                  onChange={() => toggleBrand(brand.slug)}
                  className="rounded border-gray-300 text-accent focus:ring-accent"
                />
                {brand.name}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-800">Khoảng giá</h3>
        <ul className="space-y-2">
          {PRICE_RANGES.map((range) => (
            <li key={range.value}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="price"
                  checked={selectedPrice === range.value}
                  onChange={() => setPrice(range.value)}
                  className="border-gray-300 text-accent focus:ring-accent"
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
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat.slug}
                    onChange={() => setCategory(cat.slug)}
                    className="border-gray-300 text-accent focus:ring-accent"
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
