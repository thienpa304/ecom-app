import { AdminShell } from "@/components/AdminShell";
import { HomeSectionsManager } from "@/components/HomeSectionsManager";
import { getCategories, listHomeSections } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomeSectionsPage() {
  const [sections, categories] = await Promise.all([
    listHomeSections(),
    getCategories(),
  ]);

  return (
    <AdminShell title="Bố cục trang chủ">
      <HomeSectionsManager sections={sections} categories={categories} />
    </AdminShell>
  );
}
