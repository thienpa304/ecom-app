import { AdminShell } from "@/components/AdminShell";
import { SettingsForm } from "@/components/SettingsForm";
import { getSiteSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <AdminShell title="Cấu hình cửa hàng">
      <p
        style={{
          marginTop: 0,
          marginBottom: 16,
          maxWidth: 720,
          color: "rgba(0,0,0,0.45)",
          fontSize: 14,
        }}
      >
        Tên web, hotline, Zalo và nội dung trang chủ — chỉnh tại đây, web sẽ đọc
        trực tiếp từ database (không cần deploy lại).
      </p>
      <SettingsForm settings={settings} />
    </AdminShell>
  );
}
