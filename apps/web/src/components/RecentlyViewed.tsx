"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@ecom/shared";
import { ProductRow } from "@/components/ProductRow";

const STORAGE_KEY = "lpd:recently-viewed";
const MAX_HISTORY = 8;
const MAX_SHOWN = 4;

type Props = {
  currentSlug: string;
  products: Product[];
};

function readHistory(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((slug): slug is string => typeof slug === "string" && !!slug)
      .slice(0, MAX_HISTORY);
  } catch {
    return [];
  }
}

function writeHistory(slugs: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    return;
  }
}

export function RecentlyViewed({ currentSlug, products }: Props) {
  const [history, setHistory] = useState<string[] | null>(null);

  useEffect(() => {
    const previous = readHistory();
    setHistory(previous.filter((slug) => slug !== currentSlug));
    writeHistory(
      [currentSlug, ...previous.filter((slug) => slug !== currentSlug)].slice(
        0,
        MAX_HISTORY,
      ),
    );
  }, [currentSlug]);

  const items = useMemo(() => {
    if (!history) return [];
    const bySlug = new Map(products.map((product) => [product.slug, product]));
    return history
      .map((slug) => bySlug.get(slug))
      .filter((product): product is Product => product != null)
      .slice(0, MAX_SHOWN);
  }, [history, products]);

  if (!history || items.length === 0) return null;

  return (
    <section className="mt-6 min-w-0 rounded-lg border border-gray-200 bg-white sm:mt-8">
      <h2 className="border-b border-gray-100 px-4 py-3 text-base font-bold uppercase text-gray-900">
        Sản phẩm đã xem
      </h2>
      <div className="min-w-0 px-4 py-4">
        <ProductRow products={items} />
      </div>
    </section>
  );
}
