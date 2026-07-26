import Link from "next/link";
import {
  imageMedia,
  parseVideoUrl,
  videoMedia,
  type ProductMedia,
  type Product,
} from "@ecom/shared";
import { SafeImage } from "@/components/SafeImage";

function posterFor(product: Product, video: ProductMedia | undefined) {
  if (video?.posterUrl) return video.posterUrl;

  const source = parseVideoUrl(video?.url);
  if (source?.kind === "youtube") {
    return `https://i.ytimg.com/vi/${source.id}/hqdefault.jpg`;
  }
  return imageMedia(product)[0]?.url;
}

export function VideoReviewSection({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
      {products.map((product) => {
        const video = videoMedia(product)[0];
        const poster = posterFor(product, video);

        return (
          <Link
            key={product.id}
            href={`/san-pham/${product.slug}`}
            className="group w-[70%] min-w-[13rem] shrink-0 snap-start overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:w-auto sm:min-w-0"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-gray-900">
              <SafeImage
                src={poster}
                alt={video?.alt || product.name}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white ring-2 ring-white/70 transition group-hover:bg-accent">
                  <PlayIcon className="ml-0.5 h-5 w-5" />
                </span>
              </span>
            </div>
            <p className="line-clamp-2 p-3 text-sm font-semibold leading-snug text-gray-900 transition group-hover:text-accent">
              {product.name}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13l11-6.5z" />
    </svg>
  );
}
