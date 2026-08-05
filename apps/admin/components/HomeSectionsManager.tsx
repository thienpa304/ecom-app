"use client";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  HOME_SECTION_KIND_LABELS,
  HOME_SECTION_PRODUCT_COUNT,
  type Category,
  type HomeSection,
  type HomeSectionKind,
  type HomeSectionStyle,
} from "@ecom/shared";
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Grid,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  createHomeSectionAction,
  deleteHomeSectionAction,
  reorderHomeSectionsAction,
  setHomeSectionPublishedAction,
  updateHomeSectionAction,
} from "@/lib/actions/home-sections";

type HomeSectionFormValues = {
  title: string;
  kind: HomeSectionKind;
  categoryId?: string | null;
  productLimit?: number;
  style: HomeSectionStyle;
  isPublished: boolean;
};

const KIND_OPTIONS = (
  Object.keys(HOME_SECTION_KIND_LABELS) as HomeSectionKind[]
).map((kind) => ({ value: kind, label: HOME_SECTION_KIND_LABELS[kind] }));

const STYLE_OPTIONS: { value: HomeSectionStyle; label: string }[] = [
  { value: "plain", label: "Thường" },
  { value: "red_banner", label: "Banner đỏ" },
];

const STYLE_LABELS: Record<HomeSectionStyle, string> = {
  plain: "Thường",
  red_banner: "Banner đỏ",
};

