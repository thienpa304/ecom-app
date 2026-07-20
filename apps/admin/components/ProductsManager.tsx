"use client";

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { Brand, Category, Product } from "@ecom/shared";
import { STOCK_STATUS } from "@ecom/shared";
import {
  App,
  Button,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import {
  deleteProductAction,
  togglePublishAction,
} from "@/lib/actions/products";
import { formatVnd } from "@/lib/format";

type Props = {
  products: Product[];
  brands: Brand[];
  categories: Category[];
  filters: {
    q?: string;
    brand?: string;
    published?: string;
  };
};

export function ProductsManager({
  products,
  brands,
  categories,
  filters,
}: Props) {
  const router = useRouter();
  const { modal, message } = App.useApp();
  const [pending, startTransition] = useTransition();

  const brandMap = useMemo(
    () => Object.fromEntries(brands.map((b) => [b.id, b.name])),
    [brands],
  );
  const catMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  function applyFilters(values: {
    q?: string;
    brand?: string;
    published?: string;
  }) {
    const params = new URLSearchParams();
    if (values.q?.trim()) params.set("q", values.q.trim());
    if (values.brand) params.set("brand", values.brand);
    if (values.published) params.set("published", values.published);
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  }

  function onToggle(id: string) {
    startTransition(async () => {
      try {
        await togglePublishAction(id);
        message.success("Đã cập nhật trạng thái xuất bản");
        router.refresh();
      } catch {
        message.error("Không cập nhật được");
      }
    });
  }

  function onDelete(id: string, name: string) {
    modal.confirm({
      title: "Xóa sản phẩm?",
      content: `Xóa “${name}”? Thao tác không hoàn tác.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          startTransition(async () => {
            try {
              await deleteProductAction(id);
              message.success("Đã xóa sản phẩm");
              router.refresh();
              resolve();
            } catch {
              message.error("Không xóa được");
              reject();
            }
          });
        }),
    });
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Form
        layout="inline"
        onFinish={applyFilters}
        initialValues={{
          q: filters.q ?? "",
          brand: filters.brand ?? undefined,
          published: filters.published ?? undefined,
        }}
        style={{
          rowGap: 12,
          padding: 16,
          background: "#fff",
          borderRadius: 8,
        }}
      >
        <Form.Item name="q" label="Tìm kiếm">
          <Input allowClear placeholder="Tên, model…" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="brand" label="Thương hiệu">
          <Select
            allowClear
            placeholder="Tất cả"
            style={{ width: 160 }}
            options={brands.map((b) => ({ value: b.id, label: b.name }))}
          />
        </Form.Item>
        <Form.Item name="published" label="Xuất bản">
          <Select
            allowClear
            placeholder="Tất cả"
            style={{ width: 140 }}
            options={[
              { value: "1", label: "Đã xuất bản" },
              { value: "0", label: "Nháp" },
            ]}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Lọc
          </Button>
        </Form.Item>
        <Form.Item style={{ marginInlineStart: "auto" }}>
          <Link href="/products/new">
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm sản phẩm
            </Button>
          </Link>
        </Form.Item>
      </Form>

      <Table
        rowKey="id"
        loading={pending}
        dataSource={products}
        scroll={{ x: 900 }}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        locale={{ emptyText: "Không có sản phẩm." }}
        columns={[
          {
            title: "Sản phẩm",
            dataIndex: "name",
            render: (_: unknown, p: Product) => (
              <>
                <Typography.Text strong>{p.name}</Typography.Text>
                <br />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {p.model}
                </Typography.Text>
              </>
            ),
          },
          {
            title: "Thương hiệu",
            dataIndex: "brandId",
            width: 120,
            render: (id: string) => brandMap[id] ?? "—",
          },
          {
            title: "Danh mục",
            dataIndex: "categoryId",
            width: 140,
            render: (id: string) => catMap[id] ?? "—",
          },
          {
            title: "Giá",
            width: 140,
            render: (_: unknown, p: Product) =>
              p.salePrice != null ? (
                <>
                  <Typography.Text type="danger" strong>
                    {formatVnd(p.salePrice)}
                  </Typography.Text>
                  <br />
                  <Typography.Text
                    delete
                    type="secondary"
                    style={{ fontSize: 12 }}
                  >
                    {formatVnd(p.price)}
                  </Typography.Text>
                </>
              ) : (
                formatVnd(p.price)
              ),
          },
          {
            title: "Kho",
            width: 120,
            dataIndex: "stockStatus",
            render: (s: Product["stockStatus"]) => STOCK_STATUS[s].labelVi,
          },
          {
            title: "XB",
            width: 100,
            dataIndex: "isPublished",
            render: (published: boolean, p: Product) => (
              <Tag
                color={published ? "success" : "default"}
                style={{ cursor: "pointer" }}
                onClick={() => onToggle(p.id)}
              >
                {published ? "Đã XB" : "Nháp"}
              </Tag>
            ),
          },
          {
            title: "Thao tác",
            width: 140,
            fixed: "right",
            render: (_: unknown, p: Product) => (
              <Space>
                <Link href={`/products/${p.id}/edit`}>
                  <Button type="link" size="small" icon={<EditOutlined />}>
                    Sửa
                  </Button>
                </Link>
                <Button
                  type="link"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(p.id, p.name)}
                >
                  Xóa
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </Space>
  );
}
