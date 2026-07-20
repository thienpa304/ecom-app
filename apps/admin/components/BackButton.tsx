"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Grid } from "antd";
import Link from "next/link";

export function BackButton({ href = "/products" }: { href?: string }) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Link href={href}>
      <Button icon={<ArrowLeftOutlined />} size={isMobile ? "small" : "middle"}>
        {isMobile ? "Lại" : "Quay lại"}
      </Button>
    </Link>
  );
}
