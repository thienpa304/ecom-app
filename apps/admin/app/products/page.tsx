import { AdminShell } from "@/components/AdminShell";
import { ProductsManager } from "@/components/ProductsManager";
import { getBrands, getCategories, listProducts } from "@/lib/store";

type SearchParams = Promise<{
  q?: string;
  brand?: string;
  published?: string;
  page?: string;
  pageSize?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(sp.pageSize) || 20));

  const [brands, categories, listed] = await Promise.all([
    getBrands(),
    getCategories(),
    listProducts({
      page,
      pageSize,
      filters: {
        q: sp.q,
        brandId: sp.brand,
        published: sp.published,
      },
    }),
  ]);

  return (
    <AdminShell title="Sản phẩm">
      <ProductsManager
        products={listed.items}
        total={listed.total}
        page={listed.page}
        pageSize={listed.pageSize}
        brands={brands}
        categories={categories}
        filters={{
          q: sp.q,
          brand: sp.brand,
          published: sp.published,
        }}
      />
    </AdminShell>
  );
}
