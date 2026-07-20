import { AdminShell } from "@/components/AdminShell";
import { LeadsTable } from "@/components/LeadsTable";
import { getLeadsWithProductNames } from "@/lib/store";

export default async function LeadsPage() {
  const rows = await getLeadsWithProductNames();

  return (
    <AdminShell title="Leads">
      <LeadsTable rows={rows} />
    </AdminShell>
  );
}
