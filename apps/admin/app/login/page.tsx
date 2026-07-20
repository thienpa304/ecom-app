"use client";

import { LockOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Input, Typography, theme } from "antd";
import { useActionState } from "react";
import { loginAction, type AuthState } from "@/lib/actions/auth";

const initial: AuthState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initial);
  const { token } = theme.useToken();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: token.colorBgLayout,
      }}
    >
      <Card
        style={{ width: "100%", maxWidth: 400 }}
        styles={{ body: { padding: 28 } }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <span className="admin-brand-mark" aria-hidden>
            LP
          </span>
          <div>
            <Typography.Text
              strong
              style={{ display: "block", fontSize: 16, lineHeight: 1.3 }}
            >
              Điện Máy Lộc Phát Đạt
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Bảng quản trị
            </Typography.Text>
          </div>
        </div>

        <Typography.Title level={3} style={{ marginTop: 0, marginBottom: 4 }}>
          Đăng nhập
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 20 }}>
          Nhập mật khẩu quản trị để tiếp tục.
        </Typography.Paragraph>

        <form action={formAction}>
          <div style={{ marginBottom: 16 }}>
            <Typography.Text
              strong
              style={{ display: "block", marginBottom: 6 }}
            >
              Mật khẩu
            </Typography.Text>
            <Input.Password
              name="password"
              prefix={<LockOutlined />}
              placeholder="••••••••"
              autoFocus
              size="large"
              autoComplete="current-password"
              required
            />
          </div>

          {state.error ? (
            <Alert
              type="error"
              message={state.error}
              showIcon
              style={{ marginBottom: 16 }}
            />
          ) : null}

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={pending}
          >
            Đăng nhập
          </Button>
        </form>
      </Card>
    </div>
  );
}
