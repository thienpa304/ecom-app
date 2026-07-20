"use client";

import {
  AppstoreOutlined,
  DashboardOutlined,
  LogoutOutlined,
  PhoneOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, Typography, theme } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { logoutAction } from "@/lib/actions/auth";

const { Header, Sider, Content } = Layout;

const NAV = [
  { key: "/", href: "/", label: "Dashboard", icon: <DashboardOutlined /> },
  {
    key: "/products",
    href: "/products",
    label: "Sản phẩm",
    icon: <ShoppingOutlined />,
  },
  {
    key: "/brands",
    href: "/brands",
    label: "Thương hiệu",
    icon: <TagsOutlined />,
  },
  {
    key: "/categories",
    href: "/categories",
    label: "Danh mục",
    icon: <AppstoreOutlined />,
  },
  { key: "/leads", href: "/leads", label: "Leads", icon: <PhoneOutlined /> },
  {
    key: "/settings",
    href: "/settings",
    label: "Cấu hình",
    icon: <SettingOutlined />,
  },
] as const;

export function AdminShell({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { token } = theme.useToken();

  const selected =
    NAV.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
    )?.key ?? "/";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        breakpoint="lg"
        collapsedWidth={64}
        width={220}
        theme="dark"
        style={{ background: "#1e293b" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <div style={{ padding: "16px 16px 12px" }}>
            <Typography.Text
              style={{
                display: "block",
                color: "rgba(255,255,255,0.45)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: 0.6,
              }}
            >
              Điện Máy Của Thiên
            </Typography.Text>
            <Typography.Text strong style={{ color: "#fff" }}>
              Quản trị cửa hàng
            </Typography.Text>
          </div>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selected]}
            style={{ background: "#1e293b", borderInlineEnd: 0, flex: 1 }}
            items={NAV.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: <Link href={item.href}>{item.label}</Link>,
            }))}
          />

          <div style={{ padding: 12 }}>
            <form action={logoutAction}>
              <Button
                htmlType="submit"
                block
                icon={<LogoutOutlined />}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  border: "none",
                }}
              >
                Đăng xuất
              </Button>
            </form>
          </div>
        </div>
      </Sider>

      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            height: 56,
            lineHeight: "56px",
          }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          {actions ? <div>{actions}</div> : null}
        </Header>
        <Content style={{ padding: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
