"use client";

import Image from "next/image";
import type { ProductImage } from "@ecom/shared";
import { useState } from "react";

type Props = {
  images: ProductImage[];
  name: string;
};

const PLACEHOLDER = "/placeholder.svg";

export function ProductGallery({ images, name }: Props) {
  const list =
    images.length > 0
      ? images
      : [
          {
            id: "placeholder",
            productId: "",
            url: PLACEHOLDER,
            alt: name,
            sortOrder: 0,
          },
        ];

  const [active, setActive] = useState(0);
  const current = list[active] ?? list[0]!;

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 bg-white">
        <Image
          key={current.id}
          src={current.url || PLACEHOLDER}
          alt={current.alt || name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-4"
          priority
        />
      </div>
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto" role="list">
          {list.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(idx)}
              aria-label={`Ảnh ${idx + 1}`}
              aria-pressed={idx === active}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded border bg-white p-1 ${
                idx === active
                  ? "border-accent ring-1 ring-accent"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <Image
                src={img.url || PLACEHOLDER}
                alt={img.alt || `${name} — ảnh ${idx + 1}`}
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
