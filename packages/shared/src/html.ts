export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractEmbedSrc(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  const src = /<iframe\b[^>]*\bsrc\s*=\s*(['"])(.*?)\1/i.exec(raw)?.[2] ?? raw;
  const url = src.replace(/&amp;/gi, "&").trim();
  return /^https:\/\//i.test(url) ? url : "";
}

export function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function sanitizeProductHtml(html: string): string {
  if (!html) return "";
  let out = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "");

  out = out.replace(
    /<\/?(?!\/?(p|br|strong|b|em|i|u|ul|ol|li|h2|h3|a|span)\b)[a-z][^>]*>/gi,
    "",
  );

  out = out.replace(/<a\b([^>]*)>/gi, (_m, attrs: string) => {
    const href = /href\s*=\s*(['"])(.*?)\1/i.exec(attrs)?.[2] ?? "";
    if (!href || /^javascript:/i.test(href)) return "<a>";
    const safe = href.replace(/"/g, "&quot;");
    return `<a href="${safe}" rel="noopener noreferrer" target="_blank">`;
  });

  return out;
}
