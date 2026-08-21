import type { ReactNode } from "react";

type Props = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

/**
 * Một dòng accordion dùng `<details>` gốc — không cần JS.
 * Dùng chung cho Chính sách mua hàng và Câu hỏi thường gặp.
 */
export function AccordionItem({ title, defaultOpen = false, children }: Props) {
  return (
    <details className="group min-w-0" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 text-sm font-semibold text-gray-900 transition hover:text-accent">
        <span className="min-w-0 break-words">{title}</span>
        <ChevronDownIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="min-w-0 px-4 pb-4">{children}</div>
    </details>
  );
}

export function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
