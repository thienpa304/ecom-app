import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Category } from "@ecom/shared";
import { CatalogToolbar } from "@/components/CatalogToolbar";
import { JsonLd } from "@/components/JsonLd";
import { MobileFilters } from "@/components/MobileFilters";
import { Pagination } from "@/components/Pagination";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import {
  getBrands,
  getCategories,
  getSiteSettings,
  listProducts,
  listPublishedCategorySlugs,
} from "@/lib/data";
import { breadcrumbJsonLd, siteShareImage } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const FILTER_KEYS = ["brand", "price", "sort", "page", "pageSize"] as const;
const DEFAULT_PAGE_SIZE = 12;
const DEFAULT_SORT = "price_desc";

export const revalidate = 60;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function hasAnyFilter(
  sp: Record<string, string | string[] | undefined>,
): boolean {
  return FILTER_KEYS.some((key) => Boolean(first(sp[key])));
}

function byOrderThenName(a: Category, b: Category): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.name.localeCompare(b.name, "vi");
}

function categoryDescription(name: string, siteName: string): string {
  return `${name} chính hãng tại ${siteName} — giá tốt, bảo hành đầy đủ, tư vấn miễn phí và giao hàng toàn quốc.`;
}

async function findCategory(slug: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug);
}

export async function generateStaticParams() {
  const slugs = await listPublishedCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await findCategory(slug);

  if (!category) {
    return {
      title: "Không tìm thấy danh mục",
      robots: { index: false, follow: false },
    };
  }

  const settings = await getSiteSettings();
  const path = `/danh-muc/${category.slug}`;
  const description = categoryDescription(category.name, settings.siteName);
  const image = siteShareImage(settings);

  return {
    title: category.name,
    description,
    alternates: { canonical: path },
    robots: hasAnyFilter(sp)
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      url: absoluteUrl(path),
      title: `${category.name} | ${settings.siteName}`,
      description,
      siteName: settings.siteName,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const brand = first(sp.brand);
  const price = first(sp.price);
  const sort = first(sp.sort) ?? DEFAULT_SORT;
  const page = Number(first(sp.page) ?? "1") || 1;
  const pageSize = Number(first(sp.pageSize) ?? String(DEFAULT_PAGE_SIZE)) ||
    DEFAULT_PAGE_SIZE;

  const query = new URLSearchParams();
  if (brand) query.set("brand", brand);
  if (price) query.set("price", price);
  if (sort) query.set("sort", sort);
  if (pageSize !== DEFAULT_PAGE_SIZE) query.set("pageSize", String(pageSize));
  const queryString = query.toString();
  const basePath = `/danh-muc/${category.slug}`;

  const [brands, settings, result] = await Promise.all([
    getBrands(),
    getSiteSettings(),
    listProducts({
      brandSlug: brand,
      categorySlug: category.slug,
      price,
      sort,
      page,
      pageSize,
    }),
  ]);

  const children = categories
    .filter((c) => c.parentId === category.id)
    .sort(byOrderThenName);

  return (
    <div className="container-page py-4 sm:py-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Trang chủ", path: "/" },
          { name: "Sản phẩm", path: "/san-pham" },
          { name: category.name },
        ])}
      />

      <nav
        className="mb-3 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-gray-500 sm:text-sm"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-accent">
          Trang chủ
        </Link>
        <span aria-hidden>/</span>
        <Link href="/san-pham" className="hover:text-accent">
          Sản phẩm
        </Link>
        <span aria-hidden>/</span>
        <span className="min-w-0 break-words text-gray-800">
          {category.name}
        </span>
      </nav>

      <header className="mb-4 border-b-2 border-gray-100 pb-3 sm:mb-5">
        <h1 className="text-xl font-extrabold uppercase tracking-wide text-brand sm:text-2xl">
          {category.name}
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm text-gray-600">
          {categoryDescription(category.name, settings.siteName)}
        </p>

        {children.length ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {children.map((child) => (
              <li key={child.id}>
                <Link
                  href={`/danh-muc/${child.slug}`}
                  className="inline-flex min-h-9 items-center rounded-full border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:text-sm"
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Suspense
          fallback={
            <div className="hidden h-80 animate-pulse rounded-lg bg-gray-100 lg:block" />
          }
        >
          <div className="hidden lg:block">
            <ProductFilters
              brands={brands}
              categories={categories}
              basePath={basePath}
              activeCategorySlug={category.slug}
            />
          </div>
        </Suspense>

        <div className="min-w-0 space-y-3 sm:space-y-4">
          <Suspense
            fallback={
              <div className="h-12 animate-pulse rounded-lg bg-gray-100" />
            }
          >
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2.5 sm:gap-3 sm:px-3 sm:py-2.5">
              <MobileFilters
                brands={brands}
                categories={categories}
                basePath={basePath}
                activeCategorySlug={category.slug}
              />
              <CatalogToolbar
                shown={result.items.length}
                total={result.total}
                basePath={basePath}
              />
            </div>
          </Suspense>

          {result.items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="font-medium text-gray-800">
                Không tìm thấy sản phẩm phù hợp
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Thử bỏ bớt bộ lọc hoặc tìm từ khóa khác.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
              {result.items.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 3}
                />
              ))}
            </div>
          )}

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            queryString={queryString}
            basePath={basePath}
          />
        </div>
      </div>
    </div>
  );
}
