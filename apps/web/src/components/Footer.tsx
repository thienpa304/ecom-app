import Link from "next/link";
import type { SiteSettings } from "@ecom/shared";

export function Footer({ settings }: { settings: SiteSettings }) {
  const tel = settings.phone.replace(/\D/g, "");

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="container-page grid gap-6 py-10 sm:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold text-gray-900">
            {settings.siteName}
          </p>
          <p className="mt-2 text-sm text-gray-600">{settings.footerBlurb}</p>
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
                href={`tel:${tel}`}
                className="font-medium text-accent hover:underline"
              >
                {settings.phone}
              </a>
            </li>
            {settings.address ? <li>{settings.address}</li> : null}
            {settings.email ? (
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="font-medium text-accent hover:underline"
                >
                  {settings.email}
                </a>
              </li>
            ) : null}
            <li>
              <a
                href={settings.zaloUrl}
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
        © {new Date().getFullYear()} {settings.siteName}.
      </div>
    </footer>
  );
}
