"use client";

import { useState } from "react";
import { parseVideoUrl, type ProductMedia } from "@ecom/shared";
import { SafeImage } from "@/components/SafeImage";

const SHORTS_PATH = /\/shorts\//i;
const EMBED_PERMISSIONS =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
const POSTER_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 30vw";

type Props = {
  media: ProductMedia;
  label: string;
  fallbackPoster?: string;
};

function isSafeExternalUrl(url: string) {
  return /^https?:\/\//i.test(url.trim());
}

export function VideoEmbedCard({ media, label, fallbackPoster }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const source = parseVideoUrl(media.url);

  if (!source || source.kind === "unknown") {
    if (!source || !isSafeExternalUrl(source.originalUrl)) return null;

    return (
      <a
        href={source.originalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[6rem] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-4 text-center text-sm font-semibold text-accent transition hover:border-accent/40 hover:bg-accent/5"
      >
        Mở video trong tab mới
      </a>
    );
  }

  const isVertical =
    source.kind === "tiktok" || SHORTS_PATH.test(source.originalUrl);
  const wrapperClass = isVertical ? "mx-auto w-full max-w-[15rem]" : "w-full";
  const frameClass = `relative w-full overflow-hidden rounded-xl bg-gray-900 ring-1 ring-gray-900/10 ${
    isVertical ? "aspect-[9/16]" : "aspect-video"
  }`;
  const caption = media.alt?.trim() || label;

  const poster =
    media.posterUrl ||
    (source.kind === "youtube"
      ? `https://i.ytimg.com/vi/${source.id}/hqdefault.jpg`
      : undefined) ||
    fallbackPoster;

  if (source.kind === "file") {
    return (
      <figure className={wrapperClass}>
        <div className={frameClass}>
          <video
            src={source.url}
            poster={poster}
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
        <figcaption className="mt-2 line-clamp-2 text-xs leading-snug text-gray-500">
          {caption}
        </figcaption>
      </figure>
    );
  }

  const embedSrc =
    source.kind === "youtube"
      ? `${source.embedUrl}?autoplay=1&rel=0`
      : source.embedUrl;

  return (
    <figure className={wrapperClass}>
      <div className={frameClass}>
        {isPlaying ? (
          <iframe
            src={embedSrc}
            title={caption}
            className="absolute inset-0 h-full w-full border-0"
            allow={EMBED_PERMISSIONS}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label={`Phát ${caption}`}
            className="group absolute inset-0 h-full w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            <SafeImage
              src={poster}
              alt={caption}
              fill
              sizes={POSTER_SIZES}
              className="object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/55 text-white ring-2 ring-white/70 transition group-hover:bg-accent">
                <svg
                  className="ml-0.5 h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M8 5.5v13l11-6.5z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-2 line-clamp-2 text-xs leading-snug text-gray-500">
        {caption}
      </figcaption>
    </figure>
  );
}
