"use client";

import type { SiteSettings } from "@ecom/shared";
import { Alert, Button, Card, Form, Input, Space, Typography } from "antd";
import dynamic from "next/dynamic";
import { useActionState, useState } from "react";
import {
  updateSiteSettingsAction,
  type SettingsActionState,
} from "@/lib/actions/settings";

const MediaLibraryModal = dynamic(
  () =>
    import("@/components/media/MediaLibraryModal").then(
      (m) => m.MediaLibraryModal,
    ),
  { ssr: false },
);

const initial: SettingsActionState = { ok: false, message: "" };

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState(
    updateSiteSettingsAction,
    initial,
  );
  const [heroImageUrl, setHeroImageUrl] = useState(settings.heroImageUrl ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <Card style={{ width: "100%" }}>
      <form action={action}>
        <input type="hidden" name="heroImageUrl" value={heroImageUrl} />
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <section>
            <Form layout="vertical" component={false}>
              <h3 style={{ marginTop: 0 }}>Thông tin cửa hàng</h3>
              <Form.Item label="Tên web" required>
                <Input name="siteName" defaultValue={settings.siteName} required />
              </Form.Item>
              <Form.Item label="Slogan / tagline">
                <Input name="tagline" defaultValue={settings.tagline} />
              </Form.Item>
              <Form.Item label="Số điện thoại (hotline)" required>
                <Input name="phone" defaultValue={settings.phone} required />
              </Form.Item>
              <Form.Item label="Link Zalo OA">
                <Input name="zaloUrl" defaultValue={settings.zaloUrl} />
              </Form.Item>
              <Form.Item label="Địa chỉ">
                <Input name="address" defaultValue={settings.address} />
              </Form.Item>
              <Form.Item label="Email">
                <Input
                  name="email"
                  type="email"
                  defaultValue={settings.email}
                />
              </Form.Item>

              <h3>Trang chủ & SEO</h3>
              <Form.Item label="Tiêu đề hero">
                <Input name="heroTitle" defaultValue={settings.heroTitle} />
              </Form.Item>
              <Form.Item label="Mô tả hero">
                <Input.TextArea
                  name="heroSubtitle"
                  rows={3}
                  defaultValue={settings.heroSubtitle}
                />
              </Form.Item>

              <Form.Item label="Ảnh poster (bên phải trang chủ)">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Space wrap>
                    <Button
                      type="default"
                      htmlType="button"
                      onClick={() => setPickerOpen(true)}
                    >
                      Chọn từ thư viện
                    </Button>
                    {heroImageUrl ? (
                      <Button
                        danger
                        type="link"
                        htmlType="button"
                        onClick={() => setHeroImageUrl("")}
                      >
                        Xóa ảnh
                      </Button>
                    ) : null}
                  </Space>
                  <Input
                    value={heroImageUrl}
                    onChange={(e) => setHeroImageUrl(e.target.value)}
                    placeholder="Hoặc dán URL ảnh…"
                    allowClear
                  />
                  {heroImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={heroImageUrl}
                      alt="Hero poster preview"
                      style={{
                        width: "100%",
                        maxWidth: 420,
                        maxHeight: 220,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #f0f0f0",
                      }}
                    />
                  ) : (
                    <Typography.Text type="secondary">
                      Chưa có ảnh — web sẽ hiện nền gradient mặc định.
                    </Typography.Text>
                  )}
                </Space>
              </Form.Item>

              <Form.Item label="Tiêu đề trên poster">
                <Input
                  name="heroCardTitle"
                  defaultValue={
                    settings.heroCardTitle ||
                    "Xem hàng như tại cửa hàng"
                  }
                  placeholder="Xem hàng như tại cửa hàng"
                />
              </Form.Item>
              <Form.Item label="Dòng phụ trên poster">
                <Input
                  name="heroCardCaption"
                  defaultValue={
                    settings.heroCardCaption ||
                    "Lọc theo thương hiệu · Giá · Tồn kho"
                  }
                  placeholder="Lọc theo thương hiệu · Giá · Tồn kho"
                />
              </Form.Item>

              <Form.Item label="Meta description">
                <Input.TextArea
                  name="metaDescription"
                  rows={3}
                  defaultValue={settings.metaDescription}
                />
              </Form.Item>
              <Form.Item label="Placeholder ô tìm kiếm">
                <Input
                  name="searchPlaceholder"
                  defaultValue={settings.searchPlaceholder}
                />
              </Form.Item>

              <h3>Footer</h3>
              <Form.Item label="Mô tả footer">
                <Input.TextArea
                  name="footerBlurb"
                  rows={3}
                  defaultValue={settings.footerBlurb}
                />
              </Form.Item>
            </Form>
          </section>

          {state.message ? (
            <Alert
              type={state.ok ? "success" : "error"}
              message={state.message}
              showIcon
            />
          ) : null}

          <Button type="primary" htmlType="submit" loading={pending}>
            Lưu cấu hình
          </Button>
        </Space>
      </form>

      <MediaLibraryModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        accept="image"
        multiple={false}
        title="Chọn ảnh poster trang chủ"
        initialSelectedUrls={heroImageUrl ? [heroImageUrl] : []}
        onSelect={(assets) => {
          const url = assets[0]?.url;
          if (url) setHeroImageUrl(url);
        }}
      />
    </Card>
  );
}
