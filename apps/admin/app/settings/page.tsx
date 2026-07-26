import { AdminShell } from "@/components/AdminShell";
import { SettingsForm } from "@/components/SettingsForm";
import { getSiteSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <AdminShell title="Cấu hình cửa hàng">
      <SettingsForm settings={settings} />
    </AdminShell>
  );
}
