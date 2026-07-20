import type { Brand, Category, Product, SiteSettings } from "@ecom/shared";
import { absoluteUrl } from "./site";

const AVAILABILITY: Record<Product["stockStatus"], string> = {
  in_stock: "https://schema.org/InStock",
  out_of_stock: "https://schema.org/OutOfStock",
  discontinued: "https://schema.org/Discontinued",
};

export function organizationJsonLd(settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    url: absoluteUrl("/"),
    description: settings.metaDescription || settings.tagline,
    telephone: settings.phone,
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: settings.address,
            addressCountry: "VN",
          },
        }
      : {}),
    sameAs: settings.zaloUrl ? [settings.zaloUrl] : [],
  };
}

export function productJsonLd(
  product: Product,
  opts: { brand?: Brand; category?: Category },
) {
  const price =
    product.salePrice != null && product.salePrice < product.price
      ? product.salePrice
      : product.price;
  const images = product.images.map((i) => i.url).filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description || `${product.name} — model ${product.model}`,
    sku: product.model,
    mpn: product.model,
    ...(opts.brand
      ? { brand: { "@type": "Brand", name: opts.brand.name } }
      : {}),
    ...(opts.category ? { category: opts.category.name } : {}),
    ...(images.length ? { image: images } : {}),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/san-pham/${product.slug}`),
      priceCurrency: "VND",
      price: String(price),
      availability: AVAILABILITY[product.stockStatus],
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  };
}
