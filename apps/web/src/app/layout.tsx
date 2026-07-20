import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ContactFab } from "@/components/ContactFab";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { getSiteSettings } from "@/lib/data";
import { organizationJsonLd } from "@/lib/seo";
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
  const titleDefault = `${s.siteName} — Catalog sản phẩm`;
  const description = s.metaDescription || s.tagline;

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
    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: absoluteUrl("/"),
      siteName: s.siteName,
      title: titleDefault,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description,
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
  const settings = await getSiteSettings();

  return (
    <html lang="vi" className={beVietnam.variable}>
      <body
        className={`${beVietnam.className} flex min-h-screen flex-col antialiased`}
      >
        <JsonLd data={organizationJsonLd(settings)} />
        <Header
          siteName={settings.siteName}
          phone={settings.phone}
          searchPlaceholder={settings.searchPlaceholder}
        />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
        <ContactFab phone={settings.phone} zaloUrl={settings.zaloUrl} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
