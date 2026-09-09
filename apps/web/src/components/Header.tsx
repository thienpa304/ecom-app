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
  youtubeUrl?: string;
};

type QuickNavLink = {
  label: string;
  href: string;
  isPlainAnchor?: boolean;
  opensInNewTab?: boolean;
};

const QUICK_NAV_LINK_CLASS =
  "shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-accent/10 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50";

export function Header({
  siteName,
  phone,
  searchPlaceholder = "Tìm sản phẩm...",
  logoUrl = "",
  ctaLabel = DEFAULT_HEADER_CTA_LABEL,
  navCategories = [],
  youtubeUrl = "",
}: HeaderProps) {
  const tel = phone.replace(/\D/g, "");
  const trimmedYoutubeUrl = youtubeUrl.trim();

  const quickNavLinks: QuickNavLink[] = [
    { label: "Video review sản phẩm", href: "/video-review-san-pham" },
    { label: "Tin tức & Kiến thức", href: "/cam-nang" },
    { label: "Phụ Tùng & Linh Kiện", href: "/danh-muc/phu-tung-va-linh-kien" },
    { label: "Liên hệ chúng tôi", href: `tel:${tel}`, isPlainAnchor: true },
    ...(trimmedYoutubeUrl
      ? [
          {
            label: "YouTube",
            href: trimmedYoutubeUrl,
            isPlainAnchor: true,
            opensInNewTab: true,
          },
        ]
      : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="container-page flex items-center gap-2 py-2 sm:gap-4 sm:py-2.5">
          {logoUrl ? (
            <Link href="/" className="flex shrink-0 items-center">
              <SafeImage
                src={logoUrl}
                alt={siteName}
                width={500}
                height={200}
                priority
                className="h-8 w-auto object-contain sm:h-11"
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
              <div className="h-9 min-w-0 flex-1 animate-pulse rounded-lg bg-gray-100 sm:h-10" />
            }
          >
            <SearchForm placeholder={searchPlaceholder} />
          </Suspense>

          <nav className="hidden shrink-0 sm:block" aria-label="Liên hệ">
            <a
              href={`tel:${tel}`}
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-call px-3 py-1 text-white transition hover:bg-call-dark focus:outline-none focus:ring-2 focus:ring-call/40"
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
        <div className="container-page flex items-center gap-0.5 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-x-1.5 lg:overflow-x-visible [&::-webkit-scrollbar]:hidden">
          <div className="group relative shrink-0">
            <Link
              href="/san-pham"
              aria-label="Tất cả sản phẩm, mở danh sách danh mục"
              aria-haspopup="true"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-bold text-gray-900 transition hover:bg-accent/10 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 group-focus-within:bg-accent/10 group-focus-within:text-accent group-hover:bg-accent/10 group-hover:text-accent"
            >
              <HamburgerIcon className="h-4 w-4 shrink-0" />
              Tất cả sản phẩm
            </Link>

            {navCategories.length ? (
              <div className="absolute left-0 top-full z-50 hidden w-[min(60rem,calc(100vw-1.5rem))] gap-x-6 gap-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xl lg:grid-cols-4 lg:group-focus-within:grid lg:group-hover:grid">
                {navCategories.map(({ category, children }) => (
                  <div key={category.id} className="min-w-0">
                    <Link
                      href={`/danh-muc/${category.slug}`}
                      className="block rounded-lg px-2 py-1 text-sm font-bold text-gray-900 transition hover:bg-accent/10 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                    >
                      {category.name}
                    </Link>
                    {children.length ? (
                      <ul className="mt-0.5 space-y-0.5">
                        {children.map((child) => (
                          <li key={child.category.id}>
                            <Link
                              href={`/danh-muc/${child.category.slug}`}
                              className="block rounded-lg px-2 py-1 text-sm font-medium text-gray-600 transition hover:bg-accent/10 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                            >
                              {child.category.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {quickNavLinks.map((item) =>
            item.isPlainAnchor ? (
              <a
                key={item.label}
                href={item.href}
                className={QUICK_NAV_LINK_CLASS}
                {...(item.opensInNewTab
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={QUICK_NAV_LINK_CLASS}
              >
                {item.label}
              </Link>
            ),
          )}
        </div>
      </nav>
    </>
  );
}

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
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
