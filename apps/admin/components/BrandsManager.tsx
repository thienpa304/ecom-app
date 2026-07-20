"use client";

import { DeleteOutlined } from "@ant-design/icons";
import type { Brand } from "@ecom/shared";
import { App, Button, Card, Col, Form, Grid, Input, Row, Table } from "antd";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createBrandAction, deleteBrandAction } from "@/lib/actions/brands";

export function BrandsManager({ brands }: { brands: Brand[] }) {
  const [form] = Form.useForm();
  const router = useRouter();
  const { modal, message } = App.useApp();
  const [pending, startTransition] = useTransition();
  const isMobile = !Grid.useBreakpoint().md;

  async function onCreate(values: { name: string; slug?: string }) {
    const fd = new FormData();
    fd.set("name", values.name);
    fd.set("slug", values.slug ?? "");
    startTransition(async () => {
      try {
        await createBrandAction(fd);
        form.resetFields();
        message.success("Đã thêm thương hiệu");
        router.refresh();
      } catch {
        message.error("Không thêm được thương hiệu");
      }
    });
  }

  function onDelete(id: string, name: string) {
    modal.confirm({
      title: "Xóa thương hiệu?",
      content: `Xóa “${name}”?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          startTransition(async () => {
            try {
              await deleteBrandAction(id);
              message.success("Đã xóa");
              router.refresh();
              resolve();
            } catch {
              message.error("Không xóa được (có thể đang được dùng)");
              reject();
            }
          });
        }),
    });
  }

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={8}>
        <Card title="Thêm thương hiệu" loading={pending}>
          <Form form={form} layout="vertical" onFinish={onCreate}>
            <Form.Item
              label="Tên"
              name="name"
              rules={[{ required: true, message: "Nhập tên" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Slug (tuỳ chọn)" name="slug">
              <Input />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={pending}>
              Thêm
            </Button>
          </Form>
        </Card>
      </Col>
      <Col xs={24} lg={16}>
        <Card>
          <Table
            rowKey="id"
            dataSource={brands}
            size={isMobile ? "small" : "middle"}
            pagination={false}
            scroll={{ x: 360 }}
            columns={[
              { title: "Tên", dataIndex: "name" },
              { title: "Slug", dataIndex: "slug" },
              {
                title: "Thao tác",
                width: 100,
                render: (_: unknown, b: Brand) => (
                  <Button
                    type="link"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete(b.id, b.name)}
                  >
                    Xóa
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      </Col>
    </Row>
  );
}
