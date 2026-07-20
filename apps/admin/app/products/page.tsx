import Link from "next/link";
import { STOCK_STATUS } from "@ecom/shared";
import { AdminShell } from "@/components/AdminShell";
import {
  deleteProductAction,
  togglePublishAction,
} from "@/lib/actions/products";
import { formatVnd } from "@/lib/format";
import { getBrands, getCategories, getProducts } from "@/lib/store";

type SearchParams = Promise<{
  q?: string;
  brand?: string;
  published?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const brands = getBrands();
  const categories = getCategories();
  const brandMap = Object.fromEntries(brands.map((b) => [b.id, b.name]));
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  let products = getProducts();

  if (sp.q) {
    const q = sp.q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q),
    );
  }
  if (sp.brand) {
    products = products.filter((p) => p.brandId === sp.brand);
  }
  if (sp.published === "1") {
    products = products.filter((p) => p.isPublished);
  } else if (sp.published === "0") {
    products = products.filter((p) => !p.isPublished);
  }

  return (
    <AdminShell
      title="Sản phẩm"
      actions={
        <Link
          href="/products/new"
          className="rounded bg-admin-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Thêm sản phẩm
        </Link>
      }
    >
      <form className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-3">
        <div>
          <label className="mb-1 block text-xs text-slate-500" htmlFor="q">
            Tìm kiếm
          </label>
          <input
            id="q"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Tên, model…"
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500" htmlFor="brand">
            Thương hiệu
          </label>
          <select
            id="brand"
            name="brand"
            defaultValue={sp.brand ?? ""}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">Tất cả</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="mb-1 block text-xs text-slate-500"
            htmlFor="published"
          >
            Xuất bản
          </label>
          <select
            id="published"
            name="published"
            defaultValue={sp.published ?? ""}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="1">Đã xuất bản</option>
            <option value="0">Nháp</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
        >
          Lọc
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">Sản phẩm</th>
              <th className="px-3 py-2 font-medium">Thương hiệu</th>
              <th className="px-3 py-2 font-medium">Danh mục</th>
              <th className="px-3 py-2 font-medium">Giá</th>
              <th className="px-3 py-2 font-medium">Kho</th>
              <th className="px-3 py-2 font-medium">XB</th>
              <th className="px-3 py-2 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2">
                  <div className="font-medium text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.model}</div>
                </td>
                <td className="px-3 py-2">{brandMap[p.brandId] ?? "—"}</td>
                <td className="px-3 py-2">{catMap[p.categoryId] ?? "—"}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {p.salePrice != null ? (
                    <>
                      <div className="font-medium text-red-600">
                        {formatVnd(p.salePrice)}
                      </div>
                      <div className="text-xs text-slate-400 line-through">
                        {formatVnd(p.price)}
                      </div>
                    </>
                  ) : (
                    formatVnd(p.price)
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {STOCK_STATUS[p.stockStatus].labelVi}
                </td>
                <td className="px-3 py-2">
                  <form action={togglePublishAction.bind(null, p.id)}>
                    <button
                      type="submit"
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        p.isPublished
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {p.isPublished ? "Đã XB" : "Nháp"}
                    </button>
                  </form>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/products/${p.id}/edit`}
                      className="text-admin-accent hover:underline"
                    >
                      Sửa
                    </Link>
                    <form action={deleteProductAction.bind(null, p.id)}>
                      <button
                        type="submit"
                        className="text-red-600 hover:underline"
                      >
                        Xóa
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                  Không có sản phẩm.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
