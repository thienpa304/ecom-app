import Link from "next/link";

const phone = process.env.NEXT_PUBLIC_STORE_PHONE ?? "02839756686";
const zalo = process.env.NEXT_PUBLIC_ZALO_OA ?? "https://zalo.me/";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="container-page grid gap-6 py-10 sm:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold text-gray-900">
            Ecom <span className="text-accent">Demo</span>
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Cửa hàng thiết bị vệ sinh công nghiệp — catalog demo, không thanh
            toán online.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Liên kết</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-accent">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/san-pham" className="hover:text-accent">
                Danh mục sản phẩm
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Liên hệ</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>
              Hotline:{" "}
              <a
                href={`tel:${phone.replace(/\D/g, "")}`}
                className="font-medium text-accent hover:underline"
              >
                {phone}
              </a>
            </li>
            <li>
              <a
                href={zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent hover:underline"
              >
                Chat Zalo
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Ecom Demo. Chỉ dùng cho mục đích demo.
      </div>
    </footer>
  );
}
