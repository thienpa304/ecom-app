import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Không tìm thấy bài viết",
  robots: { index: false, follow: false },
};

export default function PostNotFound() {
  return (
    <div className="container-page py-20 text-center">
      <h1 className="text-2xl font-bold text-gray-900">
        Không tìm thấy bài viết
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Bài viết có thể đã được gỡ hoặc đường dẫn không đúng.
      </p>
      <Link href="/cam-nang" className="btn-primary mt-6 inline-flex">
        Xem tất cả cẩm nang
      </Link>
    </div>
  );
}
