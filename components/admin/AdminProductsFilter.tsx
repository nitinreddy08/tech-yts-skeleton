'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search, X } from 'lucide-react'

interface CategoryOption {
  slug: string
  name: string
}

interface AdminProductsFilterProps {
  categories: CategoryOption[]
  currentQ: string
  currentCategory: string
  currentStatus: string
}

export function AdminProductsFilter({
  categories,
  currentQ,
  currentCategory,
  currentStatus,
}: AdminProductsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value)
        else params.delete(key)
      })
      params.delete('page')
      startTransition(() => {
        router.push(`/admin/products?${params.toString()}`)
      })
    },
    [router, searchParams]
  )

  const hasFilters = Boolean(currentQ || currentCategory || currentStatus)

  return (
    <form
      className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        updateParams({
          q: (fd.get('q') as string)?.trim() ?? '',
          category: (fd.get('category') as string) ?? '',
          status: (fd.get('status') as string) ?? '',
        })
      }}
    >
      <div className="relative flex-1 min-w-[200px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          name="q"
          type="search"
          defaultValue={currentQ}
          placeholder="Search name, slug, or brand…"
          className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <select
        name="category"
        defaultValue={currentCategory}
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        name="status"
        defaultValue={currentStatus}
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="">All statuses</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </select>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {isPending ? 'Filtering…' : 'Filter'}
      </button>

      {hasFilters && (
        <button
          type="button"
          onClick={() => updateParams({ q: '', category: '', status: '' })}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-primary hover:bg-surface-alt transition-colors"
        >
          <X size={14} />
          Clear
        </button>
      )}
    </form>
  )
}
