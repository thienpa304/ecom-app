"use client";

import {
  CheckCircleOutlined,
  PhoneOutlined,
  ShoppingOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Statistic } from "antd";
import Link from "next/link";

type Props = {
  products: number;
  published: number;
  brands: number;
  leads: number;
};

export function DashboardStats({
  products,
  published,
  brands,
  leads,
}: Props) {
  const cards = [
    {
      label: "Sản phẩm",
      value: products,
      href: "/products",
      icon: <ShoppingOutlined />,
    },
    {
      label: "Đã xuất bản",
      value: published,
      href: "/products?published=1",
      icon: <CheckCircleOutlined />,
    },
    {
      label: "Thương hiệu",
      value: brands,
      href: "/brands",
      icon: <TagsOutlined />,
    },
    {
      label: "Leads",
      value: leads,
      href: "/leads",
      icon: <PhoneOutlined />,
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {cards.map((card) => (
        <Col key={card.label} xs={24} sm={12} lg={6}>
          <Link href={card.href} style={{ display: "block" }}>
            <Card hoverable>
              <Statistic
                title={card.label}
                value={card.value}
                prefix={card.icon}
              />
            </Card>
          </Link>
        </Col>
      ))}
    </Row>
  );
}
