import { Suspense } from "react";
import Link from "next/link";
import { DEFAULT_HEADER_CTA_LABEL } from "@ecom/shared";
import { SafeImage } from "@/components/SafeImage";
import { SearchForm } from "@/components/SearchForm";
import type { NavCategory } from "@/lib/data";

type HeaderProps = {
  siteName: string;
  phone: string;
  searchPlaceholder?: string;
  logoUrl?: string;
  ctaLabel?: string;
  navCategories?: NavCategory[];
};

export function Header({
  siteName,
  phone,
  searchPlaceholder = "Tìm sản phẩm...",
  logoUrl = "",
  ctaLabel = DEFAULT_HEADER_CTA_LABEL,
  navCategories = [],
}: HeaderProps) {
  const tel = phone.replace(/\D/g, "");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="container-page flex items-center gap-2 py-2.5 sm:gap-4 sm:py-3">
          {logoUrl ? (
            <Link href="/" className="flex shrink-0 items-center">
              <SafeImage
                src={logoUrl}
                alt={siteName}
                width={500}
                height={200}
                priority
                className="h-9 w-auto object-contain sm:h-14"
              />
            </Link>
          ) : (
            <Link
              href="/"
              className="shrink-0 text-base font-extrabold tracking-tight text-gray-900 sm:text-xl"
            >
              {siteName}
            </Link>
          )}

          <Suspense
            fallback={
              <div className="h-10 min-w-0 flex-1 animate-pulse rounded-lg bg-gray-100 sm:h-11" />
            }
          >
            <SearchForm placeholder={searchPlaceholder} />
          </Suspense>

          <nav className="hidden shrink-0 sm:block" aria-label="Liên hệ">
            <a
              href={`tel:${tel}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-call px-3 py-1.5 text-white transition hover:bg-call-dark focus:outline-none focus:ring-2 focus:ring-call/40"
              aria-label={`${ctaLabel} ${phone}`}
            >
              <PhoneIcon className="h-5 w-5 shrink-0" />
              <span className="flex flex-col items-start leading-tight">
                <span className="whitespace-nowrap text-[11px] font-medium text-white/90">
                  {ctaLabel}
                </span>
                <span className="whitespace-nowrap text-base font-bold tracking-tight">
                  {phone}
                </span>
              </span>
            </a>
          </nav>
        </div>
      </header>

      <nav
        className="border-b border-gray-200 bg-white"
        aria-label="Danh mục chính"
      >
        <div className="container-page flex items-center gap-1 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:gap-x-2 sm:gap-y-1 sm:overflow-x-visible [&::-webkit-scrollbar]:hidden">
          <Link
            href="/san-pham"
            className="shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-[15px] font-bold text-gray-900 transition hover:bg-accent/10 hover:text-accent"
          >
            Tất cả sản phẩm
          </Link>
          {navCategories.map(({ category, children }) => (
            <div key={category.id} className="group relative shrink-0">
              <Link
                href={`/danh-muc/${category.slug}`}
                className="flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-[15px] font-semibold text-gray-700 transition hover:bg-accent/10 hover:text-accent group-focus-within:bg-accent/10 group-hover:bg-accent/10 group-hover:text-accent"
              >
                {category.name}
                {children.length ? (
                  <ChevronDownIcon className="h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform group-hover:rotate-180" />
                ) : null}
              </Link>

              {children.length ? (
                <div className="absolute left-0 top-full z-50 hidden min-w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl sm:group-focus-within:block sm:group-hover:block">
                  {children.map((child) => (
                    <Link
                      key={child.category.id}
                      href={`/danh-muc/${child.category.slug}`}
                      className="block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-accent/10 hover:text-accent"
                    >
                      {child.category.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          <Link
            href="/cam-nang"
            className="shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-[15px] font-bold text-accent transition hover:bg-accent/10"
          >
            Cẩm nang
          </Link>
        </div>
      </nav>
    </>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V21a1 1 0 01-1 1C10.4 22 2 13.6 2 3a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z" />
    </svg>
  );
}
