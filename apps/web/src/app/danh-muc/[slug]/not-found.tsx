import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Không tìm thấy danh mục",
  robots: { index: false, follow: false },
};

export default function CategoryNotFound() {
  return (
    <div className="container-page py-20 text-center">
      <h1 className="text-2xl font-bold text-gray-900">
        Không tìm thấy danh mục
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Danh mục có thể đã được đổi tên hoặc đường dẫn không đúng.
      </p>
      <Link href="/san-pham" className="btn-primary mt-6 inline-flex">
        Xem tất cả sản phẩm
      </Link>
    </div>
  );
}
