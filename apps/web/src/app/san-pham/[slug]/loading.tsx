export default function ProductLoading() {
  return (
    <div className="container-page py-6 sm:py-8">
      <div className="mb-4 h-4 w-48 animate-pulse rounded bg-gray-200" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-[4/3] animate-pulse rounded-lg bg-gray-200" />
        <div className="space-y-4">
          <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-4/5 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-40 animate-pulse rounded bg-gray-200" />
          <div className="h-24 w-full animate-pulse rounded-lg bg-gray-200" />
          <div className="flex gap-3">
            <div className="h-11 w-28 animate-pulse rounded-md bg-gray-200" />
            <div className="h-11 w-28 animate-pulse rounded-md bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
