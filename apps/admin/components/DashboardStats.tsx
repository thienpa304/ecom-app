"use client";

import {
  CheckCircleOutlined,
  PhoneOutlined,
  ShoppingOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Statistic, theme } from "antd";
import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  products: number;
  published: number;
  brands: number;
  leads: number;
};

type Tone = "primary" | "success" | "warning" | "info";

function iconChip(
  icon: ReactNode,
  tone: Tone,
  token: ReturnType<typeof theme.useToken>["token"],
) {
  const map: Record<Tone, { bg: string; color: string }> = {
    primary: { bg: token.colorPrimaryBg, color: token.colorPrimary },
    success: { bg: token.colorSuccessBg, color: token.colorSuccess },
    warning: { bg: token.colorWarningBg, color: token.colorWarning },
    info: { bg: token.colorInfoBg, color: token.colorInfo },
  };
  const c = map[tone];
  return (
    <span className="admin-stat-icon" style={{ background: c.bg, color: c.color }}>
      {icon}
    </span>
  );
}

export function DashboardStats({
  products,
  published,
  brands,
  leads,
}: Props) {
  const { token } = theme.useToken();

  const cards: {
    label: string;
    value: number;
    href: string;
    icon: ReactNode;
    tone: Tone;
  }[] = [
    {
      label: "Sản phẩm",
      value: products,
      href: "/products",
      icon: <ShoppingOutlined />,
      tone: "primary",
    },
    {
      label: "Đã xuất bản",
      value: published,
      href: "/products?published=1",
      icon: <CheckCircleOutlined />,
      tone: "success",
    },
    {
      label: "Thương hiệu",
      value: brands,
      href: "/brands",
      icon: <TagsOutlined />,
      tone: "warning",
    },
    {
      label: "Leads",
      value: leads,
      href: "/leads",
      icon: <PhoneOutlined />,
      tone: "info",
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {cards.map((card) => (
        <Col key={card.label} xs={24} sm={12} lg={6}>
          <Link href={card.href} style={{ display: "block" }}>
            <Card
              hoverable
              styles={{
                body: {
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: 20,
                },
              }}
            >
              {iconChip(card.icon, card.tone, token)}
              <Statistic
                title={card.label}
                value={card.value}
                valueStyle={{ fontWeight: 600, fontSize: 28 }}
              />
            </Card>
          </Link>
        </Col>
      ))}
    </Row>
  );
}
