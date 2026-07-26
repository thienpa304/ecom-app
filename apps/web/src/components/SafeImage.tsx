"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export const IMAGE_PLACEHOLDER = "/placeholder.svg";

type Props = Omit<ImageProps, "src" | "onError"> & {
  src: string | null | undefined;
};

export function SafeImage({ src, alt, ...rest }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const broken = !src || src === failedSrc;

  return (
    <Image
      {...rest}
      src={broken ? IMAGE_PLACEHOLDER : src}
      alt={alt}
      unoptimized={broken || rest.unoptimized}
      onError={() => {
        if (src) setFailedSrc(src);
      }}
    />
  );
}
