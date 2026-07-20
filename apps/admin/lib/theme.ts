import type { ThemeConfig } from "antd";

/** Brand tokens shared with storefront (`--accent: #e85d04`). */
export const BRAND = {
  primary: "#e85d04",
  primaryHover: "#d45103",
  primaryActive: "#c04802",
  layoutBg: "#f5f6f8",
  siderBg: "#0f172a",
  siderElevated: "#1e293b",
} as const;

export const adminTheme: ThemeConfig = {
  token: {
    colorPrimary: BRAND.primary,
    colorLink: BRAND.primary,
    colorInfo: BRAND.primary,
    borderRadius: 8,
    colorBgLayout: BRAND.layoutBg,
    fontFamily:
      'var(--font-admin), "Be Vietnam Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    controlHeight: 36,
  },
  components: {
    Layout: {
      siderBg: BRAND.siderBg,
      bodyBg: BRAND.layoutBg,
      headerBg: "#ffffff",
      triggerBg: BRAND.siderElevated,
    },
    Menu: {
      darkItemBg: BRAND.siderBg,
      darkSubMenuItemBg: BRAND.siderBg,
      darkItemSelectedBg: "rgba(232, 93, 4, 0.18)",
      darkItemSelectedColor: "#ff9f1a",
      darkItemHoverBg: "rgba(255, 255, 255, 0.06)",
      itemBorderRadius: 8,
      itemMarginInline: 8,
      itemHeight: 40,
    },
    Card: {
      borderRadiusLG: 12,
      paddingLG: 20,
    },
    Table: {
      headerBg: "#fafafa",
      borderColor: "#f0f0f0",
    },
    Button: {
      primaryShadow: "0 2px 0 rgba(232, 93, 4, 0.08)",
    },
  },
};
