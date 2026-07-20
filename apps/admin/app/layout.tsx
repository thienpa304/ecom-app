import type { Metadata, Viewport } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Be_Vietnam_Pro } from "next/font/google";
import { Suspense, type CSSProperties } from "react";
import { AntdProvider } from "@/components/AntdProvider";
import { NavigationProgress } from "@/components/NavigationProgress";
import { BRAND } from "@/lib/theme";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-admin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin — Điện Máy Lộc Phát Đạt",
  description: "Quản trị danh mục và cấu hình cửa hàng",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={beVietnam.variable}>
      <body
        style={
          {
            fontFamily: "var(--font-admin), sans-serif",
            ["--admin-primary" as string]: BRAND.primary,
            ["--admin-layout-bg" as string]: BRAND.layoutBg,
          } as CSSProperties
        }
      >
        <AntdRegistry>
          <AntdProvider>
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            {children}
          </AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
