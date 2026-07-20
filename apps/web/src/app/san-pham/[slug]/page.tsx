import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { STOCK_STATUS, primaryImage } from "@ecom/shared";
import { JsonLd } from "@/components/JsonLd";
import { LeadForm } from "@/components/LeadForm";
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
    product.description ??
    `${product.name} — model ${product.model}. Liên hệ ${settings.siteName}.`;
  const path = `/san-pham/${product.slug}`;
  const image = primaryImage(product)?.url;

  return {
    title: product.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: absoluteUrl(path),
      title: product.name,
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
      title: product.name,
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
    <div className="container-page py-6 sm:py-8">
      <JsonLd data={productJsonLd(product, { brand, category })} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      <nav
        className="mb-4 text-xs text-gray-500 sm:text-sm"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-accent">
          Trang chủ
        </Link>
        <span className="mx-1.5">/</span>
        <Link href="/san-pham" className="hover:text-accent">
          Sản phẩm
        </Link>
        {category && (
          <>
            <span className="mx-1.5">/</span>
            <Link
              href={`/san-pham?category=${category.slug}`}
              className="hover:text-accent"
            >
              {category.name}
            </Link>
          </>
        )}
        <span className="mx-1.5">/</span>
        <span className="text-gray-800">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery media={product.media} name={product.name} />

        <div className="space-y-5">
          {brand && (
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {brand.name}
            </p>
          )}
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {product.name}
          </h1>
          <p className="text-sm text-gray-600">Model: {product.model}</p>

          <div className="flex flex-wrap items-center gap-3">
            {product.salePrice != null && product.salePrice < product.price ? (
              <>
                <span className="text-3xl font-bold text-sale">
                  {formatVnd(product.salePrice)}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  {formatVnd(product.price)}
                </span>
                {pct != null && <span className="badge-sale">-{pct}%</span>}
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
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

          {product.description && (
            <p className="text-sm leading-relaxed text-gray-700">
              {product.description}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <a href={telHref} className="btn-primary">
              Gọi ngay
            </a>
            <a
              href={zalo}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              Zalo
            </a>
          </div>

          <div
            id="lien-he"
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <LeadForm productId={product.id} productName={product.name} />
          </div>
        </div>
      </div>

      <section className="mt-10 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <h2
          id="specs-heading"
          className="border-b border-gray-100 px-4 py-3 text-base font-bold text-gray-900"
        >
          Thông số kỹ thuật
        </h2>
        <table className="w-full text-sm" aria-labelledby="specs-heading">
          <tbody>
            <tr className="border-b border-gray-50 odd:bg-gray-50/60">
              <th className="w-1/3 px-4 py-2.5 text-left font-medium text-gray-600">
                Model
              </th>
              <td className="px-4 py-2.5 text-gray-900">{product.model}</td>
            </tr>
            {product.motor && (
              <tr className="border-b border-gray-50 odd:bg-gray-50/60">
                <th className="px-4 py-2.5 text-left font-medium text-gray-600">
                  Động cơ
                </th>
                <td className="px-4 py-2.5 text-gray-900">{product.motor}</td>
              </tr>
            )}
            {Object.entries(product.specs).map(([key, value]) => (
              <tr
                key={key}
                className="border-b border-gray-50 odd:bg-gray-50/60"
              >
                <th className="px-4 py-2.5 text-left font-medium text-gray-600">
                  {key}
                </th>
                <td className="px-4 py-2.5 text-gray-900">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
