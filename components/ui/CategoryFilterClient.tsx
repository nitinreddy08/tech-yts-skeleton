'use client'

import { useCallback, useId, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import type { SpecFilterDef } from '@/lib/utils/spec-filters'
import { specFilterParamKey } from '@/lib/utils/spec-filters'
import { Chip } from '@/components/ui/Chip'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
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

/** Sort control for the desktop title row (phones have it in the sticky toolbar). */
export function CategorySortSelect({ categorySlug }: { categorySlug: string }) {
  const router = useRouter()
  const sp = useSearchParams()
  const active = sp.get('sort') ?? 'rating_desc'
  return (
    <label className="hidden items-center gap-2 text-sm text-muted lg:flex">
      Sort
      <select
        value={active}
        onChange={(e) => {
          const params = new URLSearchParams(sp.toString())
          if (e.target.value === 'rating_desc') params.delete('sort')
          else params.set('sort', e.target.value)
          router.replace(`/${categorySlug}?${params.toString()}`, { scroll: false })
        }}
        className="h-11 cursor-pointer rounded-md border border-neutral-500 bg-surface px-3 text-sm text-primary"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}

/** A collapsible filter group (native <details>: keyboard + screen-reader friendly, no state to manage). */
function FilterGroup({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details open={defaultOpen} className="group border-b border-border pb-3 last:border-b-0 last:pb-0">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-semibold text-primary [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown size={16} className="text-muted transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="pt-1">{children}</div>
    </details>
  )
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
    startTransition(() => {
      router.replace(`/${categorySlug}`, { scroll: false })
    })
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
      onRemove: () => push({ q: null }),
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
    <div className="flex flex-col gap-3">
      <FilterGroup title="Price" defaultOpen>
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
      </FilterGroup>

      {availableBrands.length > 0 && (
        <FilterGroup title="Brand" defaultOpen>
          <div className="flex max-h-64 flex-col overflow-y-auto">
            {availableBrands.map((brand) => (
              <label key={brand} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-primary">
                <input
                  type="checkbox"
                  checked={activeBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="h-5 w-5 rounded accent-accent"
                />
                {brand}
              </label>
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup title="Rating" defaultOpen={activeRating != null}>
        <div className="flex flex-wrap gap-1.5">
          {RATINGS.map((r) => (
            <Chip key={r.value} onClick={() => toggleRating(r.value)} active={activeRating === r.value} aria-pressed={activeRating === r.value}>
              {r.label}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      {specFilters.map((def) => (
        <FilterGroup key={def.key} title={def.label} defaultOpen={!!activeSpecs[def.key]}>
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
        </FilterGroup>
      ))}

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

  const chipsRow = (
    <div className="flex flex-wrap items-center gap-2">
      {activeChips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={chip.onRemove}
          aria-label={`Remove filter: ${chip.label}`}
          className="relative inline-flex h-9 items-center gap-1.5 rounded-full bg-accent/10 px-3.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20 after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']"
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
      <div className="sticky top-[var(--navbar-height)] z-20 -mx-4 border-b border-border bg-surface/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
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

      {activeChips.length > 0 && <div className="lg:hidden">{chipsRow}</div>}

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 lg:block" aria-label="Filters">
        <div className="sticky top-[calc(var(--navbar-height)_+_1rem)] max-h-[calc(100vh-var(--navbar-height)-2rem)] overflow-y-auto rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 text-sm font-semibold text-primary">Filters</p>
          {activeChips.length > 0 && <div className="mb-3 border-b border-border pb-3">{chipsRow}</div>}
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
