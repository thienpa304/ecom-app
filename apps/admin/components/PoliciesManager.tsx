"use client";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { PolicyPage } from "@ecom/shared";
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Grid,
  Input,
  InputNumber,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RichTextEditor } from "@/components/RichTextEditor";
import {
  createPolicyPageAction,
  deletePolicyPageAction,
  updatePolicyPageAction,
} from "@/lib/actions/policy-pages";

type PolicyFormValues = {
  title: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  sortOrder?: number;
  isPublished?: boolean;
};

const EMPTY_FORM: PolicyFormValues = {
  title: "",
  slug: "",
  metaTitle: "",
  metaDescription: "",
  sortOrder: 0,
  isPublished: true,
};

const MIGRATION_FILE = "20260821090000_policy_pages.sql";

export function PoliciesManager({
  pages,
  tableMissing = false,
}: {
  pages: PolicyPage[];
  tableMissing?: boolean;
}) {
  const [form] = Form.useForm<PolicyFormValues>();
  const router = useRouter();
  const { modal, message } = App.useApp();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<PolicyPage | null>(null);
  const [bodyHtml, setBodyHtml] = useState("");
  const isMobile = !Grid.useBreakpoint().md;

  function onEdit(page: PolicyPage) {
    setEditing(page);
    setBodyHtml(page.body);
    form.setFieldsValue({
      title: page.title,
      slug: page.slug,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      sortOrder: page.sortOrder,
      isPublished: page.isPublished,
    });
  }

  function onCancelEdit() {
    setEditing(null);
    setBodyHtml("");
    form.resetFields();
  }

  function onSubmit(values: PolicyFormValues) {
    const fd = new FormData();
    fd.set("title", values.title);
    fd.set("slug", values.slug ?? "");
    fd.set("body", bodyHtml);
    fd.set("metaTitle", values.metaTitle ?? "");
    fd.set("metaDescription", values.metaDescription ?? "");
    fd.set("sortOrder", String(values.sortOrder ?? 0));
    if (values.isPublished) fd.set("isPublished", "on");

    const target = editing;
    startTransition(async () => {
      try {
        if (target) {
          await updatePolicyPageAction(target.id, fd);
          message.success("Đã lưu trang chính sách");
        } else {
          await createPolicyPageAction(fd);
          message.success("Đã thêm trang chính sách");
        }
        onCancelEdit();
        router.refresh();
      } catch (e) {
        message.error(
          e instanceof Error && e.message
            ? e.message
            : target
              ? "Không lưu được trang chính sách"
              : "Không thêm được trang chính sách",
        );
      }
    });
  }

  function onDelete(page: PolicyPage) {
    modal.confirm({
      title: "Xóa trang chính sách?",
      content: `“${page.title}” sẽ bị xóa vĩnh viễn và link ở footer cũng mất theo. Nếu chỉ muốn tạm ẩn, hãy bỏ tick “Xuất bản” thay vì xóa.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          startTransition(async () => {
            try {
              await deletePolicyPageAction(page.id);
              if (editing?.id === page.id) onCancelEdit();
              message.success("Đã xóa");
              router.refresh();
              resolve();
            } catch {
              message.error("Không xóa được trang chính sách");
              reject();
            }
          });
        }),
    });
  }

  if (tableMissing) {
    return (
      <Alert
        type="error"
        showIcon
        message="Chưa có bảng policy_pages trong database"
        description={
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            Mở Supabase → SQL Editor và chạy migration{" "}
            <Typography.Text code>{MIGRATION_FILE}</Typography.Text> (nằm trong
            thư mục{" "}
            <Typography.Text code>supabase/migrations</Typography.Text> của dự
            án), sau đó tải lại trang này. Trước khi chạy migration thì không
            thể thêm hay sửa trang chính sách.
          </Typography.Paragraph>
        }
      />
    );
  }

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} xl={14}>
        <Card
          title={editing ? `Sửa “${editing.title}”` : "Thêm trang chính sách"}
          loading={pending}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            initialValues={EMPTY_FORM}
          >
            <Form.Item
              label="Tiêu đề"
              name="title"
              rules={[{ required: true, message: "Nhập tiêu đề trang" }]}
              extra="Đúng tên khách quen gọi, ví dụ: Chính sách bảo hành, Chính sách đổi trả."
            >
              <Input />
            </Form.Item>

            {editing ? (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
                message="Đổi slug sẽ làm hỏng URL đã được Google index"
                description={`Trang /chinh-sach/${editing.slug} sẽ trả về 404 sau khi lưu, và link ở footer trên mọi trang cũng đổi theo. Chỉ đổi khi bạn chấp nhận mất thứ hạng tìm kiếm của trang này.`}
              />
            ) : null}

            <Form.Item
              label="Slug (tuỳ chọn)"
              name="slug"
              extra="Để trống sẽ tự tạo từ tiêu đề. URL sẽ là /chinh-sach/<slug>."
            >
              <Input placeholder="tu-tao-neu-de-trong" />
            </Form.Item>

            <Form.Item
              label="Nội dung"
              extra="Dùng H2 cho từng mục để khách quét nhanh — nội dung dài nên chia mục rõ."
            >
              <RichTextEditor
                value={bodyHtml}
                onChange={setBodyHtml}
                placeholder="Nhập nội dung trang chính sách…"
              />
            </Form.Item>

            <Form.Item
              label="Meta title"
              name="metaTitle"
              extra="Để trống sẽ dùng tiêu đề trang."
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Meta description"
              name="metaDescription"
              extra="1-2 câu hoàn chỉnh mô tả nội dung chính sách."
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={10}>
                <Form.Item
                  label="Thứ tự"
                  name="sortOrder"
                  extra="Số nhỏ hiện trước ở footer."
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={14}>
                <Form.Item
                  label="Trạng thái"
                  name="isPublished"
                  valuePropName="checked"
                >
                  <Checkbox>Xuất bản (hiện trên web)</Checkbox>
                </Form.Item>
              </Col>
            </Row>

            <Space>
              <Button type="primary" htmlType="submit" loading={pending}>
                {editing ? "Lưu" : "Thêm"}
              </Button>
              {editing ? <Button onClick={onCancelEdit}>Hủy</Button> : null}
            </Space>
          </Form>
        </Card>
      </Col>

      <Col xs={24} xl={10}>
        <Card>
          <Typography.Text
            type="secondary"
            style={{ display: "block", fontSize: 12, marginBottom: 12 }}
          >
            {pages.length} trang · {pages.filter((p) => p.isPublished).length}{" "}
            đang hiện ở footer. Web dùng ISR 60 giây nên thay đổi lên sau khoảng
            1 phút.
          </Typography.Text>
          <Table<PolicyPage>
            rowKey="id"
            dataSource={pages}
            size={isMobile ? "small" : "middle"}
            pagination={false}
            scroll={{ x: 520 }}
            locale={{ emptyText: "Chưa có trang chính sách nào." }}
            columns={[
              {
                title: "Tiêu đề",
                dataIndex: "title",
                render: (title: string, page: PolicyPage) => (
                  <Space direction="vertical" size={0}>
                    <Typography.Text strong style={{ whiteSpace: "normal" }}>
                      {title}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      /chinh-sach/{page.slug}
                    </Typography.Text>
                  </Space>
                ),
              },
              {
                title: "Thứ tự",
                dataIndex: "sortOrder",
                width: 80,
                responsive: ["md"],
              },
              {
                title: "Trạng thái",
                dataIndex: "isPublished",
                width: 110,
                render: (isPublished: boolean) =>
                  isPublished ? (
                    <Tag color="green">Đang hiện</Tag>
                  ) : (
                    <Tag>Đang ẩn</Tag>
                  ),
              },
              {
                title: "Thao tác",
                key: "actions",
                width: isMobile ? 96 : 150,
                render: (_: unknown, page: PolicyPage) => (
                  <Space size={0}>
                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => onEdit(page)}
                    >
                      {isMobile ? null : "Sửa"}
                    </Button>
                    <Button
                      type="link"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => onDelete(page)}
                    >
                      {isMobile ? null : "Xóa"}
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
