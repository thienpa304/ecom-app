"use client";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { Brand } from "@ecom/shared";
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Grid,
  Input,
  Row,
  Space,
  Table,
} from "antd";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createBrandAction,
  deleteBrandAction,
  updateBrandAction,
} from "@/lib/actions/brands";

type BrandFormValues = {
  name: string;
  slug?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
};

export function BrandsManager({ brands }: { brands: Brand[] }) {
  const [form] = Form.useForm<BrandFormValues>();
  const router = useRouter();
  const { modal, message } = App.useApp();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Brand | null>(null);
  const isMobile = !Grid.useBreakpoint().md;

  function onEdit(brand: Brand) {
    setEditing(brand);
    form.setFieldsValue({
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      metaTitle: brand.metaTitle,
      metaDescription: brand.metaDescription,
    });
  }

  function onCancelEdit() {
    setEditing(null);
    form.resetFields();
  }

  async function onSubmit(values: BrandFormValues) {
    const fd = new FormData();
    fd.set("name", values.name);
    fd.set("slug", values.slug ?? "");
    fd.set("description", values.description ?? "");
    fd.set("metaTitle", values.metaTitle ?? "");
    fd.set("metaDescription", values.metaDescription ?? "");
    const target = editing;
    startTransition(async () => {
      try {
        if (target) {
          await updateBrandAction(target.id, fd);
          setEditing(null);
          form.resetFields();
          message.success("Đã lưu thương hiệu");
        } else {
          await createBrandAction(fd);
          form.resetFields();
          message.success("Đã thêm thương hiệu");
        }
        router.refresh();
      } catch {
        message.error(
          target ? "Không lưu được thương hiệu" : "Không thêm được thương hiệu",
        );
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
              if (editing?.id === id) {
                onCancelEdit();
              }
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
        <Card
          title={editing ? `Sửa “${editing.name}”` : "Thêm thương hiệu"}
          loading={pending}
        >
          <Form form={form} layout="vertical" onFinish={onSubmit}>
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
            <Form.Item
              label="Mô tả thương hiệu"
              name="description"
              extra="Hiện ở đầu trang /thuong-hieu/<slug>. Viết 2-3 đoạn giới thiệu thật về hãng — Google đánh giá thấp trang chỉ có lưới sản phẩm."
            >
              <Input.TextArea rows={5} />
            </Form.Item>
            <Form.Item
              label="Meta title"
              name="metaTitle"
              extra="Tiêu đề trên Google. Bỏ trống sẽ tự sinh từ tên thương hiệu."
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Meta description"
              name="metaDescription"
              extra="Đoạn mô tả dưới tiêu đề trên Google, khoảng 150-160 ký tự."
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={pending}>
                {editing ? "Lưu" : "Thêm"}
              </Button>
              {editing ? <Button onClick={onCancelEdit}>Hủy</Button> : null}
            </Space>
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
            scroll={{ x: 480 }}
            columns={[
              { title: "Tên", dataIndex: "name" },
              { title: "Slug", dataIndex: "slug" },
              {
                title: "Thao tác",
                width: 170,
                render: (_: unknown, b: Brand) => (
                  <Space size={0}>
                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => onEdit(b)}
                    >
                      Sửa
                    </Button>
                    <Button
                      type="link"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => onDelete(b.id, b.name)}
                    >
                      Xóa
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      </Col>
    </Row>
  );
}
