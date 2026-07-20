"use server";

import { revalidatePath } from "next/cache";
import { updateSiteSettings } from "@/lib/store";

export type SettingsActionState = {
  ok: boolean;
  message: string;
};

export async function updateSiteSettingsAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const siteName = String(formData.get("siteName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!siteName || !phone) {
    return { ok: false, message: "Tên web và số điện thoại là bắt buộc." };
  }

  try {
    await updateSiteSettings({
      siteName,
      tagline: String(formData.get("tagline") ?? "").trim(),
      phone,
      zaloUrl: String(formData.get("zaloUrl") ?? "").trim() || "https://zalo.me/",
      address: String(formData.get("address") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      heroTitle: String(formData.get("heroTitle") ?? "").trim(),
      heroSubtitle: String(formData.get("heroSubtitle") ?? "").trim(),
      metaDescription: String(formData.get("metaDescription") ?? "").trim(),
      footerBlurb: String(formData.get("footerBlurb") ?? "").trim(),
      searchPlaceholder:
        String(formData.get("searchPlaceholder") ?? "").trim() ||
        "Tìm sản phẩm...",
    });
    revalidatePath("/settings");
    revalidatePath("/");
    return { ok: true, message: "Đã lưu cấu hình. Web sẽ cập nhật trong giây lát." };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Lỗi không xác định";
    return { ok: false, message };
  }
}
