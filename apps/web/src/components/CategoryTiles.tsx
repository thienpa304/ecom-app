import Link from "next/link";
import type { NavCategory } from "@/lib/data";
import { SafeImage } from "@/components/SafeImage";

type Props = {
  items: NavCategory[];
};

export function CategoryTiles({ items }: Props) {
  if (!items.length) return null;

  return (
    <section
      className="container-page py-4 sm:py-6"
      aria-labelledby="danh-muc-heading"
    >
      <h2
        id="danh-muc-heading"
        className="mb-3 text-lg font-extrabold uppercase tracking-wide text-brand sm:mb-4 sm:text-xl"
      >
        Danh mục sản phẩm
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {items.map(({ category, imageUrl, children }) => (
          <div
            key={category.id}
            className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-accent/50 hover:shadow-md sm:p-4"
          >
            <Link
              href={`/danh-muc/${category.slug}`}
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-50 sm:h-24 sm:w-24"
            >
              <SafeImage
                src={imageUrl}
                alt={category.name}
                fill
                sizes="96px"
                className="object-contain p-1"
              />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <Link
                href={`/danh-muc/${category.slug}`}
                className="text-[15px] font-bold leading-snug text-gray-900 hover:text-accent sm:text-base"
              >
                {category.name}
              </Link>
              {children.length ? (
                <ul className="mt-1.5 space-y-1">
                  {children.map((child) => (
                    <li key={child.category.id}>
                      <Link
                        href={`/danh-muc/${child.category.slug}`}
                        className="text-sm text-gray-600 hover:text-accent hover:underline"
                      >
                        {child.category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}

              <Link
                href={`/danh-muc/${category.slug}`}
                className="mt-auto pt-2 text-sm font-semibold text-accent hover:underline"
              >
                Xem tất cả →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
