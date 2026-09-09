"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const SCROLL_EPSILON_PX = 2;

const ARROW_CLASSES =
  "hidden h-10 w-10 shrink-0 items-center justify-center self-center rounded-full border border-gray-200 bg-white text-brand shadow-sm transition hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white sm:flex";

export function ScrollRow({ children }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(true);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const syncScrollState = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
    setIsScrollable(maxScrollLeft > SCROLL_EPSILON_PX);
    setCanScrollPrev(scroller.scrollLeft > SCROLL_EPSILON_PX);
    setCanScrollNext(scroller.scrollLeft < maxScrollLeft - SCROLL_EPSILON_PX);
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    syncScrollState();

    const observer = new ResizeObserver(syncScrollState);
    observer.observe(scroller);
    for (const child of Array.from(scroller.children)) {
      observer.observe(child);
    }
    return () => observer.disconnect();
  }, [syncScrollState]);

  const scrollByOneCard = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const firstCard = scroller.firstElementChild;
    const gap = Number.parseFloat(
      window.getComputedStyle(scroller).columnGap,
    );
    const cardWidth = firstCard
      ? firstCard.getBoundingClientRect().width +
        (Number.isFinite(gap) ? gap : 0)
      : scroller.clientWidth;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    scroller.scrollBy({
      left: cardWidth * direction,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <div className="flex items-stretch gap-2">
      {isScrollable ? (
        <button
          type="button"
          onClick={() => scrollByOneCard(-1)}
          disabled={!canScrollPrev}
          aria-label="Xem các sản phẩm trước đó"
          className={ARROW_CLASSES}
        >
          <ChevronIcon direction="prev" />
        </button>
      ) : null}

      <div
        ref={scrollerRef}
        onScroll={syncScrollState}
        className="flex min-w-0 flex-1 snap-x snap-mandatory gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-3 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {isScrollable ? (
        <button
          type="button"
          onClick={() => scrollByOneCard(1)}
          disabled={!canScrollNext}
          aria-label="Xem các sản phẩm tiếp theo"
          className={ARROW_CLASSES}
        >
          <ChevronIcon direction="next" />
        </button>
      ) : null}
    </div>
  );
}

function ChevronIcon({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={direction === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}
