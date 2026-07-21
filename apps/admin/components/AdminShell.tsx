"use client";

import {
  AppstoreOutlined,
  DashboardOutlined,
  FileImageOutlined,
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
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { logoutAction } from "@/lib/actions/auth";
import { startAdminNavigation } from "@/components/NavigationProgress";
import { BRAND } from "@/lib/theme";

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
    key: "/media",
    href: "/media",
    label: "Media",
    icon: <FileImageOutlined />,
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

function BrandMark() {
  return (
    <span className="admin-brand-mark" aria-hidden>
      LP
    </span>
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
  const { token } = theme.useToken();

  useEffect(() => {
    for (const item of NAV) {
      // Skip dashboard — counts must stay fresh (prefetch can pin stale RSC)
      if (item.href === "/") continue;
      router.prefetch(item.href);
    }
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        background: BRAND.siderBg,
        overflow: "hidden",
      }}
    >
      {showBrand ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "18px 16px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        >
          <BrandMark />
          <div style={{ minWidth: 0 }}>
            <Typography.Text
              strong
              style={{
                display: "block",
                color: "#fff",
                fontSize: 14,
                lineHeight: 1.3,
              }}
            >
              Lộc Phát Đạt
            </Typography.Text>
            <Typography.Text
              style={{
                display: "block",
                color: "rgba(255,255,255,0.45)",
                fontSize: 11,
              }}
            >
              Quản trị cửa hàng
            </Typography.Text>
          </div>
        </div>
      ) : null}

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selected]}
        style={{
          background: "transparent",
          borderInlineEnd: 0,
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          paddingTop: 8,
        }}
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

      <div style={{ padding: 12, flexShrink: 0 }}>
        <form action={logoutAction}>
          <Button
            htmlType="submit"
            block
            icon={<LogoutOutlined />}
            style={{
              background: "rgba(255,255,255,0.08)",
              color: token.colorTextLightSolid,
              border: "none",
              height: 40,
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
  const [isPending, startTransition] = useTransition();

  const selected = pendingHref
    ? resolveSelected(pendingHref)
    : resolveSelected(pathname);
  const navigating =
    isPending || (pendingHref != null && pendingHref !== pathname);

  useEffect(() => {
    setOpen(false);
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    if (isMobile) {
      document.documentElement.classList.remove("admin-fixed-shell");
      return;
    }
    document.documentElement.classList.add("admin-fixed-shell");
    return () => {
      document.documentElement.classList.remove("admin-fixed-shell");
    };
  }, [isMobile]);

  useEffect(() => {
    if (!navigating) return;
    const t = setTimeout(() => setPendingHref(null), 5000);
    return () => clearTimeout(t);
  }, [navigating, pendingHref]);

  function handleNavigate(href: string) {
    setOpen(false);
    if (href === pathname) {
      if (href === "/") router.refresh();
      return;
    }
    setPendingHref(href);
    startAdminNavigation();
    startTransition(() => {
      router.push(href);
      if (href === "/") router.refresh();
    });
  }

  return (
    <Layout
      className={isMobile ? undefined : "admin-shell-desktop"}
      style={{
        height: isMobile ? "auto" : "100dvh",
        minHeight: "100dvh",
        overflow: isMobile ? "visible" : "hidden",
      }}
    >
      {!isMobile ? (
        <Sider
          width={232}
          theme="dark"
          style={{
            background: BRAND.siderBg,
            borderInlineEnd: "1px solid rgba(255,255,255,0.06)",
            height: "100dvh",
            position: "fixed",
            insetInlineStart: 0,
            top: 0,
            bottom: 0,
            zIndex: 30,
            overflow: "hidden",
          }}
        >
          <NavPanel selected={selected} onNavigate={handleNavigate} />
        </Sider>
      ) : (
        <Drawer
          placement="left"
          open={open}
          onClose={() => setOpen(false)}
          width={280}
          styles={{
            body: { padding: 0, background: BRAND.siderBg, height: "100%" },
            header: {
              background: BRAND.siderBg,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            },
          }}
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <BrandMark />
              <Typography.Text strong style={{ color: "#fff" }}>
                Menu
              </Typography.Text>
            </div>
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

      <Layout
        style={{
          minWidth: 0,
          background: token.colorBgLayout,
          marginInlineStart: isMobile ? 0 : 232,
          height: isMobile ? "auto" : "100dvh",
          overflow: isMobile ? "visible" : "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
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
            flexShrink: 0,
            position: isMobile ? "sticky" : "relative",
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
              fontWeight: 600,
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
            overflowY: isMobile ? "visible" : "auto",
            flex: isMobile ? undefined : 1,
            minHeight: isMobile ? undefined : 0,
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
