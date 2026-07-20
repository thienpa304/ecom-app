"use client";

import { type Brand, type Category } from "@ecom/shared";
import { useState } from "react";
import { ProductFilters } from "./ProductFilters";

type Props = {
  brands: Brand[];
  categories: Category[];
};

export function MobileFilters({ brands, categories }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-outline w-full"
        aria-expanded={open}
      >
        {open ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
      </button>
      {open && (
        <div className="mt-3">
          <ProductFilters brands={brands} categories={categories} />
        </div>
      )}
    </div>
  );
}
