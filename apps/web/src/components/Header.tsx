import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { DEFAULT_HEADER_CTA_LABEL, type Category } from "@ecom/shared";
import { CategoryMenu } from "@/components/CategoryMenu";
import { SearchForm } from "@/components/SearchForm";

type HeaderProps = {
  siteName: string;
  phone: string;
  searchPlaceholder?: string;
  logoUrl?: string;
  ctaLabel?: string;
  categories: Category[];
};

export function Header({
  siteName,
  phone,
  searchPlaceholder = "Tìm sản phẩm...",
  logoUrl = "",
  ctaLabel = DEFAULT_HEADER_CTA_LABEL,
  categories,
}: HeaderProps) {
  const tel = phone.replace(/\D/g, "");

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container-page flex flex-wrap items-center gap-x-2 gap-y-2 py-2.5 sm:gap-x-3 sm:py-3">
        {logoUrl ? (
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src={logoUrl}
              alt={siteName}
              width={360}
              height={88}
              className="h-9 w-auto object-contain sm:h-11"
            />
          </Link>
        ) : (
          <Link
            href="/"
            className="min-w-0 flex-1 truncate text-[15px] font-extrabold tracking-tight text-gray-900 sm:max-w-none sm:flex-none sm:text-xl"
          >
            {siteName}
          </Link>
        )}

        <Suspense
          fallback={
            <div className="h-10 w-11 shrink-0 animate-pulse rounded-lg bg-gray-100 sm:w-52" />
          }
        >
          <CategoryMenu categories={categories} />
        </Suspense>

        <Suspense
          fallback={
            <div className="order-last h-10 w-full basis-full animate-pulse rounded-full bg-gray-100 sm:order-none sm:mx-2 sm:h-11 sm:flex-1 sm:basis-auto sm:rounded-lg" />
          }
        >
          <SearchForm placeholder={searchPlaceholder} />
        </Suspense>

        <nav
          className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0"
          aria-label="Chính"
        >
          <a
            href={`tel:${tel}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white shadow-sm transition hover:bg-accent-dark sm:hidden"
            aria-label={`${ctaLabel} ${phone}`}
          >
            <PhoneIcon className="h-5 w-5" />
          </a>
          <a
            href={`tel:${tel}`}
            className="btn-primary hidden items-center gap-2 whitespace-nowrap text-sm sm:inline-flex"
          >
            <PhoneIcon className="h-4 w-4 shrink-0" />
            <span>
              {ctaLabel} {phone}
            </span>
          </a>
        </nav>
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
