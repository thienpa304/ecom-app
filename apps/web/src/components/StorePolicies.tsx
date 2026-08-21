import { AccordionItem } from "@/components/AccordionItem";
import { SectionCard } from "@/components/SectionCard";

export function StorePolicies({
  shippingPolicy,
  returnPolicy,
}: {
  shippingPolicy?: string;
  returnPolicy?: string;
}) {
  const shipping = shippingPolicy?.trim() ?? "";
  const returns = returnPolicy?.trim() ?? "";
  if (!shipping && !returns) return null;

  return (
    <SectionCard
      title="Chính sách mua hàng và bảo hành"
      bodyClassName="min-w-0 divide-y divide-gray-100"
    >
      {shipping && (
        <AccordionItem title="Giao hàng">
          <p className="min-w-0 whitespace-pre-line break-words text-sm leading-relaxed text-gray-600">
            {shipping}
          </p>
        </AccordionItem>
      )}
      {returns && (
        <AccordionItem title="Đổi trả & bảo hành">
          <p className="min-w-0 whitespace-pre-line break-words text-sm leading-relaxed text-gray-600">
            {returns}
          </p>
        </AccordionItem>
      )}
    </SectionCard>
  );
}
