"use client";

import {
  DEFAULT_HEADER_CTA_LABEL,
  HERO_BULLET_MAX,
  HERO_SLIDE_MAX,
  type HeroBullet,
  type HeroBulletIcon,
  type HeroSlide,
  type SiteSettings,
} from "@ecom/shared";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Select,
  Space,
  Typography,
  theme,
} from "antd";
import dynamic from "next/dynamic";
import { useActionState, useState } from "react";
import {
  updateSiteSettingsAction,
  type SettingsActionState,
} from "@/lib/actions/settings";

const MediaLibraryModal = dynamic(
  () =>
    import("@/components/media/MediaLibraryModal").then(
      (m) => m.MediaLibraryModal,
    ),
  { ssr: false },
);

const initial: SettingsActionState = { ok: false, message: "" };

const BULLET_ICONS: { value: HeroBulletIcon; label: string }[] = [
  { value: "globe", label: "🌐 Quả cầu" },
  { value: "star", label: "⭐ Ngôi sao" },
  { value: "check", label: "✔ Dấu tick" },
  { value: "gear", label: "⚙ Bánh răng" },
  { value: "shield", label: "🛡 Khiên" },
  { value: "truck", label: "🚚 Xe giao hàng" },
];

type PickerTarget = "logo" | "logoSquare" | "poster" | "slides";

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const { token } = theme.useToken();
  const [state, action, pending] = useActionState(
    updateSiteSettingsAction,
    initial,
  );
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl ?? "");
  const [logoSquareUrl, setLogoSquareUrl] = useState(
    settings.logoSquareUrl ?? "",
  );
  const [heroImageUrl, setHeroImageUrl] = useState(settings.heroImageUrl ?? "");
  const [slides, setSlides] = useState<HeroSlide[]>(settings.heroSlides ?? []);
  const [bullets, setBullets] = useState<HeroBullet[]>(
    settings.heroBullets ?? [],
  );
  const [picker, setPicker] = useState<PickerTarget | null>(null);

  function patchSlide(index: number, patch: Partial<HeroSlide>) {
    setSlides((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );
  }

  function patchBullet(index: number, patch: Partial<HeroBullet>) {
    setBullets((prev) =>
      prev.map((b, i) => (i === index ? { ...b, ...patch } : b)),
    );
  }

  return (
    <Card style={{ width: "100%" }}>
      <form action={action}>
        <input type="hidden" name="logoUrl" value={logoUrl} />
        <input type="hidden" name="logoSquareUrl" value={logoSquareUrl} />
        <input type="hidden" name="heroImageUrl" value={heroImageUrl} />
        <input
          type="hidden"
          name="heroSlides"
          value={JSON.stringify(slides)}
        />
        <input
          type="hidden"
          name="heroBullets"
          value={JSON.stringify(bullets)}
        />
        <input
          type="hidden"
          name="heroCardTitle"
          value={settings.heroCardTitle ?? ""}
        />
        <input
          type="hidden"
          name="heroCardCaption"
          value={settings.heroCardCaption ?? ""}
        />

        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <section>
            <Form layout="vertical" component={false}>
              <h3 style={{ marginTop: 0 }}>Thông tin cửa hàng</h3>
              <Form.Item label="Tên web" required>
                <Input name="siteName" defaultValue={settings.siteName} required />
              </Form.Item>
              <Form.Item label="Slogan / tagline">
                <Input name="tagline" defaultValue={settings.tagline} />
              </Form.Item>
              <Form.Item label="Số điện thoại (hotline)" required>
                <Input name="phone" defaultValue={settings.phone} required />
              </Form.Item>
              <Form.Item label="Link Zalo OA">
                <Input name="zaloUrl" defaultValue={settings.zaloUrl} />
              </Form.Item>
              <Form.Item label="Địa chỉ">
                <Input name="address" defaultValue={settings.address} />
              </Form.Item>
              <Form.Item label="Email">
                <Input
                  name="email"
                  type="email"
                  defaultValue={settings.email}
                />
              </Form.Item>

              <h3>Logo &amp; thanh đầu trang</h3>
              <Form.Item
                label="Logo ngang"
                extra="Bản dài có chữ — hiện ở thanh đầu trang. Bỏ trống sẽ hiện tên web bằng chữ."
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Space wrap>
                    <Button
                      htmlType="button"
                      onClick={() => setPicker("logo")}
                    >
                      Chọn từ thư viện
                    </Button>
                    {logoUrl ? (
                      <Button
                        danger
                        type="link"
                        htmlType="button"
                        onClick={() => setLogoUrl("")}
                      >
                        Xóa logo
                      </Button>
                    ) : null}
                  </Space>
                  <Input
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="Hoặc dán URL ảnh logo…"
                    allowClear
                  />
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      style={{
                        maxWidth: 220,
                        maxHeight: 80,
                        objectFit: "contain",
                        border: "1px solid #f0f0f0",
                        borderRadius: 8,
                        padding: 8,
                        background: "#fff",
                      }}
                    />
                  ) : null}
                </Space>
              </Form.Item>
              <Form.Item
                label="Logo vuông"
                extra="Bản vuông chỉ có ký hiệu — hiện ở footer, favicon và ảnh chia sẻ mạng xã hội. Bỏ trống thì không hiện."
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Space wrap>
                    <Button
                      htmlType="button"
                      onClick={() => setPicker("logoSquare")}
                    >
                      Chọn từ thư viện
                    </Button>
                    {logoSquareUrl ? (
                      <Button
                        danger
                        type="link"
                        htmlType="button"
                        onClick={() => setLogoSquareUrl("")}
                      >
                        Xóa logo vuông
                      </Button>
                    ) : null}
                  </Space>
                  <Input
                    value={logoSquareUrl}
                    onChange={(e) => setLogoSquareUrl(e.target.value)}
                    placeholder="Hoặc dán URL ảnh logo vuông…"
                    allowClear
                  />
                  {logoSquareUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoSquareUrl}
                      alt="Logo vuông preview"
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "contain",
                        border: "1px solid #f0f0f0",
                        borderRadius: 8,
                        padding: 8,
                        background: "#fff",
                      }}
                    />
                  ) : null}
                </Space>
              </Form.Item>
              <Form.Item
                label="Chữ trước số hotline (nút cam trên header)"
                extra={`Ví dụ: "${DEFAULT_HEADER_CTA_LABEL}" → nút hiện "${DEFAULT_HEADER_CTA_LABEL} ${settings.phone}".`}
              >
                <Input
                  name="headerCtaLabel"
                  defaultValue={
                    settings.headerCtaLabel || DEFAULT_HEADER_CTA_LABEL
                  }
                  placeholder={DEFAULT_HEADER_CTA_LABEL}
                />
              </Form.Item>

              <h3>Trang chủ — phần đầu (hero)</h3>
              <Form.Item label="Tiêu đề hero">
                <Input name="heroTitle" defaultValue={settings.heroTitle} />
              </Form.Item>
              <Form.Item
                label="Cụm chữ tô màu xanh trong tiêu đề"
                extra="Phải là một đoạn nằm trong tiêu đề ở trên, ví dụ: Điện máy Lộc Phát Đạt."
              >
                <Input
                  name="heroHighlight"
                  defaultValue={settings.heroHighlight}
                  placeholder="Điện máy Lộc Phát Đạt"
                />
              </Form.Item>
              <Form.Item label="Mô tả hero">
                <Input.TextArea
                  name="heroSubtitle"
                  rows={3}
                  defaultValue={settings.heroSubtitle}
                />
              </Form.Item>

              <Form.Item
                label={`Slide ảnh trang chủ (tối đa ${HERO_SLIDE_MAX} ảnh, tự chạy 5 giây/ảnh)`}
                extra="Ảnh chạy lần lượt và lặp vô hạn. Kéo thứ tự bằng nút ↑ ↓."
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Space wrap>
                    <Button
                      htmlType="button"
                      onClick={() => setPicker("slides")}
                      disabled={slides.length >= HERO_SLIDE_MAX}
                    >
                      Thêm ảnh từ thư viện
                    </Button>
                    {slides.length ? (
                      <Button
                        danger
                        type="link"
                        htmlType="button"
                        onClick={() => setSlides([])}
                      >
                        Xóa tất cả
                      </Button>
                    ) : null}
                    <Typography.Text type="secondary">
                      {slides.length}/{HERO_SLIDE_MAX} ảnh
                    </Typography.Text>
                  </Space>

                  {slides.length === 0 ? (
                    <Typography.Text type="secondary">
                      Chưa có slide — trang chủ sẽ dùng ảnh dự phòng bên dưới.
                    </Typography.Text>
                  ) : null}

                  {slides.map((slide, index) => (
                    <div
                      key={`${slide.url}-${index}`}
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                        border: "1px solid #f0f0f0",
                        borderRadius: 8,
                        padding: 8,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={slide.url}
                        alt=""
                        style={{
                          width: 120,
                          height: 72,
                          objectFit: "cover",
                          borderRadius: 6,
                          flexShrink: 0,
                        }}
                      />
                      <Space
                        direction="vertical"
                        size={6}
                        style={{ flex: 1, minWidth: 0 }}
                      >
                        <Input
                          size="small"
                          value={slide.alt}
                          onChange={(e) =>
                            patchSlide(index, { alt: e.target.value })
                          }
                          placeholder="Mô tả ảnh (alt) — tốt cho SEO"
                        />
                        <Input
                          size="small"
                          value={slide.href}
                          onChange={(e) =>
                            patchSlide(index, { href: e.target.value })
                          }
                          placeholder="Link khi bấm vào ảnh (không bắt buộc)"
                        />
                      </Space>
                      <Space direction="vertical" size={4}>
                        <Button
                          size="small"
                          htmlType="button"
                          disabled={index === 0}
                          onClick={() =>
                            setSlides((prev) => move(prev, index, index - 1))
                          }
                        >
                          ↑
                        </Button>
                        <Button
                          size="small"
                          htmlType="button"
                          disabled={index === slides.length - 1}
                          onClick={() =>
                            setSlides((prev) => move(prev, index, index + 1))
                          }
                        >
                          ↓
                        </Button>
                        <Button
                          size="small"
                          danger
                          htmlType="button"
                          onClick={() =>
                            setSlides((prev) =>
                              prev.filter((_, i) => i !== index),
                            )
                          }
                        >
                          Xóa
                        </Button>
                      </Space>
                    </div>
                  ))}
                </Space>
              </Form.Item>

              <Form.Item
                label={`Các ý bán hàng dưới tiêu đề (tối đa ${HERO_BULLET_MAX} ý)`}
                extra="Mỗi ý gồm 1 icon tròn, phần chữ in đậm và phần chữ thường."
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button
                    htmlType="button"
                    onClick={() =>
                      setBullets((prev) => [
                        ...prev,
                        { icon: "check", bold: "", text: "" },
                      ])
                    }
                    disabled={bullets.length >= HERO_BULLET_MAX}
                  >
                    Thêm ý
                  </Button>

                  {bullets.length === 0 ? (
                    <Typography.Text type="secondary">
                      Chưa có ý nào — trang chủ sẽ chỉ hiện tiêu đề và mô tả.
                    </Typography.Text>
                  ) : null}

                  {bullets.map((bullet, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                        border: "1px solid #f0f0f0",
                        borderRadius: 8,
                        padding: 8,
                      }}
                    >
                      <Select
                        value={bullet.icon}
                        onChange={(icon) => patchBullet(index, { icon })}
                        options={BULLET_ICONS}
                        style={{ width: 150, flexShrink: 0 }}
                      />
                      <Space
                        direction="vertical"
                        size={6}
                        style={{ flex: 1, minWidth: 0 }}
                      >
                        <Input
                          size="small"
                          value={bullet.bold}
                          onChange={(e) =>
                            patchBullet(index, { bold: e.target.value })
                          }
                          placeholder="Phần in đậm — vd: Doanh nghiệp chuyên nhập khẩu"
                        />
                        <Input.TextArea
                          size="small"
                          rows={2}
                          value={bullet.text}
                          onChange={(e) =>
                            patchBullet(index, { text: e.target.value })
                          }
                          placeholder="Phần chữ thường theo sau"
                        />
                      </Space>
                      <Space direction="vertical" size={4}>
                        <Button
                          size="small"
                          htmlType="button"
                          disabled={index === 0}
                          onClick={() =>
                            setBullets((prev) => move(prev, index, index - 1))
                          }
                        >
                          ↑
                        </Button>
                        <Button
                          size="small"
                          htmlType="button"
                          disabled={index === bullets.length - 1}
                          onClick={() =>
                            setBullets((prev) => move(prev, index, index + 1))
                          }
                        >
                          ↓
                        </Button>
                        <Button
                          size="small"
                          danger
                          htmlType="button"
                          onClick={() =>
                            setBullets((prev) =>
                              prev.filter((_, i) => i !== index),
                            )
                          }
                        >
                          Xóa
                        </Button>
                      </Space>
                    </div>
                  ))}
                </Space>
              </Form.Item>

              <Form.Item
                label="Ảnh dự phòng (dùng khi chưa có slide nào)"
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Space wrap>
                    <Button
                      htmlType="button"
                      onClick={() => setPicker("poster")}
                    >
                      Chọn từ thư viện
                    </Button>
                    {heroImageUrl ? (
                      <Button
                        danger
                        type="link"
                        htmlType="button"
                        onClick={() => setHeroImageUrl("")}
                      >
                        Xóa ảnh
                      </Button>
                    ) : null}
                  </Space>
                  <Input
                    value={heroImageUrl}
                    onChange={(e) => setHeroImageUrl(e.target.value)}
                    placeholder="Hoặc dán URL ảnh…"
                    allowClear
                  />
                  {heroImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={heroImageUrl}
                      alt="Hero poster preview"
                      style={{
                        width: "100%",
                        maxWidth: 420,
                        maxHeight: 220,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #f0f0f0",
                      }}
                    />
                  ) : (
                    <Typography.Text type="secondary">
                      Chưa có ảnh — web sẽ hiện nền gradient mặc định.
                    </Typography.Text>
                  )}
                </Space>
              </Form.Item>

              <h3>SEO</h3>
              <Form.Item label="Meta description">
                <Input.TextArea
                  name="metaDescription"
                  rows={3}
                  defaultValue={settings.metaDescription}
                />
              </Form.Item>
              <Form.Item label="Placeholder ô tìm kiếm">
                <Input
                  name="searchPlaceholder"
                  defaultValue={settings.searchPlaceholder}
                />
              </Form.Item>

              <h3>Footer</h3>
              <Form.Item label="Mô tả footer">
                <Input.TextArea
                  name="footerBlurb"
                  rows={3}
                  defaultValue={settings.footerBlurb}
                />
              </Form.Item>

              <h3>Mạng xã hội &amp; nhúng</h3>
              <Typography.Paragraph type="secondary">
                Ô nào để trống thì phần đó tự ẩn trên web.
              </Typography.Paragraph>
              <Form.Item label="Facebook">
                <Input
                  name="facebookUrl"
                  defaultValue={settings.facebookUrl}
                  placeholder="https://facebook.com/…"
                />
              </Form.Item>
              <Form.Item label="YouTube">
                <Input
                  name="youtubeUrl"
                  defaultValue={settings.youtubeUrl}
                  placeholder="https://youtube.com/@…"
                />
              </Form.Item>
              <Form.Item label="TikTok">
                <Input
                  name="tiktokUrl"
                  defaultValue={settings.tiktokUrl}
                  placeholder="https://tiktok.com/@…"
                />
              </Form.Item>
              <Form.Item
                label="Fanpage Facebook (khung ở footer)"
                extra="Vào Facebook Page Plugin, bấm Get Code → dán cả đoạn <iframe> hoặc chỉ link src vào đây."
              >
                <Input.TextArea
                  name="fanpageEmbedUrl"
                  rows={3}
                  defaultValue={settings.fanpageEmbedUrl}
                  placeholder="https://www.facebook.com/plugins/page.php?href=…"
                />
              </Form.Item>
              <Form.Item
                label="Bản đồ Google Maps (khung ở footer)"
                extra="Trên Google Maps: Chia sẻ → Nhúng bản đồ → dán cả đoạn <iframe> hoặc chỉ link src."
              >
                <Input.TextArea
                  name="mapEmbedUrl"
                  rows={3}
                  defaultValue={settings.mapEmbedUrl}
                  placeholder="https://www.google.com/maps/embed?pb=…"
                />
              </Form.Item>
            </Form>
          </section>

        </Space>

        <div
          style={{
            position: "sticky",
            bottom: 0,
            zIndex: 2,
            margin: "24px -24px -24px",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: token.colorBgContainer,
            borderTop: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Button type="primary" htmlType="submit" loading={pending}>
            Lưu cấu hình
          </Button>
          {state.message ? (
            <Alert
              type={state.ok ? "success" : "error"}
              message={state.message}
              showIcon
              style={{ flex: 1, minWidth: 0, padding: "4px 12px" }}
            />
          ) : null}
        </div>
      </form>

      <MediaLibraryModal
        open={picker !== null}
        onClose={() => setPicker(null)}
        accept="image"
        multiple={picker === "slides"}
        title={
          picker === "logo"
            ? "Chọn logo ngang"
            : picker === "logoSquare"
              ? "Chọn logo vuông"
              : picker === "slides"
                ? "Chọn ảnh slide trang chủ"
                : "Chọn ảnh dự phòng trang chủ"
        }
        initialSelectedUrls={
          picker === "logo"
            ? logoUrl
              ? [logoUrl]
              : []
            : picker === "logoSquare"
              ? logoSquareUrl
                ? [logoSquareUrl]
                : []
              : picker === "poster"
                ? heroImageUrl
                  ? [heroImageUrl]
                  : []
                : []
        }
        onSelect={(assets) => {
          if (picker === "logo") {
            const url = assets[0]?.url;
            if (url) setLogoUrl(url);
            return;
          }
          if (picker === "logoSquare") {
            const url = assets[0]?.url;
            if (url) setLogoSquareUrl(url);
            return;
          }
          if (picker === "poster") {
            const url = assets[0]?.url;
            if (url) setHeroImageUrl(url);
            return;
          }
          setSlides((prev) => {
            const existing = new Set(prev.map((s) => s.url));
            const added = assets
              .filter((a) => a.url && !existing.has(a.url))
              .map<HeroSlide>((a) => ({ url: a.url, alt: "", href: "" }));
            return [...prev, ...added].slice(0, HERO_SLIDE_MAX);
          });
        }}
      />
    </Card>
  );
}
