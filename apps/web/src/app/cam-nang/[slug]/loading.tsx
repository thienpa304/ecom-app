export default function PostLoading() {
  return (
    <div className="container-page py-4 sm:py-6">
      <div className="mb-3 h-4 w-64 animate-pulse rounded bg-gray-200" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <div className="space-y-3 border-b-2 border-gray-100 pb-4">
            <div className="h-8 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-40 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="mt-5 aspect-[16/9] animate-pulse rounded-xl bg-gray-200" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-4 animate-pulse rounded bg-gray-200"
                style={{ width: i % 3 === 2 ? "70%" : "100%" }}
              />
            ))}
          </div>
        </div>
        <div className="min-w-0 space-y-3">
          <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <div className="aspect-[16/9] animate-pulse bg-gray-200" />
              <div className="space-y-2 p-3.5">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
