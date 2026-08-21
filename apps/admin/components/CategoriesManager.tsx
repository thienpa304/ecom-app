"use client";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { Category } from "@ecom/shared";
import {
  Alert,
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
  Table,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  createCategoryAction,
  deleteCategoryAction,
  reorderCategoriesAction,
  updateCategoryAction,
} from "@/lib/actions/categories";

const ROOT_KEY = "";
const INDENT_PX = 20;

type CategoryFormValues = {
  name: string;
  slug?: string;
  parentId?: string | null;
  sortOrder?: number;
};

type CategoryTreeRow = Category & {
  depth: number;
  siblingIds: string[];
  siblingIndex: number;
};

/** Groups categories by parent, each group sorted the same way the web nav sorts. */
function buildSiblingGroups(categories: Category[]): Map<string, Category[]> {
  const known = new Set(categories.map((c) => c.id));
  const groups = new Map<string, Category[]>();

  for (const category of categories) {
    const key =
      category.parentId && known.has(category.parentId)
        ? category.parentId
        : ROOT_KEY;
    const group = groups.get(key) ?? [];
    group.push(category);
    groups.set(key, group);
  }

  for (const group of groups.values()) {
    group.sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "vi"),
    );
  }

  return groups;
}

/**
 * Flattens the category tree into display order (parent, then its children).
 * The `seen` set makes this terminate even if the stored rows contain a cycle;
 * anything unreachable from the root is appended at the end so it stays editable.
 */
function flattenTree(categories: Category[]): CategoryTreeRow[] {
  const groups = buildSiblingGroups(categories);
  const rows: CategoryTreeRow[] = [];
  const seen = new Set<string>();

  function walk(parentKey: string, depth: number): void {
    const group = groups.get(parentKey) ?? [];
    const siblingIds = group.map((c) => c.id);

    group.forEach((category, siblingIndex) => {
      if (seen.has(category.id)) return;
      seen.add(category.id);
      rows.push({ ...category, depth, siblingIds, siblingIndex });
      walk(category.id, depth + 1);
    });
  }

  walk(ROOT_KEY, 0);

  for (const category of categories) {
    if (seen.has(category.id)) continue;
    rows.push({
      ...category,
      depth: 0,
      siblingIds: [category.id],
      siblingIndex: 0,
    });
  }

  return rows;
}

