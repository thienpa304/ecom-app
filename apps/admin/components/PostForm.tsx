"use client";

import type { Post } from "@ecom/shared";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Space,
  Typography,
} from "antd";
import { useState } from "react";
import { MediaLibraryModal } from "@/components/media/MediaLibraryModal";
import { RichTextEditor } from "@/components/RichTextEditor";
import type { PostActionState } from "@/lib/actions/posts";

// Ngưỡng thực dụng để tránh bị Google cắt trên mobile, không phải luật cứng.
const META_TITLE_SOFT_MAX = 60;
const META_DESC_SOFT_MAX = 160;
const META_DESC_SOFT_MIN = 70;

type Props = {
  action: (formData: FormData) => Promise<PostActionState>;
  post?: Post;
  siteName: string;
  submitLabel: string;
};

type FormValues = {
  title: string;
  slug?: string;
  excerpt?: string;
  coverAlt?: string;
  metaTitle?: string;
  metaDescription?: string;
  authorName?: string;
  isPublished?: boolean;
};

function CharCount({
  value,
  max,
  min,
}: {
  value: string;
  max: number;
  min?: number;
}) {
  const len = value.trim().length;
  if (!len) return null;

  const tooLong = len > max;
  const tooShort = min !== undefined && len < min;
  const color = tooLong ? "#cf1322" : tooShort ? "#d46b08" : "#389e0d";
  const note = tooLong
    ? ` — dài quá ${len - max} ký tự, mobile sẽ bị cắt`
    : tooShort
      ? " — hơi ngắn, thêm thông số cụ thể để tăng tỉ lệ bấm"
      : "";

  return (
    <Typography.Text style={{ color, fontSize: 12 }}>
      {len}/{max} ký tự{note}
    </Typography.Text>
  );
}

