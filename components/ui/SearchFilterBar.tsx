'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'

interface SearchFilterBarProps {
  categories: { slug: string; name: string; icon: string }[]
  resultCount: number
  query: string
}

const PRICE_RANGES = [
  { label: 'Under ₹15K', min: 0, max: 15000 },
  { label: '₹15K–30K', min: 15000, max: 30000 },
  { label: '₹30K–60K', min: 30000, max: 60000 },
  { label: '₹60K–1L', min: 60000, max: 100000 },
  { label: 'Over ₹1L', min: 100000, max: 999999 },
]

const RATINGS = [
  { label: '9+ Excellent', value: 9 },
  { label: '8+ Good', value: 8 },
  { label: '7+ Decent', value: 7 },
]

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Top Rated', value: 'rating_desc' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Newest', value: 'newest' },
]

export function SearchFilterBar({ categories, resultCount, query }: SearchFilterBarProps) {
  const router = useRouter()
  const sp = useSearchParams()

  const activeCategory = sp.get('category') ?? ''
  const activeMinPrice = sp.get('minPrice') ? Number(sp.get('minPrice')) : null
  const activeMaxPrice = sp.get('maxPrice') ? Number(sp.get('maxPrice')) : null
  const activeRating = sp.get('minRating') ? Number(sp.get('minRating')) : null
  const activeSort = sp.get('sort') ?? 'relevance'

  const activePriceRange = PRICE_RANGES.find(
    (r) => r.min === activeMinPrice && r.max === activeMaxPrice
  ) ?? null

  const hasFilters = activeCategory || activePriceRange || activeRating || activeSort !== 'relevance'

  const push = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(sp.toString())
      for (const [k, v] of Object.entries(updates)) {
        if (v == null || v === '') {
          params.delete(k)
        } else {
          params.set(k, v)
        }
      }
      router.push(`/search?${params.toString()}`)
    },
    [sp, router]
  )

  function toggleCategory(slug: string) {
    push({ category: activeCategory === slug ? null : slug })
  }

  function togglePriceRange(min: number, max: number) {
    if (activeMinPrice === min && activeMaxPrice === max) {
      push({ minPrice: null, maxPrice: null })
    } else {
      push({ minPrice: String(min), maxPrice: String(max) })
    }
  }

  function toggleRating(val: number) {
    push({ minRating: activeRating === val ? null : String(val) })
  }

  function clearAll() {
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  // Chip base classes
  const chip = (active: boolean) =>
    [
      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium cursor-pointer transition-all select-none',
      active
        ? 'border-accent bg-accent text-white shadow-sm'
        : 'border-border bg-surface text-muted hover:border-accent hover:text-accent',
    ].join(' ')

  return (
    <div className="flex flex-col gap-3">
      {/* Top row: result count + sort */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          <span className="font-semibold text-primary">{resultCount}</span>{' '}
          {resultCount === 1 ? 'result' : 'results'}
          {query && (
            <>
              {' '}for{' '}
              <span className="font-semibold text-primary">&ldquo;{query}&rdquo;</span>
            </>
          )}
        </p>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={13} className="text-muted" />
          <select
            value={activeSort}
            onChange={(e) => push({ sort: e.target.value === 'relevance' ? null : e.target.value })}
            className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-primary outline-none focus:border-accent cursor-pointer"
            aria-label="Sort results"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter chip rows */}
      <div className="flex flex-col gap-2">
        {/* Category chips */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => toggleCategory(cat.slug)}
              className={chip(activeCategory === cat.slug)}
              aria-pressed={activeCategory === cat.slug}
            >
              {cat.icon} {cat.name}
              {activeCategory === cat.slug && <X size={11} />}
            </button>
          ))}
        </div>

        {/* Price + Rating chips + clear all */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {PRICE_RANGES.map((r) => {
            const active = activePriceRange?.min === r.min && activePriceRange?.max === r.max
            return (
              <button
                key={r.label}
                onClick={() => togglePriceRange(r.min, r.max)}
                className={chip(active)}
                aria-pressed={active}
              >
                {r.label}
                {active && <X size={11} />}
              </button>
            )
          })}

          <span className="mx-1 h-4 w-px bg-border" aria-hidden />

          {RATINGS.map((r) => {
            const active = activeRating === r.value
            return (
              <button
                key={r.value}
                onClick={() => toggleRating(r.value)}
                className={chip(active)}
                aria-pressed={active}
              >
                ⭐ {r.label}
                {active && <X size={11} />}
              </button>
            )
          })}

          {hasFilters && (
            <button
              onClick={clearAll}
              className="ml-1 inline-flex items-center gap-1 text-xs text-muted hover:text-primary transition-colors"
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
