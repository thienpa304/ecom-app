"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/brands", label: "Thương hiệu" },
  { href: "/categories", label: "Danh mục" },
  { href: "/leads", label: "Leads" },
  { href: "/settings", label: "Cấu hình" },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col bg-admin-sidebar text-slate-100">
      <div className="border-b border-slate-700 px-4 py-4">
        <div className="text-xs uppercase tracking-wider text-slate-400">
          Điện Máy Của Thiên
        </div>
        <div className="mt-0.5 text-sm font-semibold">Quản trị cửa hàng</div>
      </div>

      <nav className="flex-1 space-y-0.5 p-2">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded px-3 py-2 text-sm transition ${
                active
                  ? "bg-admin-accent text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form action={logoutAction} className="border-t border-slate-700 p-3">
        <button
          type="submit"
          className="w-full rounded bg-slate-700 px-3 py-2 text-sm text-slate-100 hover:bg-slate-600"
        >
          Đăng xuất
        </button>
      </form>
    </aside>
  );
}
