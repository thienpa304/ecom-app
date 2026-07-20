import {
  looksLikeHtml,
  sanitizeProductHtml,
  stripHtml,
} from "@ecom/shared";

type Props = {
  html?: string;
};

/** Renders product description as sanitized HTML, or plain text fallback. */
export function ProductDescription({ html }: Props) {
  if (!html?.trim()) return null;

  if (!looksLikeHtml(html)) {
    return (
      <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
        {html}
      </p>
    );
  }

  const safe = sanitizeProductHtml(html);
  return (
    <div
      className="product-desc text-sm leading-relaxed text-gray-700 [&_a]:text-blue-600 [&_a]:underline [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-gray-900 [&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-gray-900 [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}

export function descriptionPlainText(html?: string, maxLen = 160): string {
  if (!html) return "";
  const plain = stripHtml(html);
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen - 1).trimEnd()}…`;
}
