export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-surface">
      <div className="aspect-square shimmer" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-3 w-16 shimmer rounded" />
        <div className="h-4 w-full shimmer rounded" />
        <div className="h-4 w-3/4 shimmer rounded" />
        <div className="h-5 w-20 shimmer rounded mt-1" />
      </div>
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <div className="flex gap-4 px-4 py-3 border-b border-border">
      <div className="h-4 w-1/4 shimmer rounded" />
      <div className="h-4 w-1/3 shimmer rounded" />
      <div className="h-4 w-1/5 shimmer rounded" />
    </div>
  )
}

export function ProductPageSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 animate-pulse" aria-busy="true" aria-label="Loading product">
      <div className="flex gap-1.5 mb-5">
        <div className="h-3 w-12 shimmer rounded" />
        <div className="h-3 w-20 shimmer rounded" />
        <div className="h-3 w-32 shimmer rounded" />
      </div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 shimmer rounded" />
          <div className="h-8 w-3/4 shimmer rounded" />
          <div className="h-4 w-1/2 shimmer rounded" />
          <div className="flex gap-2 mt-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-6 w-20 shimmer rounded-full" />
            ))}
          </div>
        </div>
        <div className="h-24 w-24 shimmer rounded-full shrink-0" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <div className="aspect-square max-w-lg shimmer rounded-xl" />
          <div className="h-32 shimmer rounded-xl" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 shimmer rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-36 shimmer rounded-xl" />
          <div className="h-48 shimmer rounded-xl" />
          <div className="h-14 shimmer rounded-xl" />
        </div>
      </div>
    </main>
  )
}

export function CategoryPageSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 animate-pulse" aria-busy="true" aria-label="Loading category">
      <div className="mb-6 flex items-center gap-4 rounded-xl bg-surface-alt p-6 border border-border">
        <div className="h-12 w-12 shimmer rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-7 w-48 shimmer rounded" />
          <div className="h-4 w-72 shimmer rounded" />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="hidden lg:block w-56 shrink-0 h-80 shimmer rounded-xl" />
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  )
}

export function SearchPageSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 animate-pulse" aria-busy="true" aria-label="Loading search">
      <div className="h-9 w-64 shimmer rounded mb-2" />
      <div className="h-4 w-40 shimmer rounded mb-6" />
      <div className="flex flex-wrap gap-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-24 shimmer rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 shimmer rounded-xl" />
        ))}
      </div>
    </main>
  )
}

export function DealsPageSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 animate-pulse" aria-busy="true" aria-label="Loading deals">
      <div className="h-9 w-48 shimmer rounded mb-2" />
      <div className="h-4 w-96 shimmer rounded mb-8" />
      <div className="h-64 shimmer rounded-2xl mb-10" />
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-24 shimmer rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 shimmer rounded-xl" />
        ))}
      </div>
    </main>
  )
}

export function BestOfPageSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 animate-pulse" aria-busy="true" aria-label="Loading guide">
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-28 shimmer rounded-full" />
        <div className="h-6 w-32 shimmer rounded-full" />
      </div>
      <div className="h-10 w-3/4 max-w-xl shimmer rounded mb-4" />
      <div className="h-4 w-full max-w-2xl shimmer rounded mb-2" />
      <div className="h-4 w-2/3 max-w-xl shimmer rounded mb-6" />
      <div className="h-24 shimmer rounded-xl mb-8" />
      <div className="flex gap-8">
        <div className="hidden lg:block w-56 shrink-0 h-72 shimmer rounded-xl" />
        <div className="flex-1 flex flex-col gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 shimmer rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  )
}

/** Generic "title + intro + grid of tiles" skeleton for index-style pages (brands, tags, guides). */
export function IndexPageSkeleton({ label = 'Loading' }: { label?: string }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 animate-pulse" aria-busy="true" aria-label={label}>
      <div className="mx-auto mb-8 flex max-w-xl flex-col items-center gap-3">
        <div className="h-9 w-56 shimmer rounded" />
        <div className="h-4 w-full shimmer rounded" />
      </div>
      <div className="mx-auto mb-8 h-11 max-w-md shimmer rounded-full" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-32 shimmer rounded-xl" />
        ))}
      </div>
    </main>
  )
}

export function ComparePageSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 animate-pulse" aria-busy="true" aria-label="Loading comparison">
      <div className="mb-6 h-8 w-80 max-w-full shimmer rounded" />
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-56 shimmer rounded-xl" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 shimmer rounded" />
        ))}
      </div>
    </main>
  )
}

/** Placeholder for the category filter sidebar / mobile toolbar while its client island loads. */
export function FilterBarSkeleton() {
  return (
    <>
      <div className="mb-4 h-14 shimmer rounded-lg lg:hidden" aria-hidden />
      <div className="hidden h-96 w-56 shrink-0 shimmer rounded-xl lg:block" aria-hidden />
    </>
  )
}
