"use client";

import { trackEvent } from "@/lib/gtag";

type Props = {
  phone: string;
  zaloUrl: string;
};

export function ContactFab({ phone, zaloUrl }: Props) {
  const tel = phone.replace(/\D/g, "");
  if (!tel && !zaloUrl) return null;

  return (
    <div
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
      aria-label="Liên hệ nhanh"
    >
      {zaloUrl ? (
        <a
          href={zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2"
          aria-label="Chat Zalo"
          onClick={() => trackEvent("contact_zalo", { location: "fab" })}
        >
          <span className="pointer-events-none rounded-full bg-gray-900/90 px-3 py-1.5 text-xs font-medium text-white shadow transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
            Chat Zalo
          </span>
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-lg ring-4 ring-[#0068FF]/25 transition hover:scale-105 hover:bg-[#0054cc]">
            <ZaloWordmark className="h-6 w-10" />
          </span>
        </a>
      ) : null}

      {tel ? (
        <a
          href={`tel:${tel}`}
          className="group flex items-center gap-2"
          aria-label={`Gọi ${phone}`}
          onClick={() => trackEvent("contact_call", { location: "fab" })}
        >
          <span className="pointer-events-none rounded-full bg-gray-900/90 px-3 py-1.5 text-xs font-medium text-white shadow transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
            Gọi ngay
          </span>
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg ring-4 ring-accent/25 transition hover:scale-105 hover:bg-accent-dark">
            <span
              className="absolute inset-0 animate-ping rounded-full bg-accent/40"
              aria-hidden
            />
            <PhoneIcon className="relative h-7 w-7" />
          </span>
        </a>
      ) : null}
    </div>
  );
}

function PhoneIcon({ className }: { className?: string }) {
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

function ZaloWordmark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 26"
      fill="currentColor"
      aria-hidden
    >
      <text
        x="32"
        y="20"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="22"
        fontWeight="800"
        letterSpacing="-0.5"
      >
        Zalo
      </text>
    </svg>
  );
}
