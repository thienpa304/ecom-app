import { AdminShell } from "@/components/AdminShell";
import { MediaLibraryPage } from "@/components/media/MediaLibraryPage";

export default function MediaPage() {
  return (
    <AdminShell title="Thư viện Media">
      <MediaLibraryPage />
    </AdminShell>
  );
}
