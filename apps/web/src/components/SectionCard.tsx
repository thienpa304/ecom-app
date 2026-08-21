import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  headingId?: string;
  action?: ReactNode;
  bodyClassName?: string;
  children: ReactNode;
};

/**
 * Khung chung cho các section dạng thẻ trắng ở trang sản phẩm.
 * Không tự set margin — khoảng cách do container cha (space-y-*) quyết định.
 */
export function SectionCard({
  title,
  headingId,
  action,
  bodyClassName = "min-w-0 px-4 py-4",
  children,
}: Props) {
  return (
    <section
      {...(headingId ? { "aria-labelledby": headingId } : {})}
      className="min-w-0 rounded-lg border border-gray-200 bg-white"
    >
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <h2
          {...(headingId ? { id: headingId } : {})}
          className="min-w-0 break-words text-base font-bold uppercase text-gray-900"
        >
          {title}
        </h2>
        {action}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function SectionCardLink({
  href,
  label = "Xem tất cả",
}: {
  href: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center rounded-md px-2 py-1 text-sm font-semibold text-accent transition hover:bg-orange-50 hover:underline"
    >
      {label} →
    </Link>
  );
}
