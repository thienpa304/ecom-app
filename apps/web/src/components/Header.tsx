import { Suspense } from "react";
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
      <div className="container-page flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 sm:gap-4 sm:py-3">
        <Link
          href="/"
          className="min-w-0 flex-1 truncate text-[15px] font-extrabold tracking-tight text-gray-900 sm:max-w-none sm:flex-none sm:text-xl"
        >
          {siteName}
        </Link>

        <nav
          className="flex shrink-0 items-center gap-2 sm:ml-auto sm:gap-3"
          aria-label="Chính"
        >
          <Link
            href="/san-pham"
            className="hidden text-sm font-medium text-gray-700 hover:text-accent sm:inline"
          >
            Sản phẩm
          </Link>
          <a
            href={`tel:${tel}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white shadow-sm transition hover:bg-accent-dark sm:hidden"
            aria-label={`Gọi ${phone}`}
          >
            <PhoneIcon className="h-5 w-5" />
          </a>
          <a
            href={`tel:${tel}`}
            className="btn-primary hidden whitespace-nowrap text-sm sm:inline-flex"
          >
            Gọi {phone}
          </a>
        </nav>

        <Suspense
          fallback={
            <div className="order-last h-10 w-full basis-full animate-pulse rounded-full bg-gray-100 sm:order-none sm:mx-2 sm:h-11 sm:flex-1 sm:basis-auto sm:rounded-lg" />
          }
        >
          <SearchForm placeholder={searchPlaceholder} />
        </Suspense>
      </div>
    </header>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V21a1 1 0 01-1 1C10.4 22 2 13.6 2 3a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z" />
    </svg>
  );
}
