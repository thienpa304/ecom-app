type ReasonIcon = "shield" | "tag" | "headset" | "badge" | "truck" | "tools";

type Reason = {
  title: string;
  text: string;
  icon: ReasonIcon;
  tone: "brand" | "accent";
};

const REASONS: Reason[] = [
  {
    title: "Hàng chính hãng",
    text: "Sản phẩm 100% chính hãng, nguồn gốc rõ ràng.",
    icon: "shield",
    tone: "brand",
  },
  {
    title: "Giá cạnh tranh",
    text: "Giá tốt nhất thị trường, nhiều ưu đãi hấp dẫn.",
    icon: "tag",
    tone: "accent",
  },
  {
    title: "Tư vấn chuyên nghiệp",
    text: "Tư vấn đúng nhu cầu, đúng ngân sách.",
    icon: "headset",
    tone: "brand",
  },
  {
    title: "Bảo hành rõ ràng",
    text: "Bảo hành chính hãng, hỗ trợ nhanh chóng.",
    icon: "badge",
    tone: "accent",
  },
  {
    title: "Giao hàng toàn quốc",
    text: "Giao hàng nhanh chóng, đóng gói an toàn.",
    icon: "truck",
    tone: "brand",
  },
  {
    title: "Hỗ trợ kỹ thuật",
    text: "Hỗ trợ kỹ thuật trọn đời trong suốt quá trình sử dụng.",
    icon: "tools",
    tone: "accent",
  },
];

type Props = {
  siteName: string;
  phone: string;
  zaloUrl?: string;
};

export function WhyChooseUs({ siteName, phone, zaloUrl }: Props) {
  const tel = phone.replace(/\D/g, "");
  if (!tel && !zaloUrl) return null;

  return (
    <section
      aria-labelledby="why-us-heading"
      className="border-t border-gray-200 bg-white"
    >
      <div className="container-page py-7 sm:py-9">
        <h2
          id="why-us-heading"
          className="text-center text-base font-extrabold uppercase tracking-wide text-brand sm:text-lg"
        >
          Vì sao nên mua tại <span className="text-accent">{siteName}</span>
        </h2>

        <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-0 lg:divide-x lg:divide-gray-100">
          {REASONS.map((reason) => (
            <li
              key={reason.icon}
              className="flex min-w-0 flex-col items-center px-2 text-center lg:px-4"
            >
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 ${
                  reason.tone === "brand"
                    ? "border-brand-soft text-brand"
                    : "border-orange-100 text-accent"
                }`}
              >
                <ReasonGlyph name={reason.icon} />
              </span>
              <h3
                className={`mt-3 text-[13px] font-bold uppercase leading-tight ${
                  reason.tone === "brand" ? "text-brand" : "text-accent"
                }`}
              >
                {reason.title}
              </h3>
              <p className="mt-1.5 min-w-0 break-words text-xs leading-relaxed text-gray-600">
                {reason.text}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-gray-100 bg-gray-50">
        <div className="container-page flex flex-col items-center gap-4 py-5 sm:flex-row sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-brand-soft text-brand sm:flex">
              <ReasonGlyph name="headset" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-extrabold uppercase tracking-wide text-brand sm:text-base">
                Cần tư vấn chọn máy?
              </p>
              <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
                Đội ngũ {siteName} sẵn sàng tư vấn sản phẩm phù hợp với nhu cầu
                và ngân sách của bạn.
              </p>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-wrap gap-3 sm:w-auto">
            {tel ? (
              <a
                href={`tel:${tel}`}
                className="inline-flex min-h-11 flex-1 basis-40 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-white transition hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent/40 sm:flex-none"
              >
                <PhoneGlyph className="h-5 w-5 shrink-0" />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[11px] font-medium text-white/90">
                    Gọi ngay
                  </span>
                  <span className="whitespace-nowrap text-sm font-bold">
                    {phone}
                  </span>
                </span>
              </a>
            ) : null}
            {zaloUrl ? (
              <a
                href={zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 flex-1 basis-40 items-center justify-center gap-2 rounded-md bg-zalo px-4 py-2.5 text-white transition hover:bg-zalo-dark focus:outline-none focus:ring-2 focus:ring-zalo/40 sm:flex-none"
              >
                <ChatGlyph className="h-5 w-5 shrink-0" />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-sm font-bold">Nhắn Zalo</span>
                  <span className="text-[11px] font-medium text-white/90">
                    Tư vấn nhanh
                  </span>
                </span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReasonGlyph({ name }: { name: ReasonIcon }) {
  const shared = {
    className: "h-6 w-6",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "shield":
      return (
        <svg {...shared}>
          <path d="M12 3.5 5 6v5.5c0 4 3 7.3 7 8.5 4-1.2 7-4.5 7-8.5V6z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "tag":
      return (
        <svg {...shared}>
          <path d="M20.5 13.3 13.3 20.5a1.7 1.7 0 0 1-2.4 0l-7.4-7.4V3.5h9.6l7.4 7.4a1.7 1.7 0 0 1 0 2.4z" />
          <circle cx="7.8" cy="7.8" r="1.4" />
        </svg>
      );
    case "headset":
      return (
        <svg {...shared}>
          <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
          <path d="M4 13h2.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM20 13h-2.5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1H19a1 1 0 0 0 1-1z" />
        </svg>
      );
    case "badge":
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m8.5 12 2.4 2.4 4.6-4.8" />
        </svg>
      );
    case "truck":
      return (
        <svg {...shared}>
          <path d="M3 7h11v9H3zM14 10.5h3.6l2.4 3V16h-6z" />
          <circle cx="7" cy="17.5" r="1.6" />
          <circle cx="17" cy="17.5" r="1.6" />
        </svg>
      );
    default:
      return (
        <svg {...shared}>
          <path d="M15.5 3.5a4.5 4.5 0 0 0-3.9 6.8L4 17.9 6.1 20l7.6-7.6a4.5 4.5 0 0 0 5.6-6l-2.6 2.6-2.2-2.2 2.6-2.6a4.5 4.5 0 0 0-1.6-.7z" />
        </svg>
      );
  }
}

function PhoneGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V21a1 1 0 01-1 1C10.4 22 2 13.6 2 3a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z" />
    </svg>
  );
}

function ChatGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 3c-5 0-9 3.36-9 7.5 0 2.36 1.3 4.46 3.34 5.83L5.6 20a.4.4 0 00.58.45l3.6-1.92c.71.13 1.46.2 2.22.2 5 0 9-3.36 9-7.5S17 3 12 3z" />
    </svg>
  );
}