/** `id` plus every descendant — these can never be its own parent. */
function collectSelfAndDescendants(
  categories: Category[],
  id: string,
): Set<string> {
  const blocked = new Set<string>([id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const category of categories) {
      if (blocked.has(category.id)) continue;
      if (category.parentId && blocked.has(category.parentId)) {
        blocked.add(category.id);
        grew = true;
      }
    }
  }
  return blocked;
}

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const [form] = Form.useForm<CategoryFormValues>();
  const router = useRouter();
  const { modal, message } = App.useApp();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Category | null>(null);
  const [nameFilter, setNameFilter] = useState("");
  const isMobile = !Grid.useBreakpoint().md;

  const nameMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const treeRows = useMemo(() => flattenTree(categories), [categories]);

  const normalizedFilter = nameFilter.trim().toLowerCase();
  const isFiltering = normalizedFilter.length > 0;

  const visibleRows = useMemo(
    () =>
      normalizedFilter
        ? treeRows.filter((row) =>
            row.name.toLowerCase().includes(normalizedFilter),
          )
        : treeRows,
    [treeRows, normalizedFilter],
  );

  // While editing X, X and its whole subtree must disappear from the parent
  // picker — picking one would create a cycle and break listCategoryNav() on web.
  const blockedParentIds = useMemo(
    () =>
      editing
        ? collectSelfAndDescendants(categories, editing.id)
        : new Set<string>(),
    [categories, editing],
  );

  const parentOptions = useMemo(
    () =>
      treeRows
        .filter((row) => !blockedParentIds.has(row.id))
        .map((row) => ({
          value: row.id,
          label: `${"— ".repeat(row.depth)}${row.name}`,
        })),
    [treeRows, blockedParentIds],
  );

  function onEdit(category: Category) {
    setEditing(category);
    form.setFieldsValue({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId ?? undefined,
      sortOrder: category.sortOrder,
    });
  }

  function onCancelEdit() {
    setEditing(null);
    form.resetFields();
  }

  async function onSubmit(values: CategoryFormValues) {
    const fd = new FormData();
    fd.set("name", values.name);
    fd.set("slug", values.slug ?? "");
    fd.set("parentId", values.parentId ?? "");
    fd.set("sortOrder", String(values.sortOrder ?? 0));

    const target = editing;
    startTransition(async () => {
      try {
        if (target) {
          await updateCategoryAction(target.id, fd);
          setEditing(null);
          form.resetFields();
          message.success("Đã lưu danh mục");
        } else {
          await createCategoryAction(fd);
          form.resetFields();
          message.success("Đã thêm danh mục");
        }
        router.refresh();
      } catch {
        message.error(
          target ? "Không lưu được danh mục" : "Không thêm được danh mục",
        );
      }
    });
  }

  function onMove(row: CategoryTreeRow, direction: -1 | 1) {
    const swapWith = row.siblingIndex + direction;
    if (swapWith < 0 || swapWith >= row.siblingIds.length) return;

    // Only the sibling group is renumbered — never the whole flat table.
    const ids = [...row.siblingIds];
    ids[row.siblingIndex] = ids[swapWith];
    ids[swapWith] = row.id;

    startTransition(async () => {
      try {
        await reorderCategoriesAction(ids);
        router.refresh();
      } catch {
        message.error("Không đổi được thứ tự");
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
          title={editing ? `Sửa “${editing.name}”` : "Thêm danh mục"}
          loading={pending}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            initialValues={{ sortOrder: 0 }}
          >
            <Form.Item
              label="Tên"
              name="name"
              rules={[{ required: true, message: "Nhập tên" }]}
            >
              <Input />
            </Form.Item>
            {editing ? (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
                message="Đổi slug sẽ làm hỏng URL đã được Google index"
                description={`Trang /danh-muc/${editing.slug} sẽ trả về 404 sau khi lưu. Chỉ đổi khi bạn chấp nhận mất thứ hạng tìm kiếm của danh mục này.`}
              />
            ) : null}
            <Form.Item label="Slug (tuỳ chọn)" name="slug">
              <Input />
            </Form.Item>
            <Form.Item
              label="Danh mục cha"
              name="parentId"
              extra={
                editing
                  ? "Danh mục đang sửa và các danh mục con của nó không xuất hiện trong danh sách."
                  : undefined
              }
            >
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="— Không —"
                options={parentOptions}
              />
            </Form.Item>
            <Form.Item label="Thứ tự" name="sortOrder">
              <InputNumber style={{ width: "100%" }} />
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
          <Space
            direction="vertical"
            size="small"
            style={{ width: "100%", marginBottom: 12 }}
          >
            <Input
              allowClear
              placeholder="Lọc theo tên danh mục…"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              style={{ maxWidth: 320 }}
            />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {isFiltering
                ? "Đang lọc — xóa ô tìm kiếm để đổi thứ tự bằng ↑ ↓."
                : "Danh mục con được thụt vào dưới danh mục cha. ↑ ↓ chỉ đổi chỗ giữa các danh mục cùng cấp."}
            </Typography.Text>
          </Space>
          <Table
            rowKey="id"
            dataSource={visibleRows}
            size={isMobile ? "small" : "middle"}
            pagination={false}
            scroll={{ x: 620 }}
            locale={{ emptyText: "Không có danh mục nào khớp." }}
            columns={[
              {
                title: "Tên",
                dataIndex: "name",
                render: (name: string, row: CategoryTreeRow) => (
                  <span style={{ paddingLeft: row.depth * INDENT_PX }}>
                    {row.depth > 0 ? (
                      <Typography.Text type="secondary">└ </Typography.Text>
                    ) : null}
                    {name}
                  </span>
                ),
              },
              { title: "Slug", dataIndex: "slug" },
              {
                title: "Cha",
                dataIndex: "parentId",
                responsive: ["md"],
                render: (id: string | null) =>
                  id ? (nameMap[id] ?? id) : "—",
              },
              { title: "Thứ tự", dataIndex: "sortOrder", width: 90 },
              {
                title: "Đổi chỗ",
                width: 90,
                render: (_: unknown, row: CategoryTreeRow) => (
                  <Space size={0}>
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowUpOutlined />}
                      disabled={pending || isFiltering || row.siblingIndex === 0}
                      onClick={() => onMove(row, -1)}
                      aria-label="Lên trên"
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowDownOutlined />}
                      disabled={
                        pending ||
                        isFiltering ||
                        row.siblingIndex === row.siblingIds.length - 1
                      }
                      onClick={() => onMove(row, 1)}
                      aria-label="Xuống dưới"
                    />
                  </Space>
                ),
              },
              {
                title: "Thao tác",
                width: isMobile ? 96 : 150,
                render: (_: unknown, row: CategoryTreeRow) => (
                  <Space size={0}>
                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => onEdit(row)}
                    >
                      {isMobile ? null : "Sửa"}
                    </Button>
                    <Button
                      type="link"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => onDelete(row.id, row.name)}
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
