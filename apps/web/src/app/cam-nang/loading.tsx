export default function CamNangLoading() {
  return (
    <div className="container-page py-4 sm:py-6">
      <div className="mb-5 space-y-2 border-b-2 border-gray-100 pb-3">
        <div className="h-7 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full max-w-3xl animate-pulse rounded bg-gray-200" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            <div className="aspect-[16/9] animate-pulse bg-gray-200" />
            <div className="space-y-2 p-3.5">
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
