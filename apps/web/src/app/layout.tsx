import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSiteSettings } from "@/lib/data";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: {
      default: `${s.siteName} — Catalog sản phẩm`,
      template: `%s | ${s.siteName}`,
    },
    description: s.metaDescription || s.tagline,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <Header
          siteName={settings.siteName}
          phone={settings.phone}
          searchPlaceholder={settings.searchPlaceholder}
        />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
