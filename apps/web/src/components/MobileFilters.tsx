"use client";

import { type Brand, type Category } from "@ecom/shared";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { ProductFilters } from "./ProductFilters";

type Props = {
  brands: Brand[];
  categories: Category[];
};

export function MobileFilters({ brands, categories }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const searchParams = useSearchParams();

  const activeCount = [
    searchParams.get("brand"),
    searchParams.get("price"),
    searchParams.get("category"),
  ].filter(Boolean).length;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 shadow-sm active:bg-gray-50"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <FilterIcon className="h-4 w-4 text-gray-600" />
        Bộ lọc
        {activeCount > 0 ? (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-white">
            {activeCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Đóng bộ lọc"
            onClick={() => setOpen(false)}
          />
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Bộ lọc sản phẩm"
            className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-2xl"
          >
            <div className="flex flex-col items-center border-b border-gray-100 px-4 pb-3 pt-2">
              <div className="mb-2 h-1 w-10 rounded-full bg-gray-300" />
              <div className="flex w-full items-center justify-between">
                <p className="text-base font-semibold text-gray-900">
                  Bộ lọc
                  {activeCount > 0 ? (
                    <span className="ml-2 text-sm font-medium text-accent">
                      ({activeCount})
                    </span>
                  ) : null}
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-1 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  Đóng
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              <ProductFilters
                brands={brands}
                categories={categories}
                className="border-0 p-1 shadow-none"
              />
            </div>

            <div className="border-t border-gray-100 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-primary w-full"
              >
                Xem kết quả
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M7 12h10M10 18h4"
      />
    </svg>
  );
}
