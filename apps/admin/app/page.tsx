import { connection } from "next/server";
import { AdminShell } from "@/components/AdminShell";
import { DashboardStats } from "@/components/DashboardStats";
import { getDashboardCounts } from "@/lib/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  await connection();
  const counts = await getDashboardCounts();

  return (
    <AdminShell title="Dashboard">
      <DashboardStats
        products={counts.products}
        published={counts.published}
        brands={counts.brands}
        leads={counts.leads}
      />
    </AdminShell>
  );
}
