"use client";

import { FormEvent, useState, useTransition } from "react";
import { submitLead } from "@/app/actions/lead";

type Props = {
  productId?: string | null;
  productName?: string;
};

export function LeadForm({ productId, productName }: Props) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    startTransition(async () => {
      const result = await submitLead({
        productId: productId ?? null,
        name: String(fd.get("name") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        note: String(fd.get("note") ?? ""),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(true);
      form.reset();
    });
  }

  if (done) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        Cảm ơn bạn! Chúng tôi sẽ liên hệ sớm
        {productName ? ` về ${productName}` : ""}.
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-2 block text-xs font-medium text-accent hover:underline"
        >
          Gửi yêu cầu khác
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" id="lien-he">
      <p className="text-sm font-semibold text-gray-900">Để lại số điện thoại</p>
      <div>
        <label htmlFor="lead-name" className="mb-1 block text-xs text-gray-600">
          Họ tên
        </label>
        <input
          id="lead-name"
          name="name"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          placeholder="Nguyễn Văn A"
        />
      </div>
      <div>
        <label htmlFor="lead-phone" className="mb-1 block text-xs text-gray-600">
          Số điện thoại
        </label>
        <input
          id="lead-phone"
          name="phone"
          type="tel"
          required
          pattern="[0-9+\s()-]{8,15}"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          placeholder="09xxxxxxxx"
        />
      </div>
      <div>
        <label htmlFor="lead-note" className="mb-1 block text-xs text-gray-600">
          Ghi chú (tuỳ chọn)
        </label>
        <textarea
          id="lead-note"
          name="note"
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          placeholder="Tôi muốn tư vấn model này..."
        />
      </div>
      {error && <p className="text-xs text-sale">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Đang gửi..." : "Gửi yêu cầu tư vấn"}
      </button>
    </form>
  );
}