function formatPublishedAt(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

export function PostForm({ action, post, siteName, submitLabel }: Props) {
  const [form] = Form.useForm<FormValues>();
  const [pending, setPending] = useState(false);
  const [serverState, setServerState] = useState<PostActionState>({
    ok: false,
    message: "",
  });
  const [bodyHtml, setBodyHtml] = useState(post?.body ?? "");
  const [coverUrl, setCoverUrl] = useState(post?.coverUrl ?? "");
  const [mediaOpen, setMediaOpen] = useState(false);
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    post?.metaDescription ?? "",
  );

  // Lỗi hay gặp nhất trong repo này: copy 155 ký tự đầu của bài rồi để câu bị
  // cắt giữa dòng. Cảnh báo ngay tại chỗ nhập.
  const descTrimmed = metaDescription.trim();
  const descIncomplete = descTrimmed.length > 0 && !/[.!?…]$/.test(descTrimmed);

  // layout.tsx có title.template = "%s | siteName" nên gõ thêm tên shop sẽ ra
  // "... | Shop | Shop" — Google coi redundant branding là lý do viết lại title.
  const titleRepeatsBrand =
    siteName.length > 0 &&
    metaTitle.toLowerCase().includes(siteName.toLowerCase());

  const publishedLabel = formatPublishedAt(post?.publishedAt ?? null);

  async function onFinish(values: FormValues) {
    setPending(true);
    setServerState({ ok: false, message: "" });
    try {
      const fd = new FormData();
      fd.set("title", values.title ?? "");
      fd.set("slug", values.slug ?? "");
      fd.set("excerpt", values.excerpt ?? "");
      fd.set("body", bodyHtml);
      fd.set("coverUrl", coverUrl);
      fd.set("coverAlt", values.coverAlt ?? "");
      fd.set("metaTitle", values.metaTitle ?? "");
      fd.set("metaDescription", values.metaDescription ?? "");
      fd.set("authorName", values.authorName ?? "");
      // Ngày đăng do server giữ: đặt lần đầu khi đăng, sau đó không đổi.
      fd.set("publishedAt", post?.publishedAt ?? "");
      if (values.isPublished) fd.set("isPublished", "on");

      const result = await action(fd);
      if (result && !result.ok) setServerState(result);
    } catch (e) {
      if (
        typeof e === "object" &&
        e !== null &&
        "digest" in e &&
        String((e as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
      ) {
        throw e;
      }
      setServerState({
        ok: false,
        message: e instanceof Error ? e.message : "Có lỗi xảy ra",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Card style={{ width: "100%" }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          title: post?.title ?? "",
          slug: post?.slug ?? "",
          excerpt: post?.excerpt ?? "",
          coverAlt: post?.coverAlt ?? "",
          metaTitle: post?.metaTitle ?? "",
          metaDescription: post?.metaDescription ?? "",
          authorName: post?.authorName ?? "",
          isPublished: post?.isPublished ?? false,
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Tiêu đề bài viết"
              name="title"
              rules={[{ required: true, message: "Nhập tiêu đề bài viết" }]}
              extra="Đặt đúng câu hỏi khách gõ trên Google, ví dụ: Máy xịt rửa bao nhiêu bar là đủ?"
            >
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} sm={16}>
            <Form.Item
              label="Slug"
              name="slug"
              extra="Để trống sẽ tự tạo từ tiêu đề. Đổi slug của bài đã đăng sẽ mất thứ hạng."
            >
              <Input placeholder="tu-tao-neu-de-trong" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item label="Tác giả" name="authorName">
              <Input placeholder={siteName} />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Tóm tắt"
              name="excerpt"
              extra="1-2 câu hoàn chỉnh. Hiện ở card danh sách, và dùng làm meta description nếu ô dưới để trống."
            >
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: "8px 0 16px" }}>Ảnh cover</Divider>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label="Ảnh">
              <Space direction="vertical" style={{ width: "100%" }}>
                {coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverUrl}
                    alt="Ảnh cover"
                    style={{
                      width: "100%",
                      maxHeight: 180,
                      objectFit: "contain",
                      border: "1px solid #f0f0f0",
                      borderRadius: 8,
                      background: "#fafafa",
                    }}
                  />
                ) : (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Chưa chọn ảnh
                  </Typography.Text>
                )}
                <Space>
                  <Button htmlType="button" onClick={() => setMediaOpen(true)}>
                    Chọn từ thư viện
                  </Button>
                  {coverUrl ? (
                    <Button
                      htmlType="button"
                      danger
                      onClick={() => setCoverUrl("")}
                    >
                      Bỏ ảnh
                    </Button>
                  ) : null}
                </Space>
              </Space>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Alt ảnh"
              name="coverAlt"
              extra="Mô tả ảnh thật sự chụp gì, đừng lặp y tiêu đề — lặp thì không thêm ngữ cảnh nào cho Google Images."
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: "8px 0 16px" }}>Nội dung</Divider>
        <Form.Item>
          <RichTextEditor
            value={bodyHtml}
            onChange={setBodyHtml}
            placeholder="Viết nội dung bài, dùng H2 cho từng phần chính…"
          />
        </Form.Item>

        <Divider style={{ margin: "8px 0 16px" }}>SEO</Divider>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Meta title"
              name="metaTitle"
              extra="Để trống sẽ dùng tiêu đề bài viết."
            >
              <Input onChange={(e) => setMetaTitle(e.target.value)} />
            </Form.Item>
            <div style={{ marginTop: -18, marginBottom: 16 }}>
              <CharCount value={metaTitle} max={META_TITLE_SOFT_MAX} />
              {titleRepeatsBrand ? (
                <Alert
                  type="warning"
                  showIcon
                  style={{ marginTop: 6 }}
                  message={`Bỏ "${siteName}" khỏi meta title`}
                  description={`Hệ thống tự thêm "| ${siteName}" phía sau. Gõ thêm sẽ ra tên shop hai lần, Google coi đó là lý do để viết lại title của bạn.`}
                />
              ) : null}
            </div>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Meta description"
              name="metaDescription"
              extra="Để trống sẽ tự lấy từ tóm tắt. Nên chứa dữ liệu cụ thể (thông số, giá) — Google khuyến khích sinh từ database."
            >
              <Input.TextArea
                rows={3}
                onChange={(e) => setMetaDescription(e.target.value)}
              />
            </Form.Item>
            <div style={{ marginTop: -18, marginBottom: 16 }}>
              <CharCount
                value={metaDescription}
                max={META_DESC_SOFT_MAX}
                min={META_DESC_SOFT_MIN}
              />
              {descIncomplete ? (
                <Alert
                  type="warning"
                  showIcon
                  style={{ marginTop: 6 }}
                  message="Meta description chưa kết thúc bằng dấu câu"
                  description="Trông như bị cắt giữa chừng. Viết lại thành câu hoàn chỉnh thay vì copy phần đầu bài viết."
                />
              ) : null}
            </div>
          </Col>
        </Row>

        <Divider style={{ margin: "8px 0 16px" }}>Đăng bài</Divider>
        <Form.Item name="isPublished" valuePropName="checked">
          <Checkbox>Đăng bài (hiện trên web)</Checkbox>
        </Form.Item>
        <Typography.Paragraph type="secondary" style={{ fontSize: 12 }}>
          {publishedLabel
            ? `Ngày đăng: ${publishedLabel} — sửa bài không đổi ngày này.`
            : "Ngày đăng sẽ được đặt khi bạn đăng lần đầu."}{" "}
          Web dùng ISR 60 giây nên bài mới lên sau khoảng 1 phút.
        </Typography.Paragraph>

        {serverState.message ? (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            message={serverState.message}
          />
        ) : null}

        <Button type="primary" htmlType="submit" loading={pending}>
          {submitLabel}
        </Button>
      </Form>

      <MediaLibraryModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        multiple={false}
        accept="image"
        title="Chọn ảnh cover"
        initialSelectedUrls={coverUrl ? [coverUrl] : []}
        onSelect={(assets) => {
          const first = assets[0];
          if (first) setCoverUrl(first.url);
        }}
      />
    </Card>
  );
}
