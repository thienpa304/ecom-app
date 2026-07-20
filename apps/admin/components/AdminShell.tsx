"use client";

import {
  AppstoreOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  PhoneOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { Button, Drawer, Grid, Layout, Menu, Spin, Typography, theme } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { logoutAction } from "@/lib/actions/auth";
import { startAdminNavigation } from "@/components/NavigationProgress";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

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

function resolveSelected(pathname: string) {
  return (
    NAV.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
    )?.key ?? "/"
  );
}

function NavPanel({
  selected,
  onNavigate,
  showBrand = true,
}: {
  selected: string;
  onNavigate: (href: string) => void;
  showBrand?: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    for (const item of NAV) {
      router.prefetch(item.href);
    }
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#1e293b",
      }}
    >
      {showBrand ? (
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
      ) : null}

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selected]}
        style={{ background: "#1e293b", borderInlineEnd: 0, flex: 1 }}
        onClick={({ key }) => {
          const item = NAV.find((n) => n.key === key);
          if (!item) return;
          onNavigate(item.href);
        }}
        items={NAV.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
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
  );
}

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
  const router = useRouter();
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.lg;
  const [open, setOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const selected = pendingHref
    ? resolveSelected(pendingHref)
    : resolveSelected(pathname);
  const navigating = pendingHref != null && pendingHref !== pathname;

  useEffect(() => {
    setOpen(false);
    setPendingHref(null);
  }, [pathname]);

  function handleNavigate(href: string) {
    setOpen(false);
    if (href === pathname) return;
    setPendingHref(href);
    startAdminNavigation();
    router.push(href);
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!isMobile ? (
        <Sider width={220} theme="dark" style={{ background: "#1e293b" }}>
          <NavPanel selected={selected} onNavigate={handleNavigate} />
        </Sider>
      ) : (
        <Drawer
          placement="left"
          open={open}
          onClose={() => setOpen(false)}
          width={260}
          styles={{
            body: { padding: 0, background: "#1e293b" },
            header: {
              background: "#1e293b",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            },
          }}
          title={
            <Typography.Text strong style={{ color: "#fff" }}>
              Menu
            </Typography.Text>
          }
          closeIcon={<MenuFoldOutlined style={{ color: "#fff" }} />}
        >
          <NavPanel
            selected={selected}
            showBrand={false}
            onNavigate={handleNavigate}
          />
        </Drawer>
      )}

      <Layout style={{ minWidth: 0 }}>
        <Header
          style={{
            background: token.colorBgContainer,
            padding: isMobile ? "0 12px" : "0 24px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            height: 56,
            lineHeight: "56px",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          {isMobile ? (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setOpen(true)}
              aria-label="Mở menu"
            />
          ) : null}

          <Typography.Title
            level={isMobile ? 5 : 4}
            style={{
              margin: 0,
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Typography.Title>

          {actions ? (
            <div style={{ flexShrink: 0, maxWidth: isMobile ? "46%" : "none" }}>
              {actions}
            </div>
          ) : null}
        </Header>

        <Content
          style={{
            padding: isMobile ? 12 : 24,
            overflowX: "hidden",
            position: "relative",
            opacity: navigating ? 0.55 : 1,
            transition: "opacity 0.15s ease",
            pointerEvents: navigating ? "none" : "auto",
          }}
        >
          {navigating ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: 48,
                zIndex: 5,
              }}
            >
              <Spin tip="Đang tải..." />
            </div>
          ) : null}
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
