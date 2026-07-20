import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
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
  const product = getProduct(id);
  if (!product) notFound();

  const brands = getBrands();
  const categories = getCategories();
  const action = updateProductAction.bind(null, id);

  return (
    <AdminShell
      title="Sửa sản phẩm"
      actions={
        <Link href="/products" className="text-sm text-slate-600 hover:underline">
          ← Quay lại
        </Link>
      }
    >
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
