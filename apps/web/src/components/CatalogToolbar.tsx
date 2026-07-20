"use client";

import { SORT_OPTIONS } from "@ecom/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type Props = {
  shown: number;
  total: number;
};

export function CatalogToolbar({ shown, total }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const sort = searchParams.get("sort") ?? "price_desc";
  const pageSize = searchParams.get("pageSize") ?? "12";

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    if (key !== "page") params.delete("page");
    startTransition(() => {
      router.push(`/san-pham?${params.toString()}`);
    });
  }

  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:gap-3">
      <p className="shrink-0 text-xs text-gray-600 sm:text-sm">
        <span className="font-semibold text-gray-900">{shown}</span>
        <span className="text-gray-400">/</span>
        <span className="font-semibold text-gray-900">{total}</span>
        <span className="ml-1 hidden sm:inline">sản phẩm</span>
      </p>

      <div className="flex min-w-0 items-center gap-2">
        <label className="flex min-w-0 items-center gap-1.5 text-xs text-gray-600 sm:text-sm">
          <span className="sr-only sm:not-sr-only sm:inline">Sắp xếp</span>
          <select
            value={sort}
            onChange={(e) => update("sort", e.target.value)}
            aria-label="Sắp xếp"
            className="max-w-[9.5rem] rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs text-gray-800 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:max-w-none sm:text-sm"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.labelVi}
              </option>
            ))}
          </select>
        </label>

        <label className="hidden items-center gap-2 text-sm text-gray-600 sm:flex">
          Hiển thị
          <select
            value={pageSize}
            onChange={(e) => update("pageSize", e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-800 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="12">12</option>
            <option value="24">24</option>
          </select>
        </label>
      </div>
    </div>
  );
}
