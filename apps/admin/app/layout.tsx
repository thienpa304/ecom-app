import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { AntdProvider } from "@/components/AntdProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin — Điện Máy Của Thiên",
  description: "Quản trị danh mục và cấu hình cửa hàng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <AntdRegistry>
          <AntdProvider>{children}</AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
