import type { Metadata } from "next";
import { Suspense } from "react";
import { Be_Vietnam_Pro } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ContactFab } from "@/components/ContactFab";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { NavigationProgress } from "@/components/NavigationProgress";
import { getCategories, getSiteSettings } from "@/lib/data";
import { DEFAULT_HEADER_CTA_LABEL } from "@ecom/shared";
import { organizationJsonLd, siteShareImage } from "@/lib/seo";
import { absoluteUrl, getSiteUrl } from "@/lib/site";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-be-vietnam",
});

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const titleDefault = `${s.siteName} — Sản phẩm`;
  const description = s.metaDescription || s.tagline;
  const icon = s.logoSquareUrl;
  const shareImage = siteShareImage(s);

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: titleDefault,
      template: `%s | ${s.siteName}`,
    },
    description,
    alternates: {
      canonical: "/",
    },
    ...(icon
      ? { icons: { icon: [{ url: icon }], apple: [{ url: icon }] } }
      : {}),
    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: absoluteUrl("/"),
      siteName: s.siteName,
      title: titleDefault,
      description,
      ...(shareImage ? { images: [{ url: shareImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description,
      ...(shareImage ? { images: [shareImage] } : {}),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getCategories(),
  ]);

  return (
    <html lang="vi" className={beVietnam.variable}>
      <body
        className={`${beVietnam.className} flex min-h-screen flex-col antialiased`}
      >
        <JsonLd data={organizationJsonLd(settings)} />
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <Header
          siteName={settings.siteName}
          phone={settings.phone}
          searchPlaceholder={settings.searchPlaceholder}
          logoUrl={settings.logoUrl}
          ctaLabel={settings.headerCtaLabel || DEFAULT_HEADER_CTA_LABEL}
          categories={categories}
        />
        <main className="min-w-0 flex-1 pb-28 sm:pb-8">{children}</main>
        <Footer settings={settings} />
        <ContactFab phone={settings.phone} zaloUrl={settings.zaloUrl} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
