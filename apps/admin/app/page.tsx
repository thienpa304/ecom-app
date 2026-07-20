import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { getDashboardCounts } from "@/lib/store";

export default async function DashboardPage() {
  const counts = await getDashboardCounts();

  const cards = [
    { label: "Sản phẩm", value: counts.products, href: "/products" },
    { label: "Đã xuất bản", value: counts.published, href: "/products?published=1" },
    { label: "Thương hiệu", value: counts.brands, href: "/brands" },
    { label: "Leads", value: counts.leads, href: "/leads" },
  ];

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-admin-accent"
          >
            <div className="text-sm text-slate-500">{card.label}</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">
              {card.value}
            </div>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
