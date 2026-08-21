"use client";

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { Brand, Category } from "@ecom/shared";
import { STOCK_STATUS } from "@ecom/shared";
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Grid,
  Input,
  Row,
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
import type { ProductListItem, ProductSort } from "@/lib/store";

const DEFAULT_PAGE_SIZE = 20;

/**
 * `price` is the list price column; `sale_price` is the optional discount, so
 * the labels say "giá gốc" to make clear which number the ordering uses.
 */
const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "created_desc", label: "Mới nhất" },
  { value: "name_asc", label: "Tên A → Z" },
  { value: "name_desc", label: "Tên Z → A" },
  { value: "price_asc", label: "Giá gốc tăng dần" },
  { value: "price_desc", label: "Giá gốc giảm dần" },
];

type ProductFilters = {
  q?: string;
  brand?: string;
  category?: string;
  published?: string;
  sort?: string;
};

type Props = {
  products: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  brands: Brand[];
  categories: Category[];
  filters: ProductFilters;
};

export function ProductsManager({
  products,
  total,
  page,
  pageSize,
  brands,
  categories,
  filters,
}: Props) {
  const router = useRouter();
  const { modal, message } = App.useApp();
  const [pending, startTransition] = useTransition();
  const [filterForm] = Form.useForm<ProductFilters>();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const brandMap = useMemo(
    () => Object.fromEntries(brands.map((b) => [b.id, b.name])),
    [brands],
  );
  const catMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  // Child names alone are ambiguous ("Máy nổ" can sit under several parents),
  // so the option label carries the parent name.
  const categoryOptions = useMemo(() => {
    const names = new Map(categories.map((c) => [c.id, c.name]));
    return categories
      .map((c) => ({
        value: c.id,
        label: c.parentId
          ? `${names.get(c.parentId) ?? "?"} › ${c.name}`
          : c.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "vi"));
  }, [categories]);

  // A key present in `next` always wins, even when its value is undefined —
  // that is what lets "allowClear" on a Select actually drop the filter.
  function pushQuery(
    next: ProductFilters & { page?: number; pageSize?: number },
  ) {
    const params = new URLSearchParams();
    const pick = <K extends keyof ProductFilters>(key: K) =>
      key in next ? next[key] : filters[key];

    const q = pick("q");
    const brand = pick("brand");
    const category = pick("category");
    const published = pick("published");
    const sort = pick("sort");
    const p = next.page ?? page;
    const ps = next.pageSize ?? pageSize;

    if (q?.trim()) params.set("q", q.trim());
    if (brand) params.set("brand", brand);
    if (category) params.set("category", category);
    if (published) params.set("published", published);
    if (sort && sort !== "created_desc") params.set("sort", sort);
    if (p > 1) params.set("page", String(p));
    if (ps !== DEFAULT_PAGE_SIZE) params.set("pageSize", String(ps));

    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  }

  function applyFilters(values: ProductFilters) {
    pushQuery({
      q: values.q,
      brand: values.brand,
      category: values.category,
      published: values.published,
      sort: values.sort,
      page: 1,
    });
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
      <Card size="small">
        <Form
          form={filterForm}
          layout={isMobile ? "vertical" : "inline"}
          onFinish={applyFilters}
          initialValues={{
            q: filters.q ?? "",
            brand: filters.brand ?? undefined,
            category: filters.category ?? undefined,
            published: filters.published ?? undefined,
            sort: filters.sort ?? "created_desc",
          }}
        >
          <Row gutter={[12, 0]} style={{ width: "100%" }}>
            <Col xs={24} md={8} lg={6}>
              <Form.Item name="q" label="Tìm kiếm" style={{ marginBottom: 12 }}>
                <Input allowClear placeholder="Tên, model…" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Form.Item
                name="brand"
                label="Thương hiệu"
                style={{ marginBottom: 12 }}
              >
                <Select
                  allowClear
                  placeholder="Tất cả"
                  options={brands.map((b) => ({ value: b.id, label: b.name }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={5}>
              <Form.Item
                name="category"
                label="Danh mục"
                style={{ marginBottom: 12 }}
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Tất cả"
                  options={categoryOptions}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item
                name="published"
                label="Xuất bản"
                style={{ marginBottom: 12 }}
              >
                <Select
                  allowClear
                  placeholder="Tất cả"
                  options={[
                    { value: "1", label: "Đã xuất bản" },
                    { value: "0", label: "Nháp" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={5}>
              <Form.Item
                name="sort"
                label="Sắp xếp"
                style={{ marginBottom: 12 }}
              >
                <Select
                  options={SORT_OPTIONS}
                  onChange={() => filterForm.submit()}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={10} lg={24}>
              <Form.Item
                label={isMobile ? " " : undefined}
                style={{ marginBottom: 12 }}
              >
                <Space
                  wrap
                  style={{
                    width: "100%",
                    justifyContent: isMobile ? "stretch" : "flex-end",
                  }}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    block={isMobile}
                    style={isMobile ? { flex: 1 } : undefined}
                  >
                    Lọc
                  </Button>
                  <Link href="/products/new" style={{ display: "block" }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      block={isMobile}
                    >
                      {isMobile ? "Thêm" : "Thêm sản phẩm"}
                    </Button>
                  </Link>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Table
        rowKey="id"
        loading={pending}
        dataSource={products}
        size={isMobile ? "small" : "middle"}
        scroll={{ x: isMobile ? 720 : 900 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: !isMobile,
          simple: isMobile,
          showTotal: (t) => `${t} sản phẩm`,
          onChange: (p, ps) => pushQuery({ page: p, pageSize: ps }),
        }}
        locale={{ emptyText: "Không có sản phẩm." }}
        columns={[
          {
            title: "Sản phẩm",
            dataIndex: "name",
            render: (_: unknown, p: ProductListItem) => (
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
            width: 110,
            responsive: ["md"],
            render: (id: string) => brandMap[id] ?? "—",
          },
          {
            title: "Danh mục",
            dataIndex: "categoryId",
            width: 120,
            responsive: ["lg"],
            render: (id: string) => catMap[id] ?? "—",
          },
          {
            title: "Giá",
            width: 120,
            render: (_: unknown, p: ProductListItem) =>
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
            width: 100,
            dataIndex: "stockStatus",
            responsive: ["sm"],
            render: (s: ProductListItem["stockStatus"]) =>
              STOCK_STATUS[s].labelVi,
          },
          {
            title: "XB",
            width: 80,
            dataIndex: "isPublished",
            render: (published: boolean, p: ProductListItem) => (
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
            width: isMobile ? 96 : 140,
            fixed: "right",
            render: (_: unknown, p: ProductListItem) => (
              <Space size={0}>
                <Link href={`/products/${p.id}/edit`}>
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    aria-label="Sửa"
                  >
                    {isMobile ? null : "Sửa"}
                  </Button>
                </Link>
                <Button
                  type="link"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  aria-label="Xóa"
                  onClick={() => onDelete(p.id, p.name)}
                >
                  {isMobile ? null : "Xóa"}
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </Space>
  );
}
