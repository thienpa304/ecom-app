"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export const IMAGE_PLACEHOLDER = "/placeholder.svg";

function hostOf(url: string | undefined): string | null {
  if (!url) return null;
  return url.replace(/^https?:\/\//, "").split("/")[0] || null;
}

/**
 * Hosts handed straight to the browser instead of routing through
 * /_next/image. Both are CDN-backed and hold correctly sized originals, and
 * optimizing them exhausted the Vercel Image Optimization quota (402) before.
 *
 * Supabase stays listed until every stored URL has been repointed to R2 —
 * see scripts/rewrite-media-urls.mjs.
 */
const RAW_MEDIA_HOSTS = [
  hostOf(process.env.NEXT_PUBLIC_SUPABASE_URL),
  hostOf(process.env.NEXT_PUBLIC_MEDIA_BASE_URL) ?? "img.dienmaylocphatdat.vn",
].filter((host): host is string => Boolean(host));

type Props = Omit<ImageProps, "src" | "onError"> & {
  src: string | null | undefined;
};

export function SafeImage({ src, alt, ...rest }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const broken = !src || src === failedSrc;
  const isRawMedia = Boolean(
    !broken && RAW_MEDIA_HOSTS.some((host) => src.includes(host)),
  );

  return (
    <Image
      {...rest}
      src={broken ? IMAGE_PLACEHOLDER : src}
      alt={alt}
      unoptimized={broken || isRawMedia || rest.unoptimized}
      onError={() => {
        if (src) setFailedSrc(src);
      }}
    />
  );
}
