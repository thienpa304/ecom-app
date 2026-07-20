import { AdminShell } from "@/components/AdminShell";
import { ProductsManager } from "@/components/ProductsManager";
import { getBrands, getCategories, getProducts } from "@/lib/store";

type SearchParams = Promise<{
  q?: string;
  brand?: string;
  published?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const [brands, categories, allProducts] = await Promise.all([
    getBrands(),
    getCategories(),
    getProducts(),
  ]);

  let products = allProducts;

  if (sp.q) {
    const q = sp.q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q),
    );
  }
  if (sp.brand) {
    products = products.filter((p) => p.brandId === sp.brand);
  }
  if (sp.published === "1") {
    products = products.filter((p) => p.isPublished);
  } else if (sp.published === "0") {
    products = products.filter((p) => !p.isPublished);
  }

  return (
    <AdminShell title="Sản phẩm">
      <ProductsManager
        products={products}
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
