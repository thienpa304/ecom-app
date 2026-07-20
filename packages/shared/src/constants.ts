import type { StockStatus } from "./types";

export const STOCK_STATUS: Record<
  StockStatus,
  { value: StockStatus; labelVi: string }
> = {
  in_stock: { value: "in_stock", labelVi: "Còn hàng" },
  out_of_stock: { value: "out_of_stock", labelVi: "Hết hàng" },
  discontinued: { value: "discontinued", labelVi: "Ngừng kinh doanh" },
};

export const SORT_OPTIONS = [
  { value: "price_asc", labelVi: "Giá tăng dần" },
  { value: "price_desc", labelVi: "Giá giảm dần" },
  { value: "sold_desc", labelVi: "Bán chạy nhất" },
  { value: "newest", labelVi: "Mới nhất" },
] as const;

/** Price ranges in VND (typical VN pressure-washer catalog bands). */
export const PRICE_RANGES = [
  { value: "under_1m", labelVi: "Dưới 1 triệu", min: 0, max: 1_000_000 },
  { value: "1m_5_5m", labelVi: "1 - 5.5 triệu", min: 1_000_000, max: 5_500_000 },
  { value: "5_5m_10m", labelVi: "5.5 - 10 triệu", min: 5_500_000, max: 10_000_000 },
  { value: "10m_20m", labelVi: "10 - 20 triệu", min: 10_000_000, max: 20_000_000 },
  { value: "over_20m", labelVi: "Trên 20 triệu", min: 20_000_000, max: null },
] as const;
