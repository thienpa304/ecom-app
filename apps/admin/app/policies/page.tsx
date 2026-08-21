import type { PolicyPage } from "@ecom/shared";
import { AdminShell } from "@/components/AdminShell";
import { PoliciesManager } from "@/components/PoliciesManager";
import { listPolicyPages, POLICY_PAGES_TABLE_MISSING } from "@/lib/store";

/**
 * Render động: nếu build chạy trước khi migration `20260821090000_policy_pages.sql`
 * được apply, trang static sẽ đóng băng thông báo "chưa có bảng" và không có
 * cách nào revalidate từ chính trang đó. Một query mỗi lần mở trang admin là rẻ.
 */
export const dynamic = "force-dynamic";

export default async function PoliciesPage() {
  let pages: PolicyPage[] = [];
  let tableMissing = false;

  try {
    pages = await listPolicyPages();
  } catch (e) {
    // Bảng chưa tồn tại thì hiện hướng dẫn chạy migration thay vì trắng trang.
    if (e instanceof Error && e.message === POLICY_PAGES_TABLE_MISSING) {
      tableMissing = true;
    } else {
      throw e;
    }
  }

  return (
    <AdminShell title="Trang chính sách">
      <PoliciesManager pages={pages} tableMissing={tableMissing} />
    </AdminShell>
  );
}
