export function StorePolicies({
  shippingPolicy,
  returnPolicy,
}: {
  shippingPolicy?: string;
  returnPolicy?: string;
}) {
  const shipping = shippingPolicy?.trim() ?? "";
  const returns = returnPolicy?.trim() ?? "";
  if (!shipping && !returns) return null;

  return (
    <section className="mt-6 min-w-0 rounded-lg border border-gray-200 bg-white sm:mt-8">
      <h2 className="border-b border-gray-100 px-4 py-3 text-base font-bold text-gray-900">
        Chính sách mua hàng
      </h2>
      <div className="grid min-w-0 gap-4 px-4 py-4 sm:grid-cols-2 sm:gap-6">
        {shipping && (
          <div className="min-w-0">
            <h3 className="mb-1.5 text-sm font-semibold text-gray-900">
              Giao hàng
            </h3>
            <p className="min-w-0 whitespace-pre-line break-words text-sm leading-relaxed text-gray-600">
              {shipping}
            </p>
          </div>
        )}
        {returns && (
          <div className="min-w-0">
            <h3 className="mb-1.5 text-sm font-semibold text-gray-900">
              Đổi trả &amp; bảo hành
            </h3>
            <p className="min-w-0 whitespace-pre-line break-words text-sm leading-relaxed text-gray-600">
              {returns}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
