import type { FaqEntry } from "@ecom/shared";

export function FaqSection({ faqs }: { faqs: FaqEntry[] }) {
  const items = faqs.filter(
    (faq) => faq.question.trim() && faq.answer.trim(),
  );
  if (!items.length) return null;

  return (
    <section className="mt-6 min-w-0 rounded-lg border border-gray-200 bg-white sm:mt-8">
      <h2 className="border-b border-gray-100 px-4 py-3 text-base font-bold text-gray-900">
        Câu hỏi thường gặp
      </h2>
      <div className="min-w-0 divide-y divide-gray-100">
        {items.map((faq, index) => (
          <details key={`${index}-${faq.question}`} className="group min-w-0">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 text-sm font-semibold text-gray-900 transition hover:text-accent">
              <span className="min-w-0 break-words">{faq.question.trim()}</span>
              <span
                aria-hidden
                className="mt-0.5 shrink-0 text-xs text-gray-400 transition group-open:rotate-180"
              >
                ▼
              </span>
            </summary>
            <p className="min-w-0 whitespace-pre-line break-words px-4 pb-4 text-sm leading-relaxed text-gray-600">
              {faq.answer.trim()}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
