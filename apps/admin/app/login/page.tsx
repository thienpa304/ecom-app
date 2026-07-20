"use client";

import { LockOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Input, Typography } from "antd";
import { useActionState } from "react";
import { loginAction, type AuthState } from "@/lib/actions/auth";

const initial: AuthState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "#f4f5f7",
      }}
    >
      <Card style={{ width: "100%", maxWidth: 380 }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Đăng nhập Admin
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          Nhập mật khẩu quản trị để tiếp tục.
        </Typography.Paragraph>

        <form action={formAction}>
          <div style={{ marginBottom: 16 }}>
            <Typography.Text strong style={{ display: "block", marginBottom: 6 }}>
              Mật khẩu
            </Typography.Text>
            <Input.Password
              name="password"
              prefix={<LockOutlined />}
              placeholder="••••••••"
              autoFocus
              size="large"
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
