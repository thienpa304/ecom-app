export function ProductPriceNote() {
  return (
    <div className="min-w-0 space-y-2">
      <p className="text-xs italic text-brand sm:text-sm">
        Giá chưa bao gồm VAT 8%
      </p>
      <p className="min-w-0 break-words rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">
        Giá bán có thể được điều chỉnh theo thời điểm và chương trình khuyến
        mãi. Quý khách vui lòng liên hệ để được báo giá chính xác nhất!
      </p>
    </div>
  );
}
