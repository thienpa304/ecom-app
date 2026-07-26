export type VideoSource =
  | { kind: "youtube"; id: string; embedUrl: string; originalUrl: string }
  | { kind: "tiktok"; id: string; embedUrl: string; originalUrl: string }
  | { kind: "file"; url: string; originalUrl: string }
  | { kind: "unknown"; url: string; originalUrl: string };

function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname.startsWith("/embed/")) {
        return u.pathname.split("/")[2] || null;
      }
      if (u.pathname.startsWith("/shorts/")) {
        return u.pathname.split("/")[2] || null;
      }
      return u.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

function tiktokId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host !== "tiktok.com" && host !== "vm.tiktok.com") return null;
    const match = u.pathname.match(/\/video\/(\d+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function isDirectMedia(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

export function parseVideoUrl(url: string | null | undefined): VideoSource | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  const yt = youtubeId(trimmed);
  if (yt) {
    return {
      kind: "youtube",
      id: yt,
      embedUrl: `https://www.youtube-nocookie.com/embed/${yt}`,
      originalUrl: trimmed,
    };
  }

  const tt = tiktokId(trimmed);
  if (tt) {
    return {
      kind: "tiktok",
      id: tt,
      embedUrl: `https://www.tiktok.com/embed/v2/${tt}`,
      originalUrl: trimmed,
    };
  }

  if (isDirectMedia(trimmed)) {
    return { kind: "file", url: trimmed, originalUrl: trimmed };
  }

  if (/^https?:\/\//i.test(trimmed) && /\/storage\/v1\/object\/public\//i.test(trimmed)) {
    return { kind: "file", url: trimmed, originalUrl: trimmed };
  }

  return { kind: "unknown", url: trimmed, originalUrl: trimmed };
}
