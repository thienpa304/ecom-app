import { Sidebar } from "./Sidebar";

export function AdminShell({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
