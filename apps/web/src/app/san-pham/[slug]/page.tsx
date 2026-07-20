import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { STOCK_STATUS, primaryImage } from "@ecom/shared";
import { JsonLd } from "@/components/JsonLd";
import { LeadForm } from "@/components/LeadForm";
import {
  descriptionPlainText,
  ProductDescription,
} from "@/components/ProductDescription";
import { ProductGallery } from "@/components/ProductGallery";
import {
  getBrandById,
  getCategoryById,
  getProductBySlug,
  getSiteSettings,
  listPublishedProductSlugs,
} from "@/lib/data";
import { discountPercent, formatVnd } from "@/lib/format";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await listPublishedProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getSiteSettings(),
  ]);
  if (!product) {
    return {
      title: "Không tìm thấy",
      robots: { index: false, follow: false },
    };
  }

  const description =
    product.metaDescription?.trim() ||
    descriptionPlainText(product.description, 160) ||
    `${product.name} — model ${product.model}. Liên hệ ${settings.siteName}.`;
  const title = product.metaTitle?.trim() || product.name;
  const path = `/san-pham/${product.slug}`;
  const image = primaryImage(product)?.url;
  const keywords = product.seoKeywords
    ?.split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: absoluteUrl(path),
      title,
      description,
      siteName: settings.siteName,
      ...(image
        ? {
            images: [
              {
                url: image,
                alt: primaryImage(product)?.alt || product.name,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [brand, category, settings] = await Promise.all([
    getBrandById(product.brandId),
    getCategoryById(product.categoryId),
    getSiteSettings(),
  ]);
  const pct = discountPercent(product.price, product.salePrice);
  const stock = STOCK_STATUS[product.stockStatus];
  const phone = settings.phone;
  const zalo = settings.zaloUrl;
  const telHref = `tel:${phone.replace(/\D/g, "")}`;

  const crumbs = [
    { name: "Trang chủ", path: "/" },
    { name: "Sản phẩm", path: "/san-pham" },
    ...(category
      ? [
          {
            name: category.name,
            path: `/san-pham?category=${category.slug}`,
          },
        ]
      : []),
    { name: product.name },
  ];

  return (
    <div className="container-page min-w-0 overflow-x-hidden py-6 sm:py-8">
      <JsonLd data={productJsonLd(product, { brand, category })} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      <nav
        className="mb-4 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-gray-500 sm:text-sm"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-accent">
          Trang chủ
        </Link>
        <span aria-hidden>/</span>
        <Link href="/san-pham" className="hover:text-accent">
          Sản phẩm
        </Link>
        {category && (
          <>
            <span aria-hidden>/</span>
            <Link
              href={`/san-pham?category=${category.slug}`}
              className="hover:text-accent"
            >
              {category.name}
            </Link>
          </>
        )}
        <span aria-hidden>/</span>
        <span className="min-w-0 break-words text-gray-800">{product.name}</span>
      </nav>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="min-w-0">
          <ProductGallery media={product.media} name={product.name} />
        </div>

        <div className="min-w-0 space-y-4 sm:space-y-5">
          {brand && (
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {brand.name}
            </p>
          )}
          <h1 className="break-words text-xl font-extrabold leading-snug text-gray-900 sm:text-3xl">
            {product.name}
          </h1>
          <p className="text-sm text-gray-600">Model: {product.model}</p>

          <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
            {product.salePrice != null && product.salePrice < product.price ? (
              <>
                <span className="text-2xl font-bold text-sale sm:text-3xl">
                  {formatVnd(product.salePrice)}
                </span>
                <span className="text-base text-gray-400 line-through sm:text-lg">
                  {formatVnd(product.price)}
                </span>
                {pct != null && <span className="badge-sale">-{pct}%</span>}
              </>
            ) : (
              <span className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {formatVnd(product.price)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <span
              className={
                product.stockStatus === "in_stock" ? "badge-stock" : "badge-out"
              }
            >
              {stock.labelVi}
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              Đã bán {product.soldCount}
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              BH: {product.warranty}
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              Xuất xứ: {product.origin}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <a href={telHref} className="btn-primary flex-1 sm:flex-none">
              Gọi ngay
            </a>
            <a
              href={zalo}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline flex-1 sm:flex-none"
            >
              Zalo
            </a>
          </div>

          <div
            id="lien-he"
            className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4"
          >
            <LeadForm productId={product.id} productName={product.name} />
          </div>
        </div>
      </div>

      {product.description ? (
        <section className="mt-8 min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white sm:mt-10">
          <h2 className="border-b border-gray-100 px-3 py-3 text-base font-bold text-gray-900 sm:px-4">
            Mô tả sản phẩm
          </h2>
          <div className="min-w-0 px-3 py-4 sm:px-4">
            <ProductDescription html={product.description} />
          </div>
        </section>
      ) : null}

      <section className="mt-6 min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white sm:mt-8">
        <h2
          id="specs-heading"
          className="border-b border-gray-100 px-3 py-3 text-base font-bold text-gray-900 sm:px-4"
        >
          Thông số kỹ thuật
        </h2>
        <div className="overflow-x-auto">
          <table
            className="w-full min-w-0 table-fixed text-sm"
            aria-labelledby="specs-heading"
          >
            <tbody>
              <tr className="border-b border-gray-50 odd:bg-gray-50/60">
                <th className="w-[38%] px-3 py-2.5 text-left font-medium text-gray-600 sm:w-1/3 sm:px-4">
                  Model
                </th>
                <td className="break-words px-3 py-2.5 text-gray-900 sm:px-4">
                  {product.model}
                </td>
              </tr>
              {product.motor && (
                <tr className="border-b border-gray-50 odd:bg-gray-50/60">
                  <th className="px-3 py-2.5 text-left font-medium text-gray-600 sm:px-4">
                    Động cơ
                  </th>
                  <td className="break-words px-3 py-2.5 text-gray-900 sm:px-4">
                    {product.motor}
                  </td>
                </tr>
              )}
              {Object.entries(product.specs).map(([key, value]) => (
                <tr
                  key={key}
                  className="border-b border-gray-50 odd:bg-gray-50/60"
                >
                  <th className="px-3 py-2.5 text-left font-medium text-gray-600 sm:px-4">
                    {key}
                  </th>
                  <td className="break-words px-3 py-2.5 text-gray-900 sm:px-4">
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
