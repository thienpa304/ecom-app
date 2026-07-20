"use client";

import { useActionState } from "react";
import type { SiteSettings } from "@ecom/shared";
import {
  updateSiteSettingsAction,
  type SettingsActionState,
} from "@/lib/actions/settings";

const initial: SettingsActionState = { ok: false, message: "" };

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState(
    updateSiteSettingsAction,
    initial,
  );

  return (
    <form action={action} className="max-w-2xl space-y-5 rounded-lg border border-slate-200 bg-white p-5">
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-900">
          Thông tin cửa hàng
        </legend>
        <Field label="Tên web" name="siteName" defaultValue={settings.siteName} required />
        <Field label="Slogan / tagline" name="tagline" defaultValue={settings.tagline} />
        <Field label="Số điện thoại (hotline)" name="phone" defaultValue={settings.phone} required />
        <Field label="Link Zalo OA" name="zaloUrl" defaultValue={settings.zaloUrl} />
        <Field label="Địa chỉ" name="address" defaultValue={settings.address} />
        <Field label="Email" name="email" defaultValue={settings.email} type="email" />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-900">
          Trang chủ & SEO
        </legend>
        <Field label="Tiêu đề hero" name="heroTitle" defaultValue={settings.heroTitle} />
        <TextArea
          label="Mô tả hero"
          name="heroSubtitle"
          defaultValue={settings.heroSubtitle}
        />
        <TextArea
          label="Meta description"
          name="metaDescription"
          defaultValue={settings.metaDescription}
        />
        <Field
          label="Placeholder ô tìm kiếm"
          name="searchPlaceholder"
          defaultValue={settings.searchPlaceholder}
        />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-900">Footer</legend>
        <TextArea
          label="Mô tả footer"
          name="footerBlurb"
          defaultValue={settings.footerBlurb}
        />
      </fieldset>

      {state.message ? (
        <p
          className={`text-sm ${state.ok ? "text-emerald-600" : "text-red-600"}`}
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-admin-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Đang lưu..." : "Lưu cấu hình"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-slate-500" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-slate-500" htmlFor={name}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={3}
        defaultValue={defaultValue}
        className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
      />
    </div>
  );
}
