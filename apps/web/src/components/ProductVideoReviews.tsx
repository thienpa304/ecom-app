import {
  parseVideoUrl,
  type ProductMedia,
  type VideoSource,
} from "@ecom/shared";
import { SectionCard } from "@/components/SectionCard";

type VideoEntry = {
  id: string;
  label: string;
  caption: string;
  source: VideoSource;
};

function httpUrl(raw: string): string | null {
  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return raw;
    }
  } catch {
    return null;
  }
  return null;
}

export function ProductVideoReviews({
  videos,
  productName,
}: {
  videos: ProductMedia[];
  productName: string;
}) {
  const entries: VideoEntry[] = videos.flatMap((item) => {
    const source = parseVideoUrl(item.url);
    if (!source) return [];
    const caption = item.alt.trim();
    return [{ id: item.id, label: caption || productName, caption, source }];
  });

  if (entries.length === 0) return null;

  return (
    <SectionCard
      title="Video review về sản phẩm này"
      headingId="product-video-reviews-heading"
      bodyClassName="min-w-0 space-y-4 px-4 py-4"
    >
      {entries.map((entry) => (
        <figure key={entry.id} className="min-w-0">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
            <ProductVideoFrame entry={entry} />
          </div>
          {entry.caption ? (
            <figcaption className="mt-2 break-words text-xs leading-relaxed text-gray-600">
              {entry.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </SectionCard>
  );
}

function ProductVideoFrame({ entry }: { entry: VideoEntry }) {
  const { source, label } = entry;

  if (source.kind === "youtube" || source.kind === "tiktok") {
    return (
      <iframe
        src={source.embedUrl}
        title={`Video ${label}`}
        className="absolute inset-0 h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }

  if (source.kind === "file") {
    return (
      <video
        src={source.url}
        controls
        playsInline
        preload="metadata"
        title={label}
        className="absolute inset-0 h-full w-full bg-black object-contain"
      />
    );
  }

  const externalUrl = httpUrl(source.url);
  if (!externalUrl) {
    return (
      <p className="absolute inset-0 flex items-center justify-center bg-white p-4 text-center text-sm text-gray-600">
        Không nhúng được video này.
      </p>
    );
  }

  return (
    <a
      href={externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="absolute inset-0 flex items-center justify-center bg-white p-4 text-center text-sm font-semibold text-accent underline transition hover:bg-orange-50"
    >
      Xem video trên trang gốc
    </a>
  );
}
