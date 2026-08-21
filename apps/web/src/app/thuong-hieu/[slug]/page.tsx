import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Brand } from "@ecom/shared";
import { CatalogToolbar } from "@/components/CatalogToolbar";
import { Breadcrumb } from "@/components/Breadcrumb";
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
  listPublishedBrandSlugs,
} from "@/lib/data";
import { breadcrumbJsonLd, siteShareImage } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const FILTER_KEYS = ["category", "price", "sort", "page", "pageSize"] as const;
const BRAND_DROP_PARAMS = ["brand"] as const;
const BRAND_HREF_BASE = "/thuong-hieu";
const DEFAULT_PAGE_SIZE = 12;
const DEFAULT_SORT = "price_desc";
const INDUSTRY_LABEL = "Máy xịt rửa, máy nén khí";

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

function brandHeadline(name: string): string {
  return `${INDUSTRY_LABEL} ${name} chính hãng`;
}

function brandDescription(name: string, siteName: string): string {
  return `${INDUSTRY_LABEL} ${name} chính hãng tại ${siteName} — giá tốt, bảo hành đầy đủ, tư vấn miễn phí và giao hàng toàn quốc.`;
}

async function findBrand(slug: string): Promise<Brand | undefined> {
  const brands = await getBrands();
  return brands.find((b) => b.slug === slug);
}

export async function generateStaticParams() {
  const slugs = await listPublishedBrandSlugs();
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
  const brand = await findBrand(slug);

  if (!brand) {
    return {
      title: "Không tìm thấy thương hiệu",
      robots: { index: false, follow: false },
    };
  }

  const settings = await getSiteSettings();
  const path = `/thuong-hieu/${brand.slug}`;
  const title = brand.metaTitle.trim() || brandHeadline(brand.name);
  const description =
    brand.metaDescription.trim() ||
    brandDescription(brand.name, settings.siteName);
  const image = siteShareImage(settings);

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: hasAnyFilter(sp)
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      url: absoluteUrl(path),
      title: `${title} | ${settings.siteName}`,
      description,
      siteName: settings.siteName,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const brands = await getBrands();
  const brand = brands.find((b) => b.slug === slug);
  if (!brand) notFound();

  const category = first(sp.category);
  const price = first(sp.price);
  const sort = first(sp.sort) ?? DEFAULT_SORT;
  const page = Number(first(sp.page) ?? "1") || 1;
  const pageSize = Number(first(sp.pageSize) ?? String(DEFAULT_PAGE_SIZE)) ||
    DEFAULT_PAGE_SIZE;

  const query = new URLSearchParams();
  if (category) query.set("category", category);
  if (price) query.set("price", price);
  if (sort) query.set("sort", sort);
  if (pageSize !== DEFAULT_PAGE_SIZE) query.set("pageSize", String(pageSize));
  const queryString = query.toString();
  const basePath = `/thuong-hieu/${brand.slug}`;

  const [categories, settings, result] = await Promise.all([
    getCategories(),
    getSiteSettings(),
    listProducts({
      brandSlug: brand.slug,
      categorySlug: category,
      price,
      sort,
      page,
      pageSize,
    }),
  ]);

  const headline = brandHeadline(brand.name);
  const intro = brand.description.trim();

  return (
    <div className="container-page py-4 sm:py-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Trang chủ", path: "/" },
          { name: "Sản phẩm", path: "/san-pham" },
          { name: brand.name },
        ])}
      />

      <Breadcrumb
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Sản phẩm", path: "/san-pham" },
          { name: brand.name },
        ]}
      />

      <header className="mb-4 border-b-2 border-gray-100 pb-3 sm:mb-5">
        <h1 className="text-xl font-extrabold uppercase tracking-wide text-brand sm:text-2xl">
          {headline}
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm text-gray-600">
          {brandDescription(brand.name, settings.siteName)}
        </p>

        {intro ? (
          <div className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-gray-600">
            {intro}
          </div>
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
              activeBrandSlug={brand.slug}
              dropParams={BRAND_DROP_PARAMS}
              brandHrefBase={BRAND_HREF_BASE}
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
                activeBrandSlug={brand.slug}
                dropParams={BRAND_DROP_PARAMS}
                brandHrefBase={BRAND_HREF_BASE}
              />
              <CatalogToolbar
                shown={result.items.length}
                total={result.total}
                basePath={basePath}
                dropParams={BRAND_DROP_PARAMS}
              />
            </div>
          </Suspense>

          {result.items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="font-medium text-gray-800">
                Không tìm thấy sản phẩm phù hợp
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Thử bỏ bớt bộ lọc hoặc xem thương hiệu khác.
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
            dropParams={BRAND_DROP_PARAMS}
          />
        </div>
      </div>
    </div>
  );
}
