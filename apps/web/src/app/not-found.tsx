import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="container-page py-20 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy trang</h1>
      <p className="mt-2 text-sm text-gray-600">
        Đường dẫn không tồn tại hoặc đã bị gỡ bỏ.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-outline inline-flex">
          Về trang chủ
        </Link>
        <Link href="/san-pham" className="btn-primary inline-flex">
          Xem sản phẩm
        </Link>
      </div>
    </div>
  );
}
