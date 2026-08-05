import type { HeroBullet, HeroBulletIcon } from "@ecom/shared";

type Props = {
  eyebrow: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  bullets: HeroBullet[];
};

function splitTitle(title: string, highlight?: string) {
  const needle = highlight?.trim();
  if (!needle) return null;
  const at = title.toLowerCase().indexOf(needle.toLowerCase());
  if (at === -1) return null;
  return {
    before: title.slice(0, at),
    match: title.slice(at, at + needle.length),
    after: title.slice(at + needle.length),
  };
}

export function HeroIntro({
  eyebrow,
  title,
  highlight,
  subtitle,
  bullets,
}: Props) {
  const parts = splitTitle(title, highlight);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-accent">
        {eyebrow}
      </p>

      <h1 className="mt-2 text-xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-2xl">
        {parts ? (
          <>
            {parts.before}
            <span className="text-brand">{parts.match}</span>
            {parts.after}
          </>
        ) : (
          title
        )}
      </h1>

      <span className="mt-3 block h-1 w-20 rounded-full bg-accent" aria-hidden />

      {subtitle ? (
        <p className="mt-3 max-w-xl text-xs text-gray-600 sm:text-sm">
          {subtitle}
        </p>
      ) : null}

      {bullets.length ? (
        <ul className="mt-4 space-y-3">
          {bullets.map((bullet, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                <BulletIcon name={bullet.icon} className="h-4 w-4" />
              </span>
              <p className="min-w-0 text-xs leading-relaxed text-gray-600">
                {bullet.bold ? (
                  <strong className="font-semibold text-brand">
                    {bullet.bold}
                  </strong>
                ) : null}
                {bullet.bold && bullet.text ? " " : null}
                {bullet.text}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function BulletIcon({
  name,
  className,
}: {
  name: HeroBulletIcon;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
        </svg>
      );
    case "gear":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1A1.7 1.7 0 008.9 19a1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1A1.7 1.7 0 004.6 8.9a1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5.5c0 4.3-2.9 8.2-7 9.5-4.1-1.3-7-5.2-7-9.5V6z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "truck":
      return (
        <svg {...common}>
          <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
          <circle cx="7" cy="18" r="1.8" />
          <circle cx="17.5" cy="18" r="1.8" />
        </svg>
      );
    case "check":
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 12.3l2.4 2.4 4.6-5" />
        </svg>
      );
  }
}
