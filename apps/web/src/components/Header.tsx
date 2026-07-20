import Link from "next/link";
import { SearchForm } from "@/components/SearchForm";

type HeaderProps = {
  siteName: string;
  phone: string;
  searchPlaceholder?: string;
};

export function Header({
  siteName,
  phone,
  searchPlaceholder = "Tìm sản phẩm...",
}: HeaderProps) {
  const tel = phone.replace(/\D/g, "");

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container-page flex flex-wrap items-center gap-3 py-3 sm:gap-4">
        <Link
          href="/"
          className="max-w-[12rem] text-base font-extrabold leading-tight tracking-tight text-gray-900 sm:max-w-none sm:text-xl"
        >
          {siteName}
        </Link>

        <SearchForm placeholder={searchPlaceholder} />

        <nav className="ml-auto flex items-center gap-2 sm:gap-3" aria-label="Chính">
          <Link
            href="/san-pham"
            className="hidden text-sm font-medium text-gray-700 hover:text-accent sm:inline"
          >
            Sản phẩm
          </Link>
          <a
            href={`tel:${tel}`}
            className="btn-primary whitespace-nowrap text-xs sm:text-sm"
          >
            Gọi {phone}
          </a>
        </nav>
      </div>
    </header>
  );
}
