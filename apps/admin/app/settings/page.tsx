import { AdminShell } from "@/components/AdminShell";
import { SettingsForm } from "@/components/SettingsForm";
import { getSiteSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <AdminShell title="Cấu hình cửa hàng">
      <p className="mb-4 max-w-2xl text-sm text-slate-600">
        Tên web, hotline, Zalo và nội dung trang chủ — chỉnh tại đây, web sẽ đọc
        trực tiếp từ database (không cần deploy lại).
      </p>
      <SettingsForm settings={settings} />
    </AdminShell>
  );
}
