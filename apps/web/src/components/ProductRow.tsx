import type { Product } from "@ecom/shared";
import { ProductCard } from "@/components/ProductCard";
import { ScrollRow } from "@/components/ScrollRow";

type Props = {
  products: Product[];
  priorityCount?: number;
  withArrows?: boolean;
};

const GRID_CLASSES =
  "flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden";

const GRID_ITEM_CLASSES =
  "w-[46%] min-w-[9.5rem] shrink-0 snap-start sm:w-auto sm:min-w-0";

const SCROLL_ITEM_CLASSES =
  "w-[46%] min-w-[9.5rem] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/3)] lg:w-[calc((100%-2.25rem)/4)]";

export function ProductRow({
  products,
  priorityCount = 0,
  withArrows = false,
}: Props) {
  const cards = products.map((product, index) => (
    <div
      key={product.id}
      className={withArrows ? SCROLL_ITEM_CLASSES : GRID_ITEM_CLASSES}
    >
      <ProductCard product={product} priority={index < priorityCount} />
    </div>
  ));

  if (withArrows) {
    return <ScrollRow>{cards}</ScrollRow>;
  }

  return <div className={GRID_CLASSES}>{cards}</div>;
}
