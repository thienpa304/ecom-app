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

  return (
    <nav
      className="mt-6 flex items-center justify-center gap-1"
      aria-label="Phân trang"
    >
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={`rounded-md border px-3 py-1.5 text-sm ${
          page <= 1
            ? "pointer-events-none border-gray-100 text-gray-300"
            : "border-gray-300 bg-white text-gray-700 hover:border-accent hover:text-accent"
        }`}
      >
        Trước
      </Link>
      {withEllipsis.map((p, idx) =>
        p === "…" ? (
          <span key={`e-${idx}`} className="px-2 text-gray-400">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              p === page
                ? "border-accent bg-accent text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-accent hover:text-accent"
            }`}
          >
            {p}
          </Link>
        ),
      )}
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={`rounded-md border px-3 py-1.5 text-sm ${
          page >= totalPages
            ? "pointer-events-none border-gray-100 text-gray-300"
            : "border-gray-300 bg-white text-gray-700 hover:border-accent hover:text-accent"
        }`}
      >
        Sau
      </Link>
    </nav>
  );
}
