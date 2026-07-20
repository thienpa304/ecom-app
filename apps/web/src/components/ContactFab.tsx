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
        >
          <span className="pointer-events-none rounded-full bg-gray-900/90 px-3 py-1.5 text-xs font-medium text-white shadow transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
            Chat Zalo
          </span>
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-lg ring-4 ring-[#0068FF]/25 transition hover:scale-105 hover:bg-[#0054cc]">
            <ZaloIcon className="h-7 w-7" />
          </span>
        </a>
      ) : null}

      {tel ? (
        <a
          href={`tel:${tel}`}
          className="group flex items-center gap-2"
          aria-label={`Gọi ${phone}`}
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

function ZaloIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="currentColor"
      aria-hidden
    >
      <path d="M24.5 6C14.3 6 6 13.4 6 22.5c0 5.2 2.7 9.9 7 12.9l-1.1 6.1 6.5-2.1c1.9.5 3.9.8 6.1.8 10.2 0 18.5-7.4 18.5-16.5S34.7 6 24.5 6zm8.3 21.4c-.3.8-1.7 1.5-2.8 1.7-.7.1-1.7.2-5-.9-4.1-1.4-6.8-5-7-5.2-.2-.3-1.7-2.3-1.7-4.3s1.1-3.1 1.5-3.5c.4-.4.8-.5 1.1-.5h.8c.3 0 .6 0 .9.7.3.8 1.1 2.8 1.2 3 .1.2.2.5 0 .8-.1.3-.2.5-.4.7-.2.2-.4.5-.6.6-.2.2-.4.3-.2.7.3.5 1.2 2 2.5 3.2 1.7 1.6 3.2 2.1 3.6 2.3.4.2.7.2 1-.1.2-.3 1.1-1.3 1.4-1.7.3-.5.6-.4 1-.2.4.2 2.6 1.2 3 .7.4-.2.8-.9.9-1.2.1-.3.1-.6-.1-.8z" />
    </svg>
  );
}
