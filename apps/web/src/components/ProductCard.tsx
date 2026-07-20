import Image from "next/image";
import Link from "next/link";
import { STOCK_STATUS, type Product } from "@ecom/shared";
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
  const image = product.images[0];
  const src = image?.url || PLACEHOLDER;
  const alt = image?.alt || product.name;
  const specEntries = Object.entries(product.specs).slice(0, 3);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:border-accent/40 hover:shadow-md">
      <Link
        href={`/san-pham/${product.slug}`}
        className="relative block bg-gray-50"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 transition duration-300 group-hover:scale-[1.03]"
            priority={priority}
          />
        </div>
        {pct != null && (
          <span className="badge-sale absolute left-2 top-2">-{pct}%</span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        {brandName && (
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {brandName}
          </p>
        )}
        <Link href={`/san-pham/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-accent sm:text-base">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-500">Model: {product.model}</p>

        {specEntries.length > 0 && (
          <ul className="space-y-0.5 text-xs text-gray-600">
            {specEntries.map(([key, value]) => (
              <li key={key} className="flex gap-1">
                <span className="text-accent">•</span>
                <span>
                  <span className="text-gray-500">{key}:</span> {value}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto space-y-2 pt-2">
          <div className="flex flex-wrap items-baseline gap-2">
            {product.salePrice != null && product.salePrice < product.price ? (
              <>
                <span className="text-lg font-bold text-sale">
                  {formatVnd(product.salePrice)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {formatVnd(product.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatVnd(product.price)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>Đã bán {product.soldCount}</span>
            <span
              className={
                product.stockStatus === "in_stock" ? "badge-stock" : "badge-out"
              }
            >
              {stock.labelVi}
            </span>
          </div>

          <Link
            href={`/san-pham/${product.slug}#lien-he`}
            className="btn-primary w-full"
          >
            Liên hệ
          </Link>
        </div>
      </div>
    </article>
  );
}
