import { AdminShell } from "@/components/AdminShell";
import { BackButton } from "@/components/BackButton";
import { ProductForm } from "@/components/ProductForm";
import { createProductAction } from "@/lib/actions/products";
import { getBrands, getCategories } from "@/lib/store";

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([
    getBrands(),
    getCategories(),
  ]);

  return (
    <AdminShell title="Thêm sản phẩm" actions={<BackButton />}>
      <ProductForm
        action={createProductAction}
        brands={brands}
        categories={categories}
        submitLabel="Tạo sản phẩm"
      />
    </AdminShell>
  );
}
