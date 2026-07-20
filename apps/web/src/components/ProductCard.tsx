import Image from "next/image";
import Link from "next/link";
import { STOCK_STATUS, primaryImage, type Product } from "@ecom/shared";
import { discountPercent, formatVnd } from "@/lib/format";

type Props = {
  product: Product;
  brandName?: string;
  /** Prioritize LCP image (first cards above the fold). */
  priority?: boolean;
};

const PLACEHOLDER = "/placeholder.svg";

export function ProductCard({ product, brandName, priority = false }: Props) {
  const pct = discountPercent(product.price, product.salePrice);
  const stock = STOCK_STATUS[product.stockStatus];
  const image = primaryImage(product);
  const src = image?.url || PLACEHOLDER;
  const alt = image?.alt || product.name;
  const specEntries = Object.entries(product.specs).slice(0, 2);
  const href = `/san-pham/${product.slug}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-lg active:scale-[0.98]">
      <Link
        href={href}
        prefetch
        className="flex h-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <div className="relative block overflow-hidden bg-gray-100">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
              priority={priority}
            />
          </div>
          {pct != null && (
            <span className="absolute left-0 top-0 rounded-br-lg bg-sale px-2 py-1 text-xs font-bold text-white shadow-sm">
              -{pct}%
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-3.5">
          {brandName ? (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
              {brandName}
            </p>
          ) : null}

          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-gray-900 transition group-hover:text-accent sm:min-h-[2.75rem] sm:text-[15px]">
            {product.name}
          </h3>

          <p className="truncate text-[11px] text-gray-400">
            Model: {product.model}
            {specEntries[0] ? ` · ${specEntries[0][1]}` : ""}
          </p>

          <div className="mt-auto space-y-2.5 pt-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              {product.salePrice != null && product.salePrice < product.price ? (
                <>
                  <span className="text-lg font-extrabold tracking-tight text-sale sm:text-xl">
                    {formatVnd(product.salePrice)}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    {formatVnd(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-extrabold tracking-tight text-gray-900 sm:text-xl">
                  {formatVnd(product.price)}
                </span>
              )}
            </div>

            <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] text-gray-500">
              <span className="min-w-0 shrink">
                Đã bán {product.soldCount.toLocaleString("vi-VN")}
              </span>
              <span
                className={
                  product.stockStatus === "in_stock"
                    ? "badge-stock shrink-0"
                    : "badge-out shrink-0"
                }
              >
                {stock.labelVi}
              </span>
            </div>

            <span className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white transition group-hover:bg-accent-dark">
              Liên hệ
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
