"use client";

import Image from "next/image";
import type { ProductMedia } from "@ecom/shared";
import { galleryMedia, parseVideoUrl } from "@ecom/shared";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from "react";

type Props = {
  media: ProductMedia[];
  name: string;
};

const PLACEHOLDER = "/placeholder.svg";
const SWIPE_THRESHOLD = 48;

type Slide = {
  key: string;
  item: ProductMedia;
};

export function ProductGallery({ media, name }: Props) {
  const slides: Slide[] = useMemo(() => {
    const sorted = galleryMedia({ media });
    if (sorted.length === 0) {
      return [
        {
          key: "placeholder",
          item: {
            id: "placeholder",
            productId: "",
            kind: "image",
            url: PLACEHOLDER,
            alt: name,
            sortOrder: 0,
            storagePath: null,
            posterUrl: null,
          },
        },
      ];
    }
    return sorted.map((item) => ({ key: item.id, item }));
  }, [media, name]);

  const [active, setActive] = useState(0);
  const touchX = useRef<number | null>(null);
  const current = slides[active] ?? slides[0]!;
  const multi = slides.length > 1;
  const isVideo = current.item.kind === "video";

  const go = useCallback(
    (dir: -1 | 1) => {
      if (!multi) return;
      setActive((i) => (i + dir + slides.length) % slides.length);
    },
    [multi, slides.length],
  );

  useEffect(() => {
    if (!multi) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, multi]);

  function onTouchStart(e: TouchEvent) {
    if (isVideo) return;
    touchX.current = e.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: TouchEvent) {
    if (isVideo || touchX.current == null) return;
    const endX = e.changedTouches[0]?.clientX;
    if (endX == null) {
      touchX.current = null;
      return;
    }
    const dx = endX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (dx < 0) go(1);
    else go(-1);
  }

  return (
    <div className="min-w-0 space-y-3">
      <div
        className="relative aspect-[4/3] w-full max-w-full overflow-hidden rounded-lg border border-gray-200 bg-black/5"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <MediaSlide item={current.item} name={name} priority />

        {multi ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md ring-1 ring-black/5 transition hover:bg-white"
              aria-label="Ảnh trước"
            >
              <ChevronIcon className="h-5 w-5 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md ring-1 ring-black/5 transition hover:bg-white"
              aria-label="Ảnh sau"
            >
              <ChevronIcon className="h-5 w-5" />
            </button>
            <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white">
              {active + 1}/{slides.length}
            </span>
          </>
        ) : null}
      </div>

      {multi ? (
        <div
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-webkit-overflow-scrolling:touch]"
          role="list"
        >
          {slides.map((slide, idx) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => setActive(idx)}
              aria-label={
                slide.item.kind === "image"
                  ? `Ảnh ${idx + 1}`
                  : "Video sản phẩm"
              }
              aria-pressed={idx === active}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded border bg-white sm:h-16 sm:w-16 ${
                idx === active
                  ? "border-accent ring-1 ring-accent"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <MediaThumb item={slide.item} name={name} index={idx} />
            </button>
          ))}
        </div>
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
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function MediaSlide({
  item,
  name,
  priority = false,
}: {
  item: ProductMedia;
  name: string;
  priority?: boolean;
}) {
  if (item.kind === "image") {
    return (
      <Image
        key={item.id}
        src={item.url || PLACEHOLDER}
        alt={item.alt || name}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-contain bg-white p-2 sm:p-4"
        priority={priority}
        draggable={false}
      />
    );
  }

  const video = parseVideoUrl(item.url);
  if (video) {
    return <VideoPlayer video={video} title={name} />;
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white p-6 text-center">
      <p className="text-sm text-gray-600">Không nhúng được media này.</p>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-semibold text-accent underline"
      >
        Mở link
      </a>
    </div>
  );
}

function MediaThumb({
  item,
  name,
  index,
}: {
  item: ProductMedia;
  name: string;
  index: number;
}) {
  if (item.kind === "image") {
    return (
      <Image
        src={item.url || PLACEHOLDER}
        alt={item.alt || `${name} — ảnh ${index + 1}`}
        fill
        sizes="64px"
        className="object-contain p-1"
      />
    );
  }

  return (
    <span className="flex h-full w-full flex-col items-center justify-center gap-0.5 bg-slate-900 text-white">
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
        <path d="M8 5v14l11-7z" />
      </svg>
      <span className="text-[9px] font-semibold uppercase tracking-wide">
        Video
      </span>
    </span>
  );
}

function VideoPlayer({
  video,
  title,
}: {
  video: NonNullable<ReturnType<typeof parseVideoUrl>>;
  title: string;
}) {
  if (video.kind === "youtube" || video.kind === "tiktok") {
    return (
      <iframe
        key={video.embedUrl}
        src={video.embedUrl}
        title={`Video ${title}`}
        className="absolute inset-0 h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }

  if (video.kind === "file") {
    return (
      <video
        key={video.url}
        src={video.url}
        controls
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full bg-black object-contain"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white p-6 text-center">
      <p className="text-sm text-gray-600">Không nhúng được video này.</p>
      <a
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-semibold text-accent underline"
      >
        Mở video
      </a>
    </div>
  );
}
