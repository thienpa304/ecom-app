import Link from "next/link";

export type Crumb = {
  name: string;
  path?: string;
};

/** Số cấp tối đa hiển thị trước khi rút gọn phần giữa thành "…". */
const MAX_VISIBLE = 3;

type Item = Crumb | "ellipsis";

/**
 * Giữ cấp đầu và {MAX_VISIBLE - 1} cấp cuối, phần giữa gom thành "…".
 * Chỉ ảnh hưởng phần hiển thị — JSON-LD vẫn dùng danh sách đầy đủ.
 */
function collapse(items: Crumb[]): Item[] {
  if (items.length <= MAX_VISIBLE) return items;
  return [items[0], "ellipsis", ...items.slice(-(MAX_VISIBLE - 1))];
}

/**
 * Breadcrumb một dòng, ẩn trên mobile (theo yêu cầu bản trên điện thoại).
 */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null;

  const visible = collapse(items);

  return (
    <nav
      className="mb-2.5 hidden min-w-0 items-center gap-x-1.5 overflow-hidden whitespace-nowrap text-xs text-gray-500 sm:flex"
      aria-label="Breadcrumb"
    >
      {visible.map((item, index) => {
        const isLast = index === visible.length - 1;

        return (
          <span
            key={
              item === "ellipsis" ? `ellipsis-${index}` : `${item.name}-${index}`
            }
            className={
              isLast
                ? "flex min-w-0 items-center gap-x-1.5"
                : "flex shrink-0 items-center gap-x-1.5"
            }
          >
            {index > 0 && <span aria-hidden>/</span>}
            {item === "ellipsis" ? (
              <span aria-hidden>…</span>
            ) : item.path && !isLast ? (
              <Link href={item.path} className="hover:text-accent">
                {item.name}
              </Link>
            ) : (
              <span className="min-w-0 truncate text-gray-800">{item.name}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
