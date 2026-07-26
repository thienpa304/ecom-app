"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { HERO_SLIDE_INTERVAL_MS, type HeroSlide } from "@ecom/shared";
import { SafeImage } from "@/components/SafeImage";

type Props = {
  slides: HeroSlide[];
  fallbackAlt: string;
};

export function HeroSlider({ slides, fallbackAlt }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const goTo = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (count < 2 || paused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const timer = window.setInterval(
      () => setIndex((i) => (i + 1) % count),
      HERO_SLIDE_INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [count, paused]);

  if (count === 0) return null;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Ảnh giới thiệu"
    >
      <div className="relative aspect-[16/10] w-full">
        {slides.map((slide, i) => {
          const active = i === index;
          const image = (
            <SafeImage
              src={slide.url}
              alt={slide.alt || fallbackAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority={i === 0}
            />
          );
          return (
            <div
              key={`${slide.url}-${i}`}
              className={`absolute inset-0 transition-opacity duration-700 ${
                active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-hidden={!active}
            >
              {slide.href ? (
                <Link
                  href={slide.href}
                  className="block h-full w-full"
                  tabIndex={active ? 0 : -1}
                >
                  {image}
                </Link>
              ) : (
                image
              )}
            </div>
          );
        })}
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Ảnh trước"
            className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent group-hover:flex sm:flex sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
          >
            <ChevronIcon className="h-5 w-5 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Ảnh kế tiếp"
            className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent group-hover:flex sm:flex sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
          >
            <ChevronIcon className="h-5 w-5" />
          </button>

          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={`dot-${slide.url}-${i}`}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Xem ảnh ${i + 1}`}
                aria-current={i === index}
                className={`h-2.5 rounded-full transition-all ${
                  i === index
                    ? "w-6 bg-accent"
                    : "w-2.5 bg-white/80 hover:bg-white"
                } shadow`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
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
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
