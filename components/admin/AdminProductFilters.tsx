'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { Search, X } from 'lucide-react'

interface AdminProductFiltersProps {
  categories: { slug: string; name: string }[]
  currentQ: string
  currentStatus: string
  currentCategory: string
  resultCount: number
}

export function AdminProductFilters({
  categories,
  currentQ,
  currentStatus,
  currentCategory,
  resultCount,
}: AdminProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState(currentQ)

  useEffect(() => {
    setQuery(currentQ)
  }, [currentQ])

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value)
        else params.delete(key)
      }
      params.delete('page')
      startTransition(() => {
        router.push(`/admin/products?${params.toString()}`)
      })
    },
    [router, searchParams]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== currentQ) updateParams({ q: query || null })
    }, 300)
    return () => clearTimeout(timer)
  }, [query, currentQ, updateParams])

  const hasFilters = Boolean(currentQ || currentStatus || currentCategory)

  return (
    <div className={`rounded-xl border border-border bg-surface p-4 mb-4 ${isPending ? 'opacity-70' : ''}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search by name, slug, or brand…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-alt pl-9 pr-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
            aria-label="Search products"
          />
        </div>

        <select
          value={currentCategory}
          onChange={(e) => updateParams({ category: e.target.value || null })}
          className="rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={currentStatus}
          onChange={(e) => updateParams({ status: e.target.value || null })}
          className="rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>
          {resultCount} product{resultCount !== 1 ? 's' : ''}
          {hasFilters ? ' matching filters' : ''}
        </span>
        {hasFilters && (
          <button
            type="button"
            onClick={() => updateParams({ q: null, status: null, category: null })}
            className="inline-flex items-center gap-1 text-accent hover:underline"
          >
            <X size={12} /> Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
