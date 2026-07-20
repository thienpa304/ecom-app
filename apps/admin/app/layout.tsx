import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ecom Admin",
  description: "Quản trị danh mục sản phẩm",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
