'use client'

import { useCallback, useId, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X, Search } from 'lucide-react'
import type { SpecFilterDef } from '@/lib/utils/spec-filters'
import { specFilterParamKey } from '@/lib/utils/spec-filters'
import { Chip } from '@/components/ui/Chip'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { priceBandsFor, priceRangeLabel } from '@/lib/constants/price-bands'
import { useDialog } from '@/lib/hooks/useDialog'

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
  const [pending, startTransition] = useTransition()
  const uid = useId()
  const drawerRef = useDialog<HTMLDivElement>(drawerOpen, () => setDrawerOpen(false))
  const priceBands = priceBandsFor(categorySlug)
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

  const hasPriceFilter = activeMinPrice != null || activeMaxPrice != null

  const push = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(sp.toString())
      for (const [k, v] of Object.entries(updates)) {
        if (v == null || v === '') params.delete(k)
        else params.set(k, v)
      }
      // replace (not push): toggling a filter shouldn't add a back-button
      // entry per click. The transition drives the "updating" indicator.
      startTransition(() => {
        router.replace(`/${categorySlug}?${params.toString()}`, { scroll: false })
      })
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
    startTransition(() => {
      router.replace(`/${categorySlug}`, { scroll: false })
    })
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
  if (hasPriceFilter) {
    activeChips.push({
      label: priceRangeLabel(categorySlug, activeMinPrice, activeMaxPrice),
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
        <label htmlFor={`${uid}-search`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
          Search in category
        </label>
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <Input
            id={`${uid}-search`}
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Name or keyword…"
            className="pl-9 text-base sm:text-sm"
          />
        </div>
      </form>

      {/* Sort */}
      <div>
        <label htmlFor={`${uid}-sort`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
          Sort
        </label>
        <select
          id={`${uid}-sort`}
          value={activeSort}
          onChange={(e) => push({ sort: e.target.value === 'rating_desc' ? null : e.target.value })}
          className="h-11 w-full rounded-md border border-neutral-500 bg-surface px-3 text-sm text-primary"
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
                aria-pressed={activeSpecs[def.key] === opt.value}
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
          {priceBands.map((r) => (
            <Chip
              key={r.label}
              onClick={() => togglePriceRange(r.min, r.max)}
              active={activeMinPrice === r.min && activeMaxPrice === r.max}
              aria-pressed={activeMinPrice === r.min && activeMaxPrice === r.max}
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
          <div className="flex flex-col max-h-48 overflow-y-auto">
            {availableBrands.map((brand) => (
              <label key={brand} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-primary">
                <input
                  type="checkbox"
                  checked={activeBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="h-5 w-5 accent-accent rounded"
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
            <Chip key={r.value} onClick={() => toggleRating(r.value)} active={activeRating === r.value} aria-pressed={activeRating === r.value}>
              {r.label}
            </Chip>
          ))}
        </div>
      </div>

      {hasFilters && (
        <Button variant="secondary" size="auto" onClick={clearAll} className="h-11 w-full text-sm">
          Clear all filters
        </Button>
      )}
    </div>
  )

  const sortControl = (id: string, className: string) => (
    <select
      id={id}
      aria-label="Sort products"
      value={activeSort}
      onChange={(e) => push({ sort: e.target.value === 'rating_desc' ? null : e.target.value })}
      className={className}
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )

  return (
    <>
      {/* Subtle progress bar while a filter change is loading */}
      {pending && (
        <div role="status" className="fixed inset-x-0 top-0 z-[80] h-0.5 animate-pulse bg-accent">
          <span className="sr-only">Updating results</span>
        </div>
      )}

      {/* Sticky mobile toolbar: filters + sort are both one tap away */}
      <div className="sticky top-[var(--navbar-height)] z-20 -mx-4 px-4 py-2 bg-surface/95 backdrop-blur border-b border-border lg:hidden">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="auto" onClick={() => setDrawerOpen(true)} className="h-11 shrink-0 px-3 text-sm">
            <SlidersHorizontal size={14} aria-hidden />
            Filters
            {activeChips.length > 0 && (
              <Badge variant="accent" size="sm">{activeChips.length}</Badge>
            )}
          </Button>
          {sortControl(`${uid}-sort-mobile`, 'h-11 min-w-0 flex-1 rounded-md border border-neutral-500 bg-surface px-2 text-sm text-primary')}
          <p className="shrink-0 text-xs text-muted" aria-live="polite">
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
              aria-label={`Remove filter: ${chip.label}`}
              className="relative inline-flex h-9 items-center gap-1.5 rounded-full bg-accent/10 px-3.5 text-sm font-medium text-accent hover:bg-accent/20 transition-colors after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']"
            >
              {chip.label}
              <X size={12} aria-hidden />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex min-h-11 items-center px-2 text-sm text-muted underline hover:text-primary"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0" aria-label="Filters">
        <div className="sticky top-[calc(var(--navbar-height)_+_1rem)] max-h-[calc(100vh-var(--navbar-height)-2rem)] overflow-y-auto rounded-xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-primary mb-4">
            Filters
            <span className="ml-2 text-xs font-normal text-muted" aria-live="polite">
              {resultCount} of {totalCount}
            </span>
          </p>
          {filterPanel}
        </div>
      </aside>

      {/* Mobile drawer — portaled above the fixed bars, with dialog semantics */}
      {drawerOpen &&
        createPortal(
          <div className="fixed inset-0 z-[70] lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} aria-hidden />
            <div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-surface shadow-xl outline-none"
            >
              <div className="flex items-center justify-between border-b border-border px-4 h-14 shrink-0">
                <h2 className="font-semibold text-primary">Filters</h2>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-surface-alt"
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">{filterPanel}</div>
              <div className="border-t border-border p-4">
                <Button size="md" onClick={() => setDrawerOpen(false)} className="w-full">
                  Show {resultCount} result{resultCount !== 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
