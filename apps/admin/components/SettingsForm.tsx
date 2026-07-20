"use client";

import type { SiteSettings } from "@ecom/shared";
import { Alert, Button, Card, Form, Input, Space } from "antd";
import { useActionState } from "react";
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
    <Card style={{ maxWidth: 720 }}>
      <form action={action}>
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
    </Card>
  );
}
