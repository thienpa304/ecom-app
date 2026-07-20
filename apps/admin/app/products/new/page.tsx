import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { ProductForm } from "@/components/ProductForm";
import { createProductAction } from "@/lib/actions/products";
import { getBrands, getCategories } from "@/lib/store";

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([
    getBrands(),
    getCategories(),
  ]);

  return (
    <AdminShell
      title="Thêm sản phẩm"
      actions={
        <Link href="/products" className="text-sm text-slate-600 hover:underline">
          ← Quay lại
        </Link>
      }
    >
      <ProductForm
        action={createProductAction}
        brands={brands}
        categories={categories}
        submitLabel="Tạo sản phẩm"
      />
    </AdminShell>
  );
}
