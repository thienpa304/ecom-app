"use client";

import Image from "next/image";
import type { ProductImage } from "@ecom/shared";
import { parseVideoUrl } from "@ecom/shared";
import { useMemo, useState } from "react";

type Props = {
  images: ProductImage[];
  name: string;
  videoUrl?: string | null;
};

const PLACEHOLDER = "/placeholder.svg";

type Slide =
  | { kind: "video"; key: string }
  | { kind: "image"; key: string; image: ProductImage };

export function ProductGallery({ images, name, videoUrl }: Props) {
  const video = useMemo(() => parseVideoUrl(videoUrl), [videoUrl]);

  const slides: Slide[] = useMemo(() => {
    const list: Slide[] = [];
    if (video) {
      list.push({ kind: "video", key: "video" });
    }
    const imgs =
      images.length > 0
        ? images
        : video
          ? []
          : [
              {
                id: "placeholder",
                productId: "",
                url: PLACEHOLDER,
                alt: name,
                sortOrder: 0,
              },
            ];
    for (const image of imgs) {
      list.push({ kind: "image", key: image.id, image });
    }
    return list;
  }, [images, name, video]);

  const [active, setActive] = useState(0);
  const current = slides[active] ?? slides[0];

  if (!current) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 bg-white">
        <Image
          src={PLACEHOLDER}
          alt={name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-4"
          priority
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 bg-black/5">
        {current.kind === "video" && video ? (
          <VideoPlayer video={video} title={name} />
        ) : current.kind === "image" ? (
          <Image
            key={current.key}
            src={current.image.url || PLACEHOLDER}
            alt={current.image.alt || name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain bg-white p-4"
            priority
          />
        ) : null}
      </div>

      {slides.length > 1 && (
        <div className="flex gap-2 overflow-x-auto" role="list">
          {slides.map((slide, idx) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => setActive(idx)}
              aria-label={
                slide.kind === "video" ? "Video sản phẩm" : `Ảnh ${idx + 1}`
              }
              aria-pressed={idx === active}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded border bg-white ${
                idx === active
                  ? "border-accent ring-1 ring-accent"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              {slide.kind === "video" ? (
                <span className="flex h-full w-full flex-col items-center justify-center gap-0.5 bg-slate-900 text-white">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 fill-current"
                    aria-hidden
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="text-[9px] font-semibold uppercase tracking-wide">
                    Video
                  </span>
                </span>
              ) : (
                <Image
                  src={slide.image.url || PLACEHOLDER}
                  alt={slide.image.alt || `${name} — ảnh ${idx + 1}`}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
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
