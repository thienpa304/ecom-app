"use client";

import type { Brand, Category, Product, StockStatus } from "@ecom/shared";
import { STOCK_STATUS } from "@ecom/shared";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import { useState } from "react";
import {
  ProductMediaField,
  type MediaDraftItem,
} from "@/components/media/ProductMediaFields";

type Props = {
  action: (formData: FormData) => Promise<void>;
  brands: Brand[];
  categories: Category[];
  product?: Product;
  submitLabel: string;
};

function specsToText(specs: Record<string, string>): string {
  return Object.entries(specs)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

function toDraftMedia(product?: Product): MediaDraftItem[] {
  if (!product?.media.length) return [];
  return [...product.media]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({
      id: item.id,
      kind: item.kind,
      url: item.url,
      alt: item.alt,
      storagePath: item.storagePath,
      posterUrl: item.posterUrl,
    }));
}

type FormValues = {
  name: string;
  slug?: string;
  model: string;
  brandId: string;
  categoryId: string;
  price: number;
  salePrice?: number | null;
  stockStatus: StockStatus;
  soldCount?: number;
  warranty?: string;
  origin?: string;
  motor?: string;
  specs?: string;
  description?: string;
  isPublished?: boolean;
};

export function ProductForm({
  action,
  brands,
  categories,
  product,
  submitLabel,
}: Props) {
  const [form] = Form.useForm<FormValues>();
  const [pending, setPending] = useState(false);
  const [media, setMedia] = useState<MediaDraftItem[]>(() =>
    toDraftMedia(product),
  );
  const stockKeys = Object.keys(STOCK_STATUS) as StockStatus[];

  const imageCount = media.filter((m) => m.kind === "image").length;
  const videoCount = media.filter(
    (m) => m.kind === "video" || m.kind === "embed",
  ).length;

  async function onFinish(values: FormValues) {
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("name", values.name ?? "");
      fd.set("slug", values.slug ?? "");
      fd.set("model", values.model ?? "");
      fd.set("brandId", values.brandId ?? "");
      fd.set("categoryId", values.categoryId ?? "");
      fd.set("price", String(values.price ?? 0));
      fd.set(
        "salePrice",
        values.salePrice == null || values.salePrice === undefined
          ? ""
          : String(values.salePrice),
      );
      fd.set("stockStatus", values.stockStatus ?? "in_stock");
      fd.set("soldCount", String(values.soldCount ?? 0));
      fd.set("warranty", values.warranty ?? "");
      fd.set("origin", values.origin ?? "");
      fd.set("motor", values.motor ?? "");
      fd.set("specs", values.specs ?? "");
      fd.set("mediaJson", JSON.stringify(media));
      fd.set("description", values.description ?? "");
      if (values.isPublished) fd.set("isPublished", "on");

      await action(fd);
    } finally {
      setPending(false);
    }
  }

  return (
    <Card style={{ maxWidth: 900 }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          name: product?.name ?? "",
          slug: product?.slug ?? "",
          model: product?.model ?? "",
          brandId: product?.brandId ?? brands[0]?.id,
          categoryId: product?.categoryId ?? categories[0]?.id,
          price: product?.price ?? 0,
          salePrice: product?.salePrice ?? undefined,
          stockStatus: product?.stockStatus ?? "in_stock",
          soldCount: product?.soldCount ?? 0,
          warranty: product?.warranty ?? "",
          origin: product?.origin ?? "",
          motor: product?.motor ?? "",
          specs: product ? specsToText(product.specs) : "",
          description: product?.description ?? "",
          isPublished: product?.isPublished ?? true,
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Tên sản phẩm"
              name="name"
              rules={[{ required: true, message: "Nhập tên sản phẩm" }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Slug" name="slug">
              <Input placeholder="tự tạo nếu để trống" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Model"
              name="model"
              rules={[{ required: true, message: "Nhập model" }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Thương hiệu"
              name="brandId"
              rules={[{ required: true }]}
            >
              <Select
                options={brands.map((b) => ({ value: b.id, label: b.name }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Danh mục"
              name="categoryId"
              rules={[{ required: true }]}
            >
              <Select
                options={categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Giá"
              name="price"
              rules={[{ required: true, message: "Nhập giá" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Giá khuyến mãi" name="salePrice">
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="để trống nếu không có"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Tình trạng kho" name="stockStatus">
              <Select
                options={stockKeys.map((key) => ({
                  value: key,
                  label: STOCK_STATUS[key].labelVi,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Đã bán" name="soldCount">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Bảo hành" name="warranty">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Xuất xứ" name="origin">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Motor" name="motor">
              <Input />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Thông số (mỗi dòng: khóa: giá trị)"
              name="specs"
            >
              <Input.TextArea
                rows={5}
                placeholder={"Công suất: 1400W\nÁp lực: 100 bar"}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Divider style={{ margin: "8px 0 16px" }}>
              Media sản phẩm
            </Divider>
            <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
              Một danh sách thống nhất cho ảnh, video file và embed — chọn từ
              thư viện hoặc dán link.
            </Typography.Paragraph>
          </Col>

          <Col span={24}>
            <Form.Item label="Gallery" required={false}>
              <ProductMediaField value={media} onChange={setMedia} />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Mô tả" name="description">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="isPublished" valuePropName="checked">
              <Checkbox>Xuất bản</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        <Space>
          <Button type="primary" htmlType="submit" loading={pending}>
            {submitLabel}
          </Button>
          <Typography.Text type="secondary">
            {imageCount} ảnh
            {videoCount > 0 ? ` · ${videoCount} video/embed` : ""}
          </Typography.Text>
        </Space>
      </Form>
    </Card>
  );
}
