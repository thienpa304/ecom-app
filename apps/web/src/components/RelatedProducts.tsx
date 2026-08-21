import type { Product } from "@ecom/shared";
import { ProductRow } from "@/components/ProductRow";
import { SectionCard, SectionCardLink } from "@/components/SectionCard";

type Props = {
  products: Product[];
  viewAllHref?: string;
};

export function RelatedProducts({ products, viewAllHref }: Props) {
  if (products.length === 0) return null;

  return (
    <SectionCard
      title="Sản phẩm liên quan"
      action={viewAllHref ? <SectionCardLink href={viewAllHref} /> : undefined}
    >
      <ProductRow products={products} />
    </SectionCard>
  );
}
