import type {
  Brand,
  Category,
  FaqEntry,
  OpeningHoursEntry,
  Post,
  Product,
  SiteSettings,
} from "@ecom/shared";
import { imageMedia, stripHtml } from "@ecom/shared";
import { absoluteUrl } from "./site";

const AVAILABILITY: Record<Product["stockStatus"], string> = {
  in_stock: "https://schema.org/InStock",
  out_of_stock: "https://schema.org/OutOfStock",
  discontinued: "https://schema.org/Discontinued",
};

const DAY_OF_WEEK_URL: Record<string, string> = {
  Mo: "https://schema.org/Monday",
  Tu: "https://schema.org/Tuesday",
  We: "https://schema.org/Wednesday",
  Th: "https://schema.org/Thursday",
  Fr: "https://schema.org/Friday",
  Sa: "https://schema.org/Saturday",
  Su: "https://schema.org/Sunday",
};

type PostalAddressJsonLd = {
  "@type": "PostalAddress";
  addressCountry: "VN";
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
};

type GeoJsonLd = {
  "@type": "GeoCoordinates";
  latitude: number;
  longitude: number;
};

type OpeningHoursJsonLd = {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string[];
  opens: string;
  closes: string;
};

function clean(value: string | undefined): string {
  return value?.trim() ?? "";
}

function postalAddressJsonLd(
  settings: SiteSettings,
): PostalAddressJsonLd | null {
  const streetAddress = clean(settings.address);
  const addressLocality = clean(settings.addressLocality);
  const addressRegion = clean(settings.addressRegion);
  const postalCode = clean(settings.postalCode);

  if (!streetAddress && !addressLocality && !addressRegion && !postalCode) {
    return null;
  }

  return {
    "@type": "PostalAddress",
    ...(streetAddress ? { streetAddress } : {}),
    ...(addressLocality ? { addressLocality } : {}),
    ...(addressRegion ? { addressRegion } : {}),
    ...(postalCode ? { postalCode } : {}),
    addressCountry: "VN",
  };
}

function geoJsonLd(settings: SiteSettings): GeoJsonLd | null {
  const rawLatitude = clean(settings.latitude);
  const rawLongitude = clean(settings.longitude);
  if (!rawLatitude || !rawLongitude) return null;

  const latitude = Number(rawLatitude);
  const longitude = Number(rawLongitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return { "@type": "GeoCoordinates", latitude, longitude };
}

function openingHoursJsonLd(
  entries: OpeningHoursEntry[],
): OpeningHoursJsonLd[] {
  return entries.flatMap((entry) => {
    const dayOfWeek = (entry.days ?? [])
      .map((day) => DAY_OF_WEEK_URL[clean(day)])
      .filter((url): url is string => Boolean(url));
    const opens = clean(entry.opens);
    const closes = clean(entry.closes);
    if (!dayOfWeek.length || !opens || !closes) return [];

    return [
      {
        "@type": "OpeningHoursSpecification" as const,
        dayOfWeek,
        opens,
        closes,
      },
    ];
  });
}

export function siteShareImage(settings: SiteSettings): string {
  return (
    settings.logoSquareUrl || settings.logoUrl || settings.heroImageUrl || ""
  );
}

export function organizationJsonLd(settings: SiteSettings) {
  const address = postalAddressJsonLd(settings);
  const geo = geoJsonLd(settings);
  const openingHoursSpecification = openingHoursJsonLd(
    settings.openingHours ?? [],
  );
  const priceRange = clean(settings.priceRange);

  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: settings.siteName,
    url: absoluteUrl("/"),
    description: settings.metaDescription || settings.tagline,
    telephone: settings.phone,
    ...(settings.logoSquareUrl || settings.logoUrl
      ? { logo: settings.logoSquareUrl || settings.logoUrl }
      : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(address ? { address } : {}),
    ...(geo ? { geo } : {}),
    ...(openingHoursSpecification.length ? { openingHoursSpecification } : {}),
    ...(priceRange ? { priceRange } : {}),
    sameAs: settings.zaloUrl ? [settings.zaloUrl] : [],
  };
}

export function faqJsonLd(
  faqs: FaqEntry[],
): Record<string, unknown> | null {
  const items = faqs.filter(
    (faq) => clean(faq.question) && clean(faq.answer),
  );
  if (!items.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: clean(faq.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: clean(faq.answer),
      },
    })),
  };
}

export function productJsonLd(
  product: Product,
  opts: { brand?: Brand; category?: Category; settings?: SiteSettings },
) {
  const price =
    product.salePrice != null && product.salePrice < product.price
      ? product.salePrice
      : product.price;
  const images = imageMedia(product).map((i) => i.url).filter(Boolean);
  const hasShippingPolicy = Boolean(clean(opts.settings?.shippingPolicy));
  const hasReturnPolicy = Boolean(clean(opts.settings?.returnPolicy));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      stripHtml(product.description ?? "") ||
      `${product.name} — model ${product.model}`,
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
      ...(hasShippingPolicy
        ? {
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingDestination: {
                "@type": "DefinedRegion",
                addressCountry: "VN",
              },
            },
          }
        : {}),
      ...(hasReturnPolicy
        ? {
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "VN",
              returnPolicyCategory:
                "https://schema.org/MerchantReturnFiniteReturnWindow",
            },
          }
        : {}),
    },
  };
}

export function articleJsonLd(post: Post, settings: SiteSettings) {
  const path = `/cam-nang/${post.slug}`;
  const image = clean(post.coverUrl) || siteShareImage(settings);
  const datePublished = clean(post.publishedAt ?? "") || clean(post.createdAt);
  const dateModified = clean(post.updatedAt) || datePublished;
  const author = clean(post.authorName) || settings.siteName;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: clean(post.metaTitle) || post.title,
    description:
      clean(post.metaDescription) ||
      clean(post.excerpt) ||
      stripHtml(post.body).slice(0, 200),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(path),
    },
    ...(image ? { image: [image] } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    author: { "@type": "Person", name: author },
    publisher: {
      "@type": "Organization",
      name: settings.siteName,
      ...(settings.logoSquareUrl || settings.logoUrl
        ? {
            logo: {
              "@type": "ImageObject",
              url: settings.logoSquareUrl || settings.logoUrl,
            },
          }
        : {}),
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
