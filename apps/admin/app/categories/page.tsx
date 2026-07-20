import { AdminShell } from "@/components/AdminShell";
import {
  createCategoryAction,
  deleteCategoryAction,
} from "@/lib/actions/categories";
import { getCategories } from "@/lib/store";

export default function CategoriesPage() {
  const categories = getCategories();
  const nameMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <AdminShell title="Danh mục">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <form
          action={createCategoryAction}
          className="h-fit space-y-3 rounded-lg border border-slate-200 bg-white p-4"
        >
          <h2 className="text-sm font-semibold text-slate-900">Thêm danh mục</h2>
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
          <div>
            <label
              className="mb-1 block text-xs text-slate-500"
              htmlFor="parentId"
            >
              Danh mục cha
            </label>
            <select
              id="parentId"
              name="parentId"
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
              defaultValue=""
            >
              <option value="">— Không —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="mb-1 block text-xs text-slate-500"
              htmlFor="sortOrder"
            >
              Thứ tự
            </label>
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={0}
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
                <th className="px-3 py-2 font-medium">Cha</th>
                <th className="px-3 py-2 font-medium">Thứ tự</th>
                <th className="px-3 py-2 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 font-medium">{c.name}</td>
                  <td className="px-3 py-2 text-slate-500">{c.slug}</td>
                  <td className="px-3 py-2 text-slate-500">
                    {c.parentId ? nameMap[c.parentId] ?? c.parentId : "—"}
                  </td>
                  <td className="px-3 py-2">{c.sortOrder}</td>
                  <td className="px-3 py-2">
                    <form action={deleteCategoryAction.bind(null, c.id)}>
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
