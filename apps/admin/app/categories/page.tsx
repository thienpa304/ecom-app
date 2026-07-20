import { AdminShell } from "@/components/AdminShell";
import { CategoriesManager } from "@/components/CategoriesManager";
import { getCategories } from "@/lib/store";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <AdminShell title="Danh mục">
      <CategoriesManager categories={categories} />
    </AdminShell>
  );
}
