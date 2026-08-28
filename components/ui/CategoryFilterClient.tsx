'use client'

import { useCallback, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X, Search } from 'lucide-react'
import type { SpecFilterDef } from '@/lib/utils/spec-filters'
import { specFilterParamKey } from '@/lib/utils/spec-filters'
import { Chip } from '@/components/ui/Chip'
import { Badge } from '@/components/ui/Badge'

const PRICE_RANGES = [
  { label: 'Under ₹20K', min: 0, max: 20000 },
  { label: '₹20K–50K', min: 20000, max: 50000 },
  { label: '₹50K–80K', min: 50000, max: 80000 },
  { label: 'Over ₹80K', min: 80000, max: 999999 },
]

const RATINGS = [
  { label: '9+ Excellent', value: 9 },
  { label: '8+ Good', value: 8 },
  { label: '7+ Decent', value: 7 },
]

const SORT_OPTIONS = [
  { label: 'Top Rated', value: 'rating_desc' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Newest', value: 'newest' },
]

interface CategoryFilterClientProps {
  categorySlug: string
  availableBrands: string[]
  specFilters: SpecFilterDef[]
  resultCount: number
  totalCount: number
}

export function CategoryFilterClient({
  categorySlug,
  availableBrands,
  specFilters,
  resultCount,
  totalCount,
}: CategoryFilterClientProps) {
  const router = useRouter()
  const sp = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(sp.get('q') ?? '')

  const activeBrands = sp.get('brands')?.split(',').filter(Boolean) ?? []
  const activeMinPrice = sp.get('minPrice') ? Number(sp.get('minPrice')) : null
  const activeMaxPrice = sp.get('maxPrice') ? Number(sp.get('maxPrice')) : null
  const activeRating = sp.get('rating') ? Number(sp.get('rating')) : null
  const activeSort = sp.get('sort') ?? 'rating_desc'
  const activeQuery = sp.get('q') ?? ''

  const activeSpecs: Record<string, string> = {}
  specFilters.forEach((def) => {
    const val = sp.get(specFilterParamKey(def.key))
    if (val) activeSpecs[def.key] = val
  })

  const activePriceRange = PRICE_RANGES.find(
    (r) => r.min === activeMinPrice && r.max === activeMaxPrice
  )

  const push = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(sp.toString())
      for (const [k, v] of Object.entries(updates)) {
        if (v == null || v === '') params.delete(k)
        else params.set(k, v)
      }
      router.push(`/${categorySlug}?${params.toString()}`)
    },
    [sp, router, categorySlug]
  )

  function toggleBrand(brand: string) {
    const next = activeBrands.includes(brand)
      ? activeBrands.filter((b) => b !== brand)
      : [...activeBrands, brand]
    push({ brands: next.length ? next.join(',') : null })
  }

  function togglePriceRange(min: number, max: number) {
    if (activeMinPrice === min && activeMaxPrice === max) {
      push({ minPrice: null, maxPrice: null })
    } else {
      push({ minPrice: String(min), maxPrice: String(max) })
    }
  }

  function toggleRating(val: number) {
    push({ rating: activeRating === val ? null : String(val) })
  }

  function toggleSpec(key: string, value: string) {
    const param = specFilterParamKey(key)
    push({ [param]: activeSpecs[key] === value ? null : value })
  }

  function clearAll() {
    setSearchInput('')
    router.push(`/${categorySlug}`)
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    push({ q: searchInput.trim() || null })
    setDrawerOpen(false)
  }

  const activeChips: { label: string; onRemove: () => void }[] = []

  activeBrands.forEach((b) =>
    activeChips.push({ label: b, onRemove: () => toggleBrand(b) })
  )
  if (activePriceRange) {
    activeChips.push({
      label: activePriceRange.label,
      onRemove: () => push({ minPrice: null, maxPrice: null }),
    })
  }
  if (activeRating) {
    activeChips.push({
      label: `${activeRating}+ rating`,
      onRemove: () => push({ rating: null }),
    })
  }
  if (activeQuery) {
    activeChips.push({
      label: `"${activeQuery}"`,
      onRemove: () => {
        setSearchInput('')
        push({ q: null })
      },
    })
  }
  specFilters.forEach((def) => {
    const val = activeSpecs[def.key]
    if (!val) return
    const opt = def.options.find((o) => o.value === val)
    activeChips.push({
      label: opt?.label ?? `${def.label}: ${val}`,
      onRemove: () => toggleSpec(def.key, val),
    })
  })

  const hasFilters = activeChips.length > 0 || activeSort !== 'rating_desc'

  const filterPanel = (
    <div className="flex flex-col gap-5">
      {/* In-category search */}
      <form onSubmit={submitSearch}>
        <label htmlFor="cat-search" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
          Search in category
        </label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="cat-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Filter by name…"
            className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-sm text-primary placeholder:text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
          />
        </div>
      </form>

      {/* Sort */}
      <div>
        <label htmlFor="cat-sort" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
          Sort
        </label>
        <select
          id="cat-sort"
          value={activeSort}
          onChange={(e) => push({ sort: e.target.value === 'rating_desc' ? null : e.target.value })}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Spec filters — 91Mobiles / GSMArena pattern */}
      {specFilters.map((def) => (
        <div key={def.key}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{def.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {def.options.map((opt) => (
              <Chip
                key={`${def.key}-${opt.value}`}
                onClick={() => toggleSpec(def.key, opt.value)}
                active={activeSpecs[def.key] === opt.value}
              >
                {opt.label}
              </Chip>
            ))}
          </div>
        </div>
      ))}

      {/* Price range chips */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Price Range</p>
        <div className="flex flex-wrap gap-1.5">
          {PRICE_RANGES.map((r) => (
            <Chip
              key={r.label}
              onClick={() => togglePriceRange(r.min, r.max)}
              active={activeMinPrice === r.min && activeMaxPrice === r.max}
            >
              {r.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Brands */}
      {availableBrands.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Brand</p>
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
            {availableBrands.map((brand) => (
              <label key={brand} className="flex cursor-pointer items-center gap-2 text-sm text-primary">
                <input
                  type="checkbox"
                  checked={activeBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="accent-accent rounded"
                />
                {brand}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Rating */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Min Rating</p>
        <div className="flex flex-wrap gap-1.5">
          {RATINGS.map((r) => (
            <Chip key={r.value} onClick={() => toggleRating(r.value)} active={activeRating === r.value}>
              {r.label}
            </Chip>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="w-full rounded-lg border border-border py-2 text-sm font-medium text-muted hover:text-primary transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Sticky mobile toolbar */}
      <div className="sticky top-[var(--navbar-height,64px)] z-20 -mx-4 px-4 py-3 bg-surface/95 backdrop-blur border-b border-border lg:hidden mb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-primary"
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeChips.length > 0 && (
              <Badge variant="accent" size="sm">{activeChips.length}</Badge>
            )}
          </button>
          <p className="ml-auto text-xs text-muted">
            <span className="font-semibold text-primary">{resultCount}</span> of {totalCount}
          </p>
        </div>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {activeChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.onRemove}
              className="inline-flex items-center gap-1 rounded-full bg-accent/10 text-accent px-3 py-1 text-xs font-medium hover:bg-accent/20 transition-colors"
            >
              {chip.label}
              <X size={12} />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-muted hover:text-primary underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-24 rounded-xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-primary mb-4">
            Filters
            <span className="ml-2 text-xs font-normal text-muted">
              {resultCount} of {totalCount}
            </span>
          </p>
          {filterPanel}
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-surface shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <h2 className="font-semibold text-primary">Filters</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-2 hover:bg-surface-alt"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{filterPanel}</div>
            <div className="border-t border-border p-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white"
              >
                Show {resultCount} result{resultCount !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
