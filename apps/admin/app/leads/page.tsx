import { AdminShell } from "@/components/AdminShell";
import { formatDate } from "@/lib/format";
import { getLeads, getProducts } from "@/lib/store";

export default function LeadsPage() {
  const leads = [...getLeads()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const productMap = Object.fromEntries(
    getProducts().map((p) => [p.id, p.name]),
  );

  return (
    <AdminShell title="Leads">
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">Thời gian</th>
              <th className="px-3 py-2 font-medium">Họ tên</th>
              <th className="px-3 py-2 font-medium">SĐT</th>
              <th className="px-3 py-2 font-medium">Sản phẩm</th>
              <th className="px-3 py-2 font-medium">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                  {formatDate(lead.createdAt)}
                </td>
                <td className="px-3 py-2 font-medium">{lead.name}</td>
                <td className="px-3 py-2 whitespace-nowrap">{lead.phone}</td>
                <td className="px-3 py-2">
                  {lead.productId
                    ? productMap[lead.productId] ?? lead.productId
                    : "—"}
                </td>
                <td className="px-3 py-2 text-slate-600">{lead.note || "—"}</td>
              </tr>
            ))}
            {leads.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-slate-500"
                >
                  Chưa có lead.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
