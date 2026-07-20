"use server";

import { z } from "zod";
import { createLead } from "@/lib/data";

const schema = z.object({
  productId: z.string().nullable().optional(),
  name: z.string().trim().min(2, "Vui lòng nhập họ tên"),
  phone: z
    .string()
    .trim()
    .min(8, "Số điện thoại không hợp lệ")
    .max(15, "Số điện thoại không hợp lệ"),
  note: z.string().optional(),
});

export type LeadActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitLead(input: {
  productId?: string | null;
  name: string;
  phone: string;
  note?: string;
}): Promise<LeadActionResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  await createLead({
    productId: parsed.data.productId ?? null,
    name: parsed.data.name,
    phone: parsed.data.phone,
    note: parsed.data.note,
  });

  return { ok: true };
}
