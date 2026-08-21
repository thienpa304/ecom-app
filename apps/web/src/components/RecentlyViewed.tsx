"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@ecom/shared";
import { ProductRow } from "@/components/ProductRow";
import { SectionCard, SectionCardLink } from "@/components/SectionCard";

const STORAGE_KEY = "lpd:recently-viewed";
const MAX_HISTORY = 8;
const MAX_SHOWN = 4;

type Props = {
  currentSlug: string;
  products: Product[];
  viewAllHref?: string;
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

export function RecentlyViewed({ currentSlug, products, viewAllHref }: Props) {
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
    <SectionCard
      title="Sản phẩm đã xem"
      action={viewAllHref ? <SectionCardLink href={viewAllHref} /> : undefined}
    >
      <ProductRow products={items} />
    </SectionCard>
  );
}
