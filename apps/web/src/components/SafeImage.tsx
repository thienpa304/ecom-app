"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export const IMAGE_PLACEHOLDER = "/placeholder.svg";

const SUPABASE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
  /^https?:\/\//,
  "",
).split("/")[0];

type Props = Omit<ImageProps, "src" | "onError"> & {
  src: string | null | undefined;
};

export function SafeImage({ src, alt, ...rest }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const broken = !src || src === failedSrc;
  const isSupabaseImage = Boolean(
    !broken && SUPABASE_HOST && src.includes(SUPABASE_HOST),
  );

  return (
    <Image
      {...rest}
      src={broken ? IMAGE_PLACEHOLDER : src}
      alt={alt}
      unoptimized={broken || isSupabaseImage || rest.unoptimized}
      onError={() => {
        if (src) setFailedSrc(src);
      }}
    />
  );
}
