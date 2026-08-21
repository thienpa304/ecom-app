import type { FaqEntry } from "@ecom/shared";
import { AccordionItem } from "@/components/AccordionItem";
import { SectionCard } from "@/components/SectionCard";

export function FaqSection({ faqs }: { faqs: FaqEntry[] }) {
  const items = faqs.filter((faq) => faq.question.trim() && faq.answer.trim());
  if (!items.length) return null;

  return (
    <SectionCard
      title="Câu hỏi thường gặp"
      bodyClassName="min-w-0 divide-y divide-gray-100"
    >
      {items.map((faq, index) => (
        <AccordionItem
          key={`${index}-${faq.question}`}
          title={faq.question.trim()}
        >
          <p className="min-w-0 whitespace-pre-line break-words text-sm leading-relaxed text-gray-600">
            {faq.answer.trim()}
          </p>
        </AccordionItem>
      ))}
    </SectionCard>
  );
}
