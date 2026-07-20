"use client";

import { UploadOutlined } from "@ant-design/icons";
import type { Brand, Category, Product, StockStatus } from "@ecom/shared";
import { STOCK_STATUS } from "@ecom/shared";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
  Upload,
  type UploadFile,
} from "antd";
import { useState } from "react";

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
  imageUrls?: string;
  videoUrl?: string;
  description?: string;
  isPublished?: boolean;
  imageFiles?: UploadFile[];
  videoFile?: UploadFile[];
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
  const stockKeys = Object.keys(STOCK_STATUS) as StockStatus[];

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
      fd.set("imageUrls", values.imageUrls ?? "");
      fd.set("videoUrl", values.videoUrl ?? "");
      fd.set("description", values.description ?? "");
      if (values.isPublished) fd.set("isPublished", "on");

      for (const file of values.imageFiles ?? []) {
        if (file.originFileObj) fd.append("imageFiles", file.originFileObj);
      }
      const video = values.videoFile?.[0]?.originFileObj;
      if (video) fd.set("videoFile", video);

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
          imageUrls: product?.images.map((img) => img.url).join("\n") ?? "",
          videoUrl: product?.videoUrl ?? "",
          description: product?.description ?? "",
          isPublished: product?.isPublished ?? true,
          imageFiles: [],
          videoFile: [],
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
            <Form.Item label="URL ảnh (mỗi dòng một URL)" name="imageUrls">
              <Input.TextArea rows={4} placeholder="https://..." />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Upload nhiều ảnh"
              name="imageFiles"
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
              extra="Ảnh mới sẽ được thêm vào cuối danh sách URL ở trên."
            >
              <Upload
                beforeUpload={() => false}
                multiple
                accept="image/*"
                listType="picture"
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
              </Upload>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Video (YouTube / TikTok / URL mp4)"
              name="videoUrl"
            >
              <Input placeholder="https://www.youtube.com/watch?v=..." />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Upload video (mp4/webm)"
              name="videoFile"
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
              extra="Nếu chọn file, URL video sẽ được ghi đè bằng link lưu trên storage."
            >
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                accept="video/mp4,video/webm,video/quicktime,video/*"
              >
                <Button icon={<UploadOutlined />}>Chọn video</Button>
              </Upload>
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
          {product?.images?.length ? (
            <Typography.Text type="secondary">
              Đang có {product.images.length} ảnh
            </Typography.Text>
          ) : null}
        </Space>
      </Form>
    </Card>
  );
}
