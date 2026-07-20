import { AdminShell } from "@/components/AdminShell";
import { createBrandAction, deleteBrandAction } from "@/lib/actions/brands";
import { getBrands } from "@/lib/store";

export default function BrandsPage() {
  const brands = getBrands();

  return (
    <AdminShell title="Thương hiệu">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <form
          action={createBrandAction}
          className="h-fit space-y-3 rounded-lg border border-slate-200 bg-white p-4"
        >
          <h2 className="text-sm font-semibold text-slate-900">Thêm thương hiệu</h2>
          <div>
            <label className="mb-1 block text-xs text-slate-500" htmlFor="name">
              Tên
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500" htmlFor="slug">
              Slug (tuỳ chọn)
            </label>
            <input
              id="slug"
              name="slug"
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-admin-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Thêm
          </button>
        </form>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Tên</th>
                <th className="px-3 py-2 font-medium">Slug</th>
                <th className="px-3 py-2 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 font-medium">{b.name}</td>
                  <td className="px-3 py-2 text-slate-500">{b.slug}</td>
                  <td className="px-3 py-2">
                    <form action={deleteBrandAction.bind(null, b.id)}>
                      <button
                        type="submit"
                        className="text-red-600 hover:underline"
                      >
                        Xóa
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
