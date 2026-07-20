"use client";

import type { ProductImage } from "@ecom/shared";
import { useState } from "react";

type Props = {
  images: ProductImage[];
  name: string;
};

export function ProductGallery({ images, name }: Props) {
  const list =
    images.length > 0
      ? images
      : [
          {
            id: "placeholder",
            productId: "",
            url: "https://placehold.co/800x600/f3f4f6/9ca3af?text=No+Image",
            alt: name,
            sortOrder: 0,
          },
        ];

  const [active, setActive] = useState(0);
  const current = list[active] ?? list[0]!;

  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={current.alt || name}
          className="h-full w-full object-contain p-4"
        />
      </div>
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {list.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(idx)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded border bg-white p-1 ${
                idx === active
                  ? "border-accent ring-1 ring-accent"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt}
                className="h-full w-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
