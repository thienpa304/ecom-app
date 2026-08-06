import { looksLikeHtml, sanitizeArticleHtml, stripHtml } from "@ecom/shared";

type Props = {
  html?: string;
};

export function ArticleBody({ html }: Props) {
  if (!html?.trim()) return null;

  if (!looksLikeHtml(html)) {
    return (
      <div className="max-w-full whitespace-pre-line break-words text-[15px] leading-7 text-gray-700">
        {html}
      </div>
    );
  }

  const safe = sanitizeArticleHtml(html);
  return (
    <div
      className="article-body max-w-full min-w-0 break-words text-[15px] leading-7 text-gray-700 [&_a]:break-words [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-accent/40 [&_blockquote]:bg-gray-50 [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_blockquote]:pr-3 [&_blockquote]:text-gray-600 [&_figcaption]:mt-1.5 [&_figcaption]:text-center [&_figcaption]:text-xs [&_figcaption]:text-gray-500 [&_figure]:my-5 [&_h2]:mb-2.5 [&_h2]:mt-7 [&_h2]:scroll-mt-24 [&_h2]:break-words [&_h2]:text-lg [&_h2]:font-extrabold [&_h2]:text-gray-900 [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:break-words [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-gray-900 [&_h4]:mb-1.5 [&_h4]:mt-4 [&_h4]:break-words [&_h4]:text-[15px] [&_h4]:font-semibold [&_h4]:text-gray-900 [&_hr]:my-6 [&_hr]:border-gray-200 [&_img]:my-4 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-lg [&_li]:mb-1.5 [&_li]:break-words [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_p]:break-words [&_strong]:font-semibold [&_strong]:text-gray-900 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
      style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}

const WORDS_PER_MINUTE = 200;

export function readingMinutes(html?: string): number {
  if (!html) return 0;
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
