import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { STOCK_STATUS, primaryImage, videoMedia } from "@ecom/shared";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { SectionCard } from "@/components/SectionCard";
import { StorePolicies } from "@/components/StorePolicies";
import { VideoReviewSection } from "@/components/VideoReviewSection";
import {
  descriptionPlainText,
  ProductDescription,
} from "@/components/ProductDescription";
import { ProductContactCta } from "@/components/ProductContactCta";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductPriceNote } from "@/components/ProductPriceNote";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { RelatedProducts } from "@/components/RelatedProducts";
import { StoreCommitments } from "@/components/StoreCommitments";
import {
  getBrandById,
  getCategoryById,
  getProductBySlug,
  getSiteSettings,
  listProducts,
  listPublishedProductSlugs,
  listVideoProducts,
} from "@/lib/data";
import { discountPercent, formatVnd } from "@/lib/format";
import { breadcrumbJsonLd, faqJsonLd, productJsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export const revalidate = 60;

const SPEC_LABELS_ALREADY_SHOWN = ["model", "động cơ", "dong co", "motor"];

function isDuplicateSpec(key: string): boolean {
  return SPEC_LABELS_ALREADY_SHOWN.includes(key.trim().toLowerCase());
}

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
    ...(product.stockStatus === "discontinued"
      ? { robots: { index: false, follow: true } }
      : {}),
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

  const sameCategory = category
    ? await listProducts({ categorySlug: category.slug, pageSize: 12 })
    : null;
  const categoryPeers = (sameCategory?.items ?? []).filter(
    (item) => item.id !== product.id,
  );
  const relatedProducts = categoryPeers.slice(0, 4);

  // Ưu tiên video của sản phẩm cùng danh mục (đã có sẵn media trong
  // categoryPeers); nếu danh mục chưa có video nào thì lấy danh sách chung.
  const categoryVideoProducts = categoryPeers.filter(
    (item) => videoMedia(item).length > 0,
  );
  const videoProducts =
    categoryVideoProducts.length > 0
      ? categoryVideoProducts.slice(0, 4)
      : (await listVideoProducts(5))
          .filter((item) => item.id !== product.id)
          .slice(0, 4);

  const faqData = faqJsonLd(settings.faqs ?? []);

  const crumbs = [
    { name: "Trang chủ", path: "/" },
    { name: "Sản phẩm", path: "/san-pham" },
    ...(category
      ? [
          {
            name: category.name,
            path: `/danh-muc/${category.slug}`,
          },
        ]
      : []),
    { name: product.name },
  ];

  return (
    <div className="container-page min-w-0 py-4 sm:py-6">
      <JsonLd data={productJsonLd(product, { brand, category, settings })} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {faqData ? <JsonLd data={faqData} /> : null}

      <Breadcrumb items={crumbs} />

      <div className="grid min-w-0 gap-5 lg:grid-cols-2 lg:gap-7">
        <div className="min-w-0">
          <ProductGallery media={product.media} name={product.name} />
        </div>

        <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
          {brand && (
            <Link
              href={`/thuong-hieu/${brand.slug}`}
              className="text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-accent transition"
            >
              {brand.name}
            </Link>
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

          <ProductPriceNote />

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

          <ProductContactCta
            phone={settings.phone}
            zaloUrl={settings.zaloUrl}
            productName={product.name}
            productModel={product.model}
          />

          {/* mt-auto để mép dưới khối cam kết khớp mép dưới ảnh gallery */}
          <div className="lg:mt-auto">
            <StoreCommitments />
          </div>
        </div>
      </div>

      <div className="mt-5 min-w-0 space-y-4 sm:mt-7 sm:space-y-5">
        <SectionCard
          title="Thông số kỹ thuật"
          headingId="specs-heading"
          bodyClassName="min-w-0 overflow-x-auto"
        >
          <table
            className="w-full min-w-0 table-fixed text-sm"
            aria-labelledby="specs-heading"
          >
            <tbody>
              <tr className="border-b border-gray-50 odd:bg-gray-50/60">
                <th className="w-[38%] break-words px-4 py-2.5 text-left align-top font-medium text-gray-600 sm:w-1/3">
                  Model
                </th>
                <td className="break-words px-4 py-2.5 text-gray-900">
                  {product.model}
                </td>
              </tr>
              {product.motor && (
                <tr className="border-b border-gray-50 odd:bg-gray-50/60">
                  <th className="break-words px-4 py-2.5 text-left align-top font-medium text-gray-600">
                    Động cơ
                  </th>
                  <td className="break-words px-4 py-2.5 text-gray-900">
                    {product.motor}
                  </td>
                </tr>
              )}
              {Object.entries(product.specs)
                .filter(([key]) => !isDuplicateSpec(key))
                .map(([key, value]) => (
                  <tr
                    key={key}
                    className="border-b border-gray-50 odd:bg-gray-50/60"
                  >
                    <th className="break-words px-4 py-2.5 text-left align-top font-medium text-gray-600">
                      {key}
                    </th>
                    <td className="break-words px-4 py-2.5 text-gray-900">
                      {value}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </SectionCard>

        {product.description ? (
          <SectionCard title="Mô tả sản phẩm">
            <ProductDescription html={product.description} />
          </SectionCard>
        ) : null}

        <StorePolicies
          shippingPolicy={settings.shippingPolicy}
          returnPolicy={settings.returnPolicy}
        />

        <FaqSection faqs={settings.faqs ?? []} />

        {videoProducts.length > 0 && (
          <SectionCard title="Video review sản phẩm">
            <VideoReviewSection products={videoProducts} />
          </SectionCard>
        )}

        <RelatedProducts
          products={relatedProducts}
          viewAllHref={
            category ? `/danh-muc/${category.slug}` : "/san-pham"
          }
        />

        <RecentlyViewed
          currentSlug={product.slug}
          products={categoryPeers}
          viewAllHref="/san-pham"
        />
      </div>
    </div>
  );
}
