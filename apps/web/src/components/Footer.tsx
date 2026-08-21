import Link from "next/link";
import type { Brand, Category, SiteSettings } from "@ecom/shared";
import { SafeImage } from "@/components/SafeImage";
import { getBrands, getCategories, listPolicyPages } from "@/lib/data";

const KEYWORD_CATEGORY_LIMIT = 6;
const KEYWORD_BRAND_LIMIT = 5;
const KEYWORD_COMBO_LIMIT = 5;

type SearchKeyword = {
  label: string;
  href: string;
};

function buildSearchKeywords(
  categories: Category[],
  brands: Brand[],
): SearchKeyword[] {
  const comboCategories = categories.slice(0, KEYWORD_CATEGORY_LIMIT);
  const comboBrands = brands.slice(0, KEYWORD_BRAND_LIMIT);
  const comboCount = Math.min(
    KEYWORD_COMBO_LIMIT,
    comboCategories.length * comboBrands.length,
  );

  const combos = Array.from({ length: comboCount }, (_, i) => {
    const category = comboCategories[i % comboCategories.length];
    const brand = comboBrands[i % comboBrands.length];
    return {
      label: `${category.name} ${brand.name}`,
      href: `/danh-muc/${category.slug}`,
    };
  });

  const candidates: SearchKeyword[] = [
    ...comboCategories.map((category) => ({
      label: category.name,
      href: `/danh-muc/${category.slug}`,
    })),
    ...comboBrands.map((brand) => ({
      label: brand.name,
      href: `/thuong-hieu/${brand.slug}`,
    })),
    ...combos,
  ];

  const seen = new Set<string>();
  return candidates.filter((keyword) => {
    const key = keyword.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function Footer({ settings }: { settings: SiteSettings }) {
  const tel = settings.phone.replace(/\D/g, "");
  const [allBrands, allCategories, policyPages] = await Promise.all([
    getBrands(),
    getCategories(),
    listPolicyPages(),
  ]);

  const brands = [...allBrands].sort((a, b) =>
    a.name.localeCompare(b.name, "vi"),
  );

  const categories = allCategories
    .filter((category) => category.parentId === null)
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "vi"),
    );

  const searchKeywords = buildSearchKeywords(categories, brands);

  const socials = [
    {
      key: "facebook",
      label: "Facebook",
      href: settings.facebookUrl,
      bg: "#1877F2",
      Icon: FacebookIcon,
    },
    {
      key: "youtube",
      label: "YouTube",
      href: settings.youtubeUrl,
      bg: "#FF0000",
      Icon: YoutubeIcon,
    },
    {
      key: "tiktok",
      label: "TikTok",
      href: settings.tiktokUrl,
      bg: "#000000",
      Icon: TiktokIcon,
    },
    {
      key: "zalo",
      label: "Zalo",
      href: settings.zaloUrl,
      bg: "#0068FF",
      Icon: ZaloGlyphIcon,
    },
  ].filter((item) => Boolean(item.href));

  const hasFanpage = Boolean(settings.fanpageEmbedUrl);
  const hasMap = Boolean(settings.mapEmbedUrl);
  const hasEmbeds = hasFanpage || hasMap;

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div
        className={`container-page grid gap-6 py-7 sm:grid-cols-2 ${
          hasEmbeds ? "lg:grid-cols-5" : "lg:grid-cols-4"
        }`}
      >
        <div>
          {settings.logoSquareUrl ? (
            <SafeImage
              src={settings.logoSquareUrl}
              alt={settings.siteName}
              width={96}
              height={96}
              className="h-20 w-20 object-contain"
            />
          ) : null}
          <p className="mt-3 text-lg font-extrabold text-gray-900">
            {settings.siteName}
          </p>
          {settings.footerBlurb ? (
            <p className="mt-2 text-sm text-gray-600">{settings.footerBlurb}</p>
          ) : null}

          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            {settings.address ? (
              <li className="flex items-start gap-2">
                <LocationIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent/70" />
                <span className="break-words">{settings.address}</span>
              </li>
            ) : null}
            {settings.phone ? (
              <li className="flex items-start gap-2">
                <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent/70" />
                <a
                  href={`tel:${tel}`}
                  className="font-bold text-accent hover:underline"
                >
                  {settings.phone}
                </a>
              </li>
            ) : null}
            {settings.email ? (
              <li className="flex items-start gap-2">
                <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent/70" />
                <a
                  href={`mailto:${settings.email}`}
                  className="break-all hover:text-accent hover:underline"
                >
                  {settings.email}
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        {categories.length > 0 ? (
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">
              Danh mục sản phẩm
            </p>
            <ul className="mt-2 space-y-1 text-sm leading-6 text-gray-600">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/danh-muc/${category.slug}`}
                    className="break-words hover:text-accent"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {policyPages.length > 0 ? (
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">
              Hỗ trợ khách hàng
            </p>
            <ul className="mt-2 space-y-1 text-sm leading-6 text-gray-600">
              {policyPages.map((page) => (
                <li key={page.id}>
                  <Link
                    href={`/chinh-sach/${page.slug}`}
                    className="break-words hover:text-accent"
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="min-w-0">
          {brands.length > 0 ? (
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-accent">
                Thương hiệu
              </p>
              <ul className="mt-2 space-y-1 text-sm leading-6 text-gray-600">
                {brands.map((brand) => (
                  <li key={brand.id}>
                    <Link
                      href={`/thuong-hieu/${brand.slug}`}
                      className="break-words hover:text-accent"
                    >
                      {brand.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {socials.length > 0 ? (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-900">
                Kết nối với chúng tôi
              </p>
              <div className="mt-3 flex w-fit flex-nowrap items-center gap-3">
                {socials.map(({ key, label, href, bg, Icon }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-sm transition hover:scale-110 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    style={{ backgroundColor: bg }}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6">
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
              <li>
                <Link href="/cam-nang" className="hover:text-accent">
                  Kiến thức &amp; Kinh nghiệm
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {hasEmbeds ? (
          <div className="space-y-4">
            {hasFanpage ? (
              <div>
                <p className="text-sm font-semibold text-gray-900">FANPAGE</p>
                <iframe
                  src={settings.fanpageEmbedUrl}
                  title="Fanpage Facebook"
                  width="100%"
                  height={200}
                  loading="lazy"
                  allow="encrypted-media"
                  style={{ border: 0 }}
                  className="mt-2 w-full overflow-hidden rounded-lg border border-gray-200"
                />
              </div>
            ) : null}
            {hasMap ? (
              <iframe
                src={settings.mapEmbedUrl}
                title="Bản đồ"
                width="100%"
                height={200}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0 }}
                className="w-full overflow-hidden rounded-lg border border-gray-200"
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {searchKeywords.length > 0 ? (
        <div className="border-t border-gray-100">
          <div className="container-page py-5">
            <p className="text-sm font-semibold text-gray-900">
              Mọi người cũng tìm kiếm
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {searchKeywords.map((keyword) => (
                <Link
                  key={keyword.label}
                  href={keyword.href}
                  className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-700 transition hover:bg-accent/10 hover:text-accent"
                >
                  {keyword.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} {settings.siteName}.
      </div>
    </footer>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" />
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

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4.24l-8 4.76-8-4.76V6l8 4.76L20 6v2.24z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.5 6.92a3.02 3.02 0 00-2.12-2.14C19.5 4.27 12 4.27 12 4.27s-7.5 0-9.38.51A3.02 3.02 0 00.5 6.92C0 8.81 0 12 0 12s0 3.19.5 5.08a3.02 3.02 0 002.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 002.12-2.14C24 15.19 24 12 24 12s0-3.19-.5-5.08zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
    </svg>
  );
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.6 5.82A4.28 4.28 0 0115.54 3h-3.09v12.4a2.59 2.59 0 01-2.59 2.5 2.59 2.59 0 01-2.6-2.58 2.59 2.59 0 013.19-2.52v-3.1a5.68 5.68 0 00-.6-.03A5.69 5.69 0 004.17 15.4 5.69 5.69 0 009.86 21a5.69 5.69 0 005.69-5.69V9.01a7.35 7.35 0 004.29 1.37V7.29a4.29 4.29 0 01-3.24-1.47z" />
    </svg>
  );
}

function ZaloGlyphIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.2 2 1.5 6.02 1.5 10.98c0 2.83 1.54 5.35 3.95 7l-.86 3.32a.4.4 0 00.58.45l3.9-2.08c.94.22 1.92.33 2.93.33 5.8 0 10.5-4.02 10.5-8.98S17.8 2 12 2zM7.2 8.02h4.02c.28 0 .5.23.5.5v.34c0 .12-.04.23-.11.32l-3.1 3.9h2.8c.27 0 .5.22.5.5v.36c0 .27-.23.5-.5.5H7.05a.5.5 0 01-.5-.5v-.35c0-.11.04-.22.11-.31l3.1-3.9h-2.6a.5.5 0 01-.5-.5v-.36c0-.27.22-.5.5-.5zm6.13 0c.28 0 .5.23.5.5v5.42c0 .28-.22.5-.5.5h-.35a.5.5 0 01-.5-.5V8.52c0-.27.22-.5.5-.5h.35zm3.36 1.5c1.4 0 2.53 1.13 2.53 2.52a2.53 2.53 0 01-2.53 2.53 2.53 2.53 0 01-2.52-2.53c0-1.39 1.13-2.52 2.52-2.52zm0 1.32c-.66 0-1.2.54-1.2 1.2 0 .67.54 1.21 1.2 1.21.67 0 1.21-.54 1.21-1.2 0-.67-.54-1.21-1.2-1.21z" />
    </svg>
  );
}
