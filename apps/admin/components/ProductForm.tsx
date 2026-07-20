import type { Brand, Category, Product, StockStatus } from "@ecom/shared";
import { STOCK_STATUS } from "@ecom/shared";

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

const field =
  "w-full rounded border border-slate-300 px-3 py-1.5 text-sm focus:border-admin-accent focus:ring-1 focus:ring-admin-accent";
const label = "mb-1 block text-xs font-medium text-slate-600";

export function ProductForm({
  action,
  brands,
  categories,
  product,
  submitLabel,
}: Props) {
  const stockKeys = Object.keys(STOCK_STATUS) as StockStatus[];

  return (
    <form action={action} className="max-w-3xl space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={label} htmlFor="name">
            Tên sản phẩm
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={product?.name ?? ""}
            className={field}
          />
        </div>

        <div>
          <label className={label} htmlFor="slug">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={product?.slug ?? ""}
            placeholder="tự tạo nếu để trống"
            className={field}
          />
        </div>

        <div>
          <label className={label} htmlFor="model">
            Model
          </label>
          <input
            id="model"
            name="model"
            required
            defaultValue={product?.model ?? ""}
            className={field}
          />
        </div>

        <div>
          <label className={label} htmlFor="brandId">
            Thương hiệu
          </label>
          <select
            id="brandId"
            name="brandId"
            required
            defaultValue={product?.brandId ?? brands[0]?.id}
            className={field}
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="categoryId">
            Danh mục
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={product?.categoryId ?? categories[0]?.id}
            className={field}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="price">
            Giá
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            required
            defaultValue={product?.price ?? 0}
            className={field}
          />
        </div>

        <div>
          <label className={label} htmlFor="salePrice">
            Giá khuyến mãi
          </label>
          <input
            id="salePrice"
            name="salePrice"
            type="number"
            min={0}
            defaultValue={product?.salePrice ?? ""}
            placeholder="để trống nếu không có"
            className={field}
          />
        </div>

        <div>
          <label className={label} htmlFor="stockStatus">
            Tình trạng kho
          </label>
          <select
            id="stockStatus"
            name="stockStatus"
            defaultValue={product?.stockStatus ?? "in_stock"}
            className={field}
          >
            {stockKeys.map((key) => (
              <option key={key} value={key}>
                {STOCK_STATUS[key].labelVi}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="soldCount">
            Đã bán
          </label>
          <input
            id="soldCount"
            name="soldCount"
            type="number"
            min={0}
            defaultValue={product?.soldCount ?? 0}
            className={field}
          />
        </div>

        <div>
          <label className={label} htmlFor="warranty">
            Bảo hành
          </label>
          <input
            id="warranty"
            name="warranty"
            defaultValue={product?.warranty ?? ""}
            className={field}
          />
        </div>

        <div>
          <label className={label} htmlFor="origin">
            Xuất xứ
          </label>
          <input
            id="origin"
            name="origin"
            defaultValue={product?.origin ?? ""}
            className={field}
          />
        </div>

        <div>
          <label className={label} htmlFor="motor">
            Motor
          </label>
          <input
            id="motor"
            name="motor"
            defaultValue={product?.motor ?? ""}
            className={field}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={label} htmlFor="specs">
            Thông số (mỗi dòng: khóa: giá trị)
          </label>
          <textarea
            id="specs"
            name="specs"
            rows={5}
            defaultValue={product ? specsToText(product.specs) : ""}
            className={field}
            placeholder={"Công suất: 1400W\nÁp lực: 100 bar"}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={label} htmlFor="imageUrls">
            URL ảnh (mỗi dòng một URL)
          </label>
          <textarea
            id="imageUrls"
            name="imageUrls"
            rows={4}
            defaultValue={
              product?.images.map((img) => img.url).join("\n") ?? ""
            }
            className={field}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={label} htmlFor="description">
            Mô tả
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={product?.description ?? ""}
            className={field}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={product?.isPublished ?? true}
              className="rounded border-slate-300"
            />
            Xuất bản
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="rounded bg-admin-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
