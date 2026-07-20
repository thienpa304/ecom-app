import { AdminShell } from "@/components/AdminShell";
import { BrandsManager } from "@/components/BrandsManager";
import { getBrands } from "@/lib/store";

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <AdminShell title="Thương hiệu">
      <BrandsManager brands={brands} />
    </AdminShell>
  );
}
