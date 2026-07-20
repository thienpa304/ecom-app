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
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-700">
        <span className="font-semibold text-gray-900">{shown}</span>
        {" / "}
        <span className="font-semibold text-gray-900">{total}</span> sản phẩm
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          Sắp xếp
          <select
            value={sort}
            onChange={(e) => update("sort", e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-800 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.labelVi}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          Hiển thị
          <select
            value={pageSize}
            onChange={(e) => update("pageSize", e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-800 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="12">12</option>
            <option value="24">24</option>
          </select>
        </label>
      </div>
    </div>
  );
}
