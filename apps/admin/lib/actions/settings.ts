"use server";

import { siteSettingsUpdateSchema } from "@ecom/shared";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { updateSiteSettings } from "@/lib/store";
import { formatZodError } from "@/lib/validate-form";

export type SettingsActionState = {
  ok: boolean;
  message: string;
};

export async function updateSiteSettingsAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await requireAdmin();

  const parsed = siteSettingsUpdateSchema.safeParse({
    siteName: String(formData.get("siteName") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
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

  if (!parsed.success) {
    return { ok: false, message: formatZodError(parsed.error) };
  }

  try {
    await updateSiteSettings(parsed.data);
    revalidatePath("/settings");
    return {
      ok: true,
      message: "Đã lưu cấu hình. Web sẽ cập nhật trong giây lát.",
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Lỗi không xác định";
    return { ok: false, message };
  }
}
