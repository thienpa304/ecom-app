import { notFound } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { BackButton } from "@/components/BackButton";
import { ProductForm } from "@/components/ProductForm";
import { updateProductAction } from "@/lib/actions/products";
import { getBrands, getCategories, getProduct } from "@/lib/store";

type Params = Promise<{ id: string }>;

export default async function EditProductPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const [product, brands, categories] = await Promise.all([
    getProduct(id),
    getBrands(),
    getCategories(),
  ]);
  if (!product) notFound();

  const action = updateProductAction.bind(null, id);

  return (
    <AdminShell title="Sửa sản phẩm" actions={<BackButton />}>
      <ProductForm
        action={action}
        brands={brands}
        categories={categories}
        product={product}
        submitLabel="Lưu thay đổi"
      />
    </AdminShell>
  );
}
