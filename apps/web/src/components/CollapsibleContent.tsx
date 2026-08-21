"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronDownIcon } from "@/components/AccordionItem";

/** Chiều cao tối đa khi thu gọn (px). */
const COLLAPSED_MAX_PX = 520;
/** Content chỉ dài hơn ngưỡng này mới đáng hiện nút "Xem thêm". */
const OVERFLOW_TOLERANCE_PX = 80;

type Props = {
  children: ReactNode;
};

/**
 * Thu gọn nội dung dài kèm nút "Xem thêm" (kiểu CellphoneS).
 *
 * Render lần đầu ở trạng thái thu gọn để tránh nhảy layout; sau khi đo được
 * chiều cao thật, nếu nội dung đủ ngắn thì bỏ luôn giới hạn và ẩn nút.
 */
export function CollapsibleContent({ children }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [needsToggle, setNeedsToggle] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    // Đo trên node bên trong (không bị clamp) nên scrollHeight luôn là chiều
    // cao thật, kể cả khi ảnh trong mô tả tải xong muộn.
    const measure = () => {
      setNeedsToggle(
        node.scrollHeight > COLLAPSED_MAX_PX + OVERFLOW_TOLERANCE_PX,
      );
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const isCollapsed = needsToggle && !isExpanded;

  return (
    <div className="min-w-0">
      <div
        className="relative min-w-0 overflow-hidden"
        style={isCollapsed ? { maxHeight: COLLAPSED_MAX_PX } : undefined}
      >
        <div ref={contentRef} className="min-w-0">
          {children}
        </div>
        {isCollapsed && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/85 to-transparent"
          />
        )}
      </div>

      {needsToggle && (
        <div className="mt-3 flex justify-center border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            aria-expanded={isExpanded}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-accent transition hover:bg-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {isExpanded ? "Thu gọn" : "Xem thêm"}
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      )}
    </div>
  );
}
