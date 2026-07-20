import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="container-page py-20 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy sản phẩm</h1>
      <p className="mt-2 text-sm text-gray-600">
        Sản phẩm có thể đã ngừng bán hoặc đường dẫn không đúng.
      </p>
      <Link href="/san-pham" className="btn-primary mt-6 inline-flex">
        Quay lại danh mục
      </Link>
    </div>
  );
}
