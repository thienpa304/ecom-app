import type { Product } from "@ecom/shared";
import { ProductRow } from "@/components/ProductRow";

type Props = {
  products: Product[];
};

export function RelatedProducts({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="mt-6 min-w-0 rounded-lg border border-gray-200 bg-white sm:mt-8">
      <h2 className="border-b border-gray-100 px-4 py-3 text-base font-bold uppercase text-gray-900">
        Sản phẩm liên quan
      </h2>
      <div className="min-w-0 px-4 py-4">
        <ProductRow products={products} />
      </div>
    </section>
  );
}
