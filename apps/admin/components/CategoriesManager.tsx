"use client";

import { DeleteOutlined } from "@ant-design/icons";
import type { Category } from "@ecom/shared";
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Table,
} from "antd";
import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import {
  createCategoryAction,
  deleteCategoryAction,
} from "@/lib/actions/categories";

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const [form] = Form.useForm();
  const router = useRouter();
  const { modal, message } = App.useApp();
  const [pending, startTransition] = useTransition();

  const nameMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  async function onCreate(values: {
    name: string;
    slug?: string;
    parentId?: string;
    sortOrder?: number;
  }) {
    const fd = new FormData();
    fd.set("name", values.name);
    fd.set("slug", values.slug ?? "");
    fd.set("parentId", values.parentId ?? "");
    fd.set("sortOrder", String(values.sortOrder ?? 0));
    startTransition(async () => {
      try {
        await createCategoryAction(fd);
        form.resetFields();
        message.success("Đã thêm danh mục");
        router.refresh();
      } catch {
        message.error("Không thêm được danh mục");
      }
    });
  }

  function onDelete(id: string, name: string) {
    modal.confirm({
      title: "Xóa danh mục?",
      content: `Xóa “${name}”?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          startTransition(async () => {
            try {
              await deleteCategoryAction(id);
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
        <Card title="Thêm danh mục" loading={pending}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onCreate}
            initialValues={{ sortOrder: 0 }}
          >
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
            <Form.Item label="Danh mục cha" name="parentId">
              <Select
                allowClear
                placeholder="— Không —"
                options={categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
            </Form.Item>
            <Form.Item label="Thứ tự" name="sortOrder">
              <InputNumber style={{ width: "100%" }} />
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
            dataSource={categories}
            pagination={false}
            columns={[
              { title: "Tên", dataIndex: "name" },
              { title: "Slug", dataIndex: "slug" },
              {
                title: "Cha",
                dataIndex: "parentId",
                render: (id: string | null) =>
                  id ? (nameMap[id] ?? id) : "—",
              },
              { title: "Thứ tự", dataIndex: "sortOrder", width: 90 },
              {
                title: "Thao tác",
                width: 100,
                render: (_: unknown, c: Category) => (
                  <Button
                    type="link"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete(c.id, c.name)}
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
