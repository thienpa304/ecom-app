import { AdminShell } from "@/components/AdminShell";
import { LeadsTable } from "@/components/LeadsTable";
import { getLeads, getProducts } from "@/lib/store";

export default async function LeadsPage() {
  const [rawLeads, products] = await Promise.all([getLeads(), getProducts()]);
  const leads = [...rawLeads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const productMap = Object.fromEntries(products.map((p) => [p.id, p.name]));

  const rows = leads.map((lead) => ({
    ...lead,
    productName: lead.productId
      ? (productMap[lead.productId] ?? lead.productId)
      : "—",
  }));

  return (
    <AdminShell title="Leads">
      <LeadsTable rows={rows} />
    </AdminShell>
  );
}
