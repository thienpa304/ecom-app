"use client";

import { Button } from "antd";
import Link from "next/link";

export function BackButton({ href = "/products" }: { href?: string }) {
  return (
    <Link href={href}>
      <Button>← Quay lại</Button>
    </Link>
  );
}
