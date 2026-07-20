"use client";

import Image from "next/image";
import type { ProductMedia } from "@ecom/shared";
import { galleryMedia, parseVideoUrl } from "@ecom/shared";
import { useMemo, useState } from "react";

type Props = {
  media: ProductMedia[];
  name: string;
};

const PLACEHOLDER = "/placeholder.svg";

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
  const current = slides[active] ?? slides[0]!;

  return (
    <div className="min-w-0 space-y-3">
      <div className="relative aspect-[4/3] w-full max-w-full overflow-hidden rounded-lg border border-gray-200 bg-black/5">
        <MediaSlide item={current.item} name={name} priority />
      </div>

      {slides.length > 1 && (
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
      )}
    </div>
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
      >
        <track kind="captions" />
      </video>
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
