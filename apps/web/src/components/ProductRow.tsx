import type { Product } from "@ecom/shared";
import { ProductCard } from "@/components/ProductCard";

type Props = {
  products: Product[];
  priorityCount?: number;
};

export function ProductRow({ products, priorityCount = 0 }: Props) {
  return (
    <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="w-[46%] min-w-[9.5rem] shrink-0 snap-start sm:w-auto sm:min-w-0"
        >
          <ProductCard product={product} priority={index < priorityCount} />
        </div>
      ))}
    </div>
  );
}
