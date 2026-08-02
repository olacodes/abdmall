export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="h-7 w-48 animate-pulse rounded bg-surface-2" />
      <div className="mt-3 h-4 w-72 animate-pulse rounded bg-surface-2" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-line bg-surface"
          >
            <div className="aspect-square animate-pulse bg-surface-2" />
            <div className="flex flex-col gap-2 p-3">
              <div className="h-3 w-full animate-pulse rounded bg-surface-2" />
              <div className="h-3 w-16 animate-pulse rounded bg-surface-2" />
              <div className="h-5 w-20 animate-pulse rounded bg-surface-2" />
              <div className="mt-1 h-9 w-full animate-pulse rounded-full bg-surface-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
