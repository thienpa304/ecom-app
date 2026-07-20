"use client";

import { App, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import type { ReactNode } from "react";
import { adminTheme } from "@/lib/theme";

export function AntdProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider locale={viVN} theme={adminTheme}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