export function HomeSectionsManager({
  sections,
  categories,
}: {
  sections: HomeSection[];
  categories: Category[];
}) {
  const [form] = Form.useForm<HomeSectionFormValues>();
  const router = useRouter();
  const { modal, message } = App.useApp();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<HomeSection | null>(null);
  const isMobile = !Grid.useBreakpoint().md;
  const kind = Form.useWatch("kind", form);

  const ordered = useMemo(
    () => [...sections].sort((a, b) => a.sortOrder - b.sortOrder),
    [sections],
  );

  const categoryNameMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const nextSortOrder = useMemo(
    () =>
      ordered.reduce((max, section) => Math.max(max, section.sortOrder), 0) + 1,
    [ordered],
  );

  function onEdit(section: HomeSection) {
    setEditing(section);
    form.setFieldsValue({
      title: section.title,
      kind: section.kind,
      categoryId: section.categoryId,
      productLimit: section.productLimit,
      style: section.style,
      isPublished: section.isPublished,
    });
  }

  function onCancelEdit() {
    setEditing(null);
    form.resetFields();
  }

  async function onSubmit(values: HomeSectionFormValues) {
    const fd = new FormData();
    fd.set("title", values.title);
    fd.set("kind", values.kind);
    fd.set(
      "categoryId",
      values.kind === "category" ? (values.categoryId ?? "") : "",
    );
    fd.set(
      "productLimit",
      String(values.productLimit ?? HOME_SECTION_PRODUCT_COUNT),
    );
    fd.set("style", values.style);
    fd.set(
      "sortOrder",
      String(editing ? editing.sortOrder : nextSortOrder),
    );
    if (values.isPublished) fd.set("isPublished", "on");

    const target = editing;
    startTransition(async () => {
      try {
        if (target) {
          await updateHomeSectionAction(target.id, fd);
          setEditing(null);
          form.resetFields();
          message.success("Đã lưu section");
        } else {
          await createHomeSectionAction(fd);
          form.resetFields();
          message.success("Đã thêm section");
        }
        router.refresh();
      } catch {
        message.error(
          target ? "Không lưu được section" : "Không thêm được section",
        );
      }
    });
  }

  function onMove(id: string, direction: -1 | 1) {
    const index = ordered.findIndex((section) => section.id === id);
    const swapWith = index + direction;
    if (index < 0 || swapWith < 0 || swapWith >= ordered.length) return;

    const ids = ordered.map((section) => section.id);
    const moved = ids[index];
    const neighbour = ids[swapWith];
    ids[index] = neighbour;
    ids[swapWith] = moved;

    startTransition(async () => {
      try {
        await reorderHomeSectionsAction(ids);
        router.refresh();
      } catch {
        message.error("Không đổi được thứ tự");
      }
    });
  }

  function onTogglePublished(section: HomeSection) {
    startTransition(async () => {
      try {
        await setHomeSectionPublishedAction(section.id, !section.isPublished);
        message.success(section.isPublished ? "Đã ẩn section" : "Đã hiện section");
        router.refresh();
      } catch {
        message.error("Không đổi được trạng thái");
      }
    });
  }

  function onDelete(section: HomeSection) {
    modal.confirm({
      title: "Xóa section?",
      content: `Xóa “${section.title}” khỏi trang chủ?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          startTransition(async () => {
            try {
              await deleteHomeSectionAction(section.id);
              if (editing?.id === section.id) {
                onCancelEdit();
              }
              message.success("Đã xóa");
              router.refresh();
              resolve();
            } catch {
              message.error("Không xóa được section");
              reject();
            }
          });
        }),
    });
  }

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={9}>
        <Card
          title={editing ? `Sửa “${editing.title}”` : "Thêm section"}
          loading={pending}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            initialValues={{
              kind: "category",
              style: "plain",
              productLimit: HOME_SECTION_PRODUCT_COUNT,
              isPublished: true,
            }}
          >
            <Form.Item
              label="Tiêu đề"
              name="title"
              rules={[{ required: true, message: "Nhập tiêu đề" }]}
              extra="Chữ in hoa sẽ hiển thị đúng như bạn gõ, ví dụ: MÁY PHÁT ĐIỆN."
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Loại"
              name="kind"
              rules={[{ required: true, message: "Chọn loại section" }]}
            >
              <Select options={KIND_OPTIONS} />
            </Form.Item>

            {kind === "category" ? (
              <Form.Item
                label="Danh mục"
                name="categoryId"
                rules={[{ required: true, message: "Chọn danh mục" }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Chọn danh mục"
                  options={categories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                />
              </Form.Item>
            ) : null}

            <Form.Item
              label="Số sản phẩm"
              name="productLimit"
              extra="Số sản phẩm tối đa hiển thị trong section."
            >
              <InputNumber min={1} max={48} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="Kiểu hiển thị" name="style">
              <Select options={STYLE_OPTIONS} />
            </Form.Item>

            <Form.Item
              label="Hiện trên web"
              name="isPublished"
              valuePropName="checked"
            >
              <Switch />
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

      <Col xs={24} lg={15}>
        <Card>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
            Thứ tự trong bảng chính là thứ tự các khối trên trang chủ. Dùng ↑ ↓
            để sắp xếp lại.
          </Typography.Paragraph>
          <Table
            rowKey="id"
            dataSource={ordered}
            size={isMobile ? "small" : "middle"}
            pagination={false}
            scroll={{ x: 720 }}
            columns={[
              {
                title: "#",
                width: 56,
                render: (_: unknown, __: HomeSection, index: number) =>
                  index + 1,
              },
              { title: "Tiêu đề", dataIndex: "title" },
              {
                title: "Loại",
                dataIndex: "kind",
                width: 150,
                render: (value: HomeSectionKind, section: HomeSection) =>
                  value === "category"
                    ? (categoryNameMap[section.categoryId ?? ""] ??
                      HOME_SECTION_KIND_LABELS[value])
                    : HOME_SECTION_KIND_LABELS[value],
              },
              {
                title: "SP",
                dataIndex: "productLimit",
                width: 70,
                responsive: ["sm"],
              },
              {
                title: "Kiểu",
                dataIndex: "style",
                width: 110,
                responsive: ["md"],
                render: (value: HomeSectionStyle) => (
                  <Tag color={value === "red_banner" ? "red" : "default"}>
                    {STYLE_LABELS[value]}
                  </Tag>
                ),
              },
              {
                title: "Hiện",
                dataIndex: "isPublished",
                width: 80,
                render: (value: boolean, section: HomeSection) => (
                  <Switch
                    size="small"
                    checked={value}
                    disabled={pending}
                    onChange={() => onTogglePublished(section)}
                    aria-label={value ? "Ẩn section" : "Hiện section"}
                  />
                ),
              },
              {
                title: "Thứ tự",
                width: 90,
                render: (_: unknown, section: HomeSection, index: number) => (
                  <Space size={0}>
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowUpOutlined />}
                      disabled={pending || index === 0}
                      onClick={() => onMove(section.id, -1)}
                      aria-label="Lên trên"
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowDownOutlined />}
                      disabled={pending || index === ordered.length - 1}
                      onClick={() => onMove(section.id, 1)}
                      aria-label="Xuống dưới"
                    />
                  </Space>
                ),
              },
              {
                title: "Thao tác",
                width: isMobile ? 96 : 150,
                render: (_: unknown, section: HomeSection) => (
                  <Space size={0}>
                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => onEdit(section)}
                    >
                      {isMobile ? null : "Sửa"}
                    </Button>
                    <Button
                      type="link"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => onDelete(section)}
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
