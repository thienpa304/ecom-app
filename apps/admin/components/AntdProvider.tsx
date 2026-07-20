"use client";

import { App, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import type { ReactNode } from "react";

export function AntdProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: "#2563eb",
          borderRadius: 6,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
