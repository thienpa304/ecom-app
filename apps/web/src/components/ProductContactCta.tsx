"use client";

import { trackEvent } from "@/lib/gtag";

type Props = {
  phone: string;
  zaloUrl: string;
  productName: string;
  productModel: string;
};

export function ProductContactCta({
  phone,
  zaloUrl,
  productName,
  productModel,
}: Props) {
  const telHref = `tel:${phone.replace(/\D/g, "")}`;

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={telHref}
        className="btn-primary flex-1 bg-call hover:bg-call-dark focus:ring-call/40 sm:flex-none"
        onClick={() =>
          trackEvent("contact_call", {
            location: "product",
            item_name: productName,
            item_id: productModel,
          })
        }
      >
        Gọi ngay
      </a>
      <a
        href={zaloUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary flex-1 bg-zalo hover:bg-zalo-dark focus:ring-zalo/40 sm:flex-none"
        onClick={() =>
          trackEvent("contact_zalo", {
            location: "product",
            item_name: productName,
            item_id: productModel,
          })
        }
      >
        Nhận báo giá Zalo
      </a>
    </div>
  );
}
