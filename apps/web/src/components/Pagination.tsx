import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  /** Current query string without leading `?` (e.g. brand=x&sort=y). */
  queryString?: string;
};

export function Pagination({ page, totalPages, queryString = "" }: Props) {
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams(queryString);
    params.set("page", String(p));
    return `/san-pham?${params.toString()}`;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  const withEllipsis: (number | "…")[] = [];
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i]! - pages[i - 1]! > 1) withEllipsis.push("…");
    withEllipsis.push(pages[i]!);
  }

  const btnBase =
    "inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm";

  return (
    <nav
      className="mt-6 flex flex-wrap items-center justify-center gap-1.5"
      aria-label="Phân trang"
    >
      {page <= 1 ? (
        <span
          className={`${btnBase} pointer-events-none border-gray-100 text-gray-300`}
          aria-disabled="true"
        >
          Trước
        </span>
      ) : (
        <Link
          href={hrefFor(page - 1)}
          className={`${btnBase} border-gray-300 bg-white text-gray-700 hover:border-accent hover:text-accent`}
        >
          Trước
        </Link>
      )}
      {withEllipsis.map((p, idx) =>
        p === "…" ? (
          <span key={`e-${idx}`} className="px-2 text-gray-400">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${btnBase} ${
              p === page
                ? "border-accent bg-accent text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-accent hover:text-accent"
            }`}
          >
            {p}
          </Link>
        ),
      )}
      {page >= totalPages ? (
        <span
          className={`${btnBase} pointer-events-none border-gray-100 text-gray-300`}
          aria-disabled="true"
        >
          Sau
        </span>
      ) : (
        <Link
          href={hrefFor(page + 1)}
          className={`${btnBase} border-gray-300 bg-white text-gray-700 hover:border-accent hover:text-accent`}
        >
          Sau
        </Link>
      )}
    </nav>
  );
}
