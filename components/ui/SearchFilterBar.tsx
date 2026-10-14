'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useId, useState, useTransition } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
import { Chip } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { priceRangeLabel } from '@/lib/constants/price-bands'

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
  const uid = useId()
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const activeCategory = sp.get('category') ?? ''
  const activeMinPrice = sp.get('minPrice') ? Number(sp.get('minPrice')) : null
  const activeMaxPrice = sp.get('maxPrice') ? Number(sp.get('maxPrice')) : null
  const activeRating = sp.get('minRating') ? Number(sp.get('minRating')) : null
  const activeSort = sp.get('sort') ?? 'relevance'

  const activePriceRange = PRICE_RANGES.find(
    (r) => r.min === activeMinPrice && r.max === activeMaxPrice
  ) ?? null
  // A range that matches no preset (e.g. typed into the home-page budget finder)
  // is still an active filter — it gets its own removable chip below.
  const hasCustomPrice = (activeMinPrice != null || activeMaxPrice != null) && !activePriceRange

  const activeFilterCount =
    (activeCategory ? 1 : 0) + (activeMinPrice != null || activeMaxPrice != null ? 1 : 0) + (activeRating ? 1 : 0)
  const hasFilters = activeFilterCount > 0 || activeSort !== 'relevance'

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
      startTransition(() => {
        router.replace(`/search?${params.toString()}`, { scroll: false })
      })
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
    startTransition(() => {
      router.replace(query ? `/search?q=${encodeURIComponent(query)}` : '/search', { scroll: false })
    })
  }

  const panelId = `${uid}-filters`

  return (
    <div className="flex flex-col gap-3" aria-busy={pending}>
      {/* Top row: result count, filters toggle (mobile), sort */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted" aria-live="polite">
          <span className="font-semibold text-primary">{resultCount}</span>{' '}
          {resultCount === 1 ? 'result' : 'results'}
          {pending && <span className="ml-2 text-xs">Updating…</span>}
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="auto"
            className="h-11 px-3 text-sm md:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((o) => !o)}
          >
            <SlidersHorizontal size={14} aria-hidden />
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Button>
          <label htmlFor={`${uid}-sort`} className="sr-only">Sort results</label>
          <select
            id={`${uid}-sort`}
            value={activeSort}
            onChange={(e) => push({ sort: e.target.value === 'relevance' ? null : e.target.value })}
            className="h-11 cursor-pointer rounded-md border border-neutral-500 bg-surface px-3 text-sm text-primary"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter chip rows: always visible from md up, behind the Filters button on phones */}
      <div id={panelId} className={`${open ? 'flex' : 'hidden'} flex-col gap-2 md:flex`}>
        <div role="group" aria-label="Category" className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <Chip
              key={cat.slug}
              onClick={() => toggleCategory(cat.slug)}
              active={activeCategory === cat.slug}
              aria-pressed={activeCategory === cat.slug}
            >
              <span aria-hidden>{cat.icon}</span> {cat.name}
              {activeCategory === cat.slug && <X size={11} aria-hidden />}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <div role="group" aria-label="Price" className="flex flex-wrap gap-1.5">
            {PRICE_RANGES.map((r) => {
              const active = activePriceRange?.min === r.min && activePriceRange?.max === r.max
              return (
                <Chip key={r.label} onClick={() => togglePriceRange(r.min, r.max)} active={active} aria-pressed={active}>
                  {r.label}
                  {active && <X size={11} aria-hidden />}
                </Chip>
              )
            })}
            {hasCustomPrice && (
              <Chip active aria-pressed onClick={() => push({ minPrice: null, maxPrice: null })} aria-label={`Remove price filter ${priceRangeLabel('', activeMinPrice, activeMaxPrice)}`}>
                {priceRangeLabel('', activeMinPrice, activeMaxPrice)}
                <X size={11} aria-hidden />
              </Chip>
            )}
          </div>

          <span className="mx-1 hidden h-4 w-px bg-border sm:block" aria-hidden />

          <div role="group" aria-label="Minimum rating" className="flex flex-wrap gap-1.5">
            {RATINGS.map((r) => {
              const active = activeRating === r.value
              return (
                <Chip key={r.value} onClick={() => toggleRating(r.value)} active={active} aria-pressed={active}>
                  {r.label}
                  {active && <X size={11} aria-hidden />}
                </Chip>
              )
            })}
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex min-h-11 items-center gap-1 px-2 text-sm text-muted underline hover:text-primary transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
