import type { SiteSettings, StockStatus } from "./types";

export const DEFAULT_HEADER_CTA_LABEL = "Tư vấn và đặt hàng";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 1,
  siteName: "Điện Máy Lộc Phát Đạt",
  tagline: "Cửa hàng điện máy — xem sản phẩm, gọi tư vấn trực tiếp.",
  phone: "02839756686",
  zaloUrl: "https://zalo.me/",
  address: "",
  email: "lienhe@dienmaylocphatdat.vn",
  logoUrl: "",
  logoSquareUrl: "",
  headerCtaLabel: DEFAULT_HEADER_CTA_LABEL,
  heroTitle: "Điện máy & thiết bị gia dụng",
  heroHighlight: "",
  heroSubtitle:
    "Xem thông số, giá khuyến mãi và liên hệ trực tiếp — không cần giỏ hàng, không thanh toán online.",
  heroImageUrl: "",
  heroCardTitle: "Xem hàng như tại cửa hàng",
  heroCardCaption: "Lọc theo thương hiệu · Giá · Tồn kho",
  heroSlides: [],
  heroBullets: [],
  metaDescription:
    "Điện Máy Lộc Phát Đạt (dienmaylocphatdat.vn) — máy xịt rửa, điện máy; gọi điện hoặc để lại SĐT tư vấn.",
  footerBlurb:
    "Điện Máy Lộc Phát Đạt — hỗ trợ tư vấn chọn mua nhanh chóng tại dienmaylocphatdat.vn.",
  searchPlaceholder: "Tìm máy xịt rửa, model…",
  facebookUrl: "",
  youtubeUrl: "",
  tiktokUrl: "",
  fanpageEmbedUrl: "",
  mapEmbedUrl: "",
};

export const HOME_TOP_SELLERS_TITLE = "TOP MÁY XỊT RỬA CAO ÁP BÁN CHẠY";
export const HOME_SECTION_PRODUCT_COUNT = 4;

export const HERO_SLIDE_INTERVAL_MS = 5000;
export const HERO_SLIDE_MAX = 5;
export const HERO_BULLET_MAX = 6;

export const STOCK_STATUS: Record<
  StockStatus,
  { value: StockStatus; labelVi: string }
> = {
  in_stock: { value: "in_stock", labelVi: "Còn hàng" },
  out_of_stock: { value: "out_of_stock", labelVi: "Hết hàng" },
  discontinued: { value: "discontinued", labelVi: "Ngừng kinh doanh" },
};

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_UPLOAD_MB = 10;

export const SORT_OPTIONS = [
  { value: "price_asc", labelVi: "Giá tăng dần" },
  { value: "price_desc", labelVi: "Giá giảm dần" },
  { value: "sold_desc", labelVi: "Bán chạy nhất" },
  { value: "newest", labelVi: "Mới nhất" },
] as const;

export const PRICE_RANGES = [
  { value: "under_1m", labelVi: "Dưới 1 triệu", min: 0, max: 1_000_000 },
  { value: "1m_5_5m", labelVi: "1 - 5.5 triệu", min: 1_000_000, max: 5_500_000 },
  { value: "5_5m_10m", labelVi: "5.5 - 10 triệu", min: 5_500_000, max: 10_000_000 },
  { value: "10m_20m", labelVi: "10 - 20 triệu", min: 10_000_000, max: 20_000_000 },
  { value: "over_20m", labelVi: "Trên 20 triệu", min: 20_000_000, max: null },
] as const;
