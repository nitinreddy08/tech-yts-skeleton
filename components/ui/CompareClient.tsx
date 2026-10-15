'use client'

import { useId, useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X, Plus, Crown, ArrowUpDown, ExternalLink, Printer, Info } from 'lucide-react'
import { RatingBadge } from '@/components/ui/RatingBadge'
import { Price } from '@/components/ui/Price'
import { AffiliateOutboundLink } from '@/components/ui/AffiliateOutboundLink'
import { Button, buttonVariants } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { getBestOffer } from '@/lib/utils/best-offer'
import { ShareBar } from '@/components/ui/ShareBar'
import { CompareWinnerSummary } from '@/components/ui/CompareWinnerSummary'
import { CompareSuggestions } from '@/components/ui/CompareSuggestions'
import { saveRecentCompare } from '@/lib/utils/recent-compares'
import { specWinners } from '@/lib/utils/compare-scores'
import type { ProductDetail, SpecDiffRow } from '@/types'

interface CompareClientProps {
  products: ProductDetail[]
  diffRows: SpecDiffRow[]
  allProductOptions: { id: string; name: string; slug: string; thumbnail_url: string }[]
  shareUrl?: string
  /** Slugs the URL asked for that don't exist, so we can say so instead of silently dropping them. */
  missingSlugs?: string[]
}

// ── helpers ──────────────────────────────────────────────────────────────────

function formatVal(v: string | number | boolean | null): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  return String(v)
}

/**
 * Which products "win" a spec row. Direction-aware (lighter beats heavier,
 * more RAM beats less) — see specWinners.
 */
function winnerFlags(values: (string | number | boolean | null)[], specKey: string): boolean[] {
  return specWinners(values, specKey)
}

// ── component ─────────────────────────────────────────────────────────────────

export function CompareClient({ products, diffRows, allProductOptions, shareUrl, missingSlugs = [] }: CompareClientProps) {
  const router = useRouter()
  const uid = useId()
  const [diffsOnly, setDiffsOnly] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerQuery, setPickerQuery] = useState('')
  const [activeOption, setActiveOption] = useState(0)
  const pickerRef = useRef<HTMLDivElement>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)

  function closePicker(restoreFocus = false) {
    setPickerOpen(false)
    setPickerQuery('')
    setActiveOption(0)
    if (restoreFocus) addButtonRef.current?.focus()
  }

  // Close the picker on an outside press (mouse or touch)
  useEffect(() => {
    if (!pickerOpen) return
    function handler(e: PointerEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
        setPickerQuery('')
        setActiveOption(0)
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [pickerOpen])

  useEffect(() => {
    if (products.length >= 2) {
      saveRecentCompare(
        products.map((p) => p.slug),
        products.map((p) => p.name)
      )
    }
  }, [products])

  const rows = diffsOnly ? diffRows.filter((r) => r.hasDiff) : diffRows
  const slots = 4 // max products
  const cols = Math.max(products.length + (products.length < slots ? 1 : 0), 2)
  const allIdentical = products.length >= 2 && diffRows.length > 0 && diffRows.every((r) => !r.hasDiff)

  // Navigate by updating URL ?products= param
  function removeProduct(slug: string) {
    const remaining = products.filter((p) => p.slug !== slug).map((p) => p.slug)
    if (remaining.length === 0) {
      router.push('/compare')
    } else {
      router.push(`/compare?products=${remaining.join(',')}`)
    }
  }

  function addProduct(slug: string) {
    const current = products.map((p) => p.slug)
    if (current.includes(slug)) return
    router.push(`/compare?products=${[...current, slug].join(',')}`)
    closePicker()
  }

  const filteredOptions = allProductOptions.filter(
    (o) =>
      !products.some((p) => p.slug === o.slug) &&
      o.name.toLowerCase().includes(pickerQuery.toLowerCase())
  )

  function onPickerKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      closePicker(true)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveOption((i) => Math.min(filteredOptions.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveOption((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter' && filteredOptions[activeOption]) {
      e.preventDefault()
      addProduct(filteredOptions[activeOption].slug)
    }
  }

  const listboxId = `${uid}-options`

  return (
    <div className="compare-print-area flex flex-col gap-4 md:gap-5">
      {/* ── Controls bar ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h2 text-primary">
            {products.length >= 2
              ? products.map((p) => p.name).join(' vs ')
              : 'Compare Products'}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            {products.length < 2
              ? 'Pick at least 2 products to start comparing'
              : `${rows.length} spec${rows.length !== 1 ? 's' : ''} compared`}
          </p>
        </div>

        {products.length >= 2 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 no-print">
            {shareUrl && (
              <ShareBar
                url={shareUrl}
                title={products.map((p) => p.name).join(' vs ')}
                text={`Compare ${products.map((p) => p.name).join(', ')} — specs, prices & ratings side-by-side.`}
                className="!mt-0"
              />
            )}
            <Button variant="secondary" size="auto" onClick={() => window.print()} className="hidden h-11 px-3 text-sm md:inline-flex">
              <Printer size={14} aria-hidden />
              Print
            </Button>
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium text-primary">
              <Toggle checked={diffsOnly} onChange={setDiffsOnly} aria-label="Show differences only" />
              Differences only
            </label>
          </div>
        )}
      </div>

      {missingSlugs.length > 0 && (
        <p role="status" className="flex items-start gap-2 rounded-lg bg-info-50 px-3 py-2 text-sm text-info-700">
          <Info size={16} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            We couldn&apos;t find {missingSlugs.map((m) => `“${m}”`).join(', ')}, so it isn&apos;t in this comparison.
          </span>
        </p>
      )}

      {/* ── Product header cards + picker ─────────────────────────────────
          Phones scroll these sideways at a readable width instead of squeezing
          3–4 cards into ~80px columns; from sm up they share the row. */}
      <div
        className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {products.map((p) => {
          const best = getBestOffer(p.affiliate_links)
          const link = best.link

          return (
            <div
              key={p.id}
              className="relative flex w-44 shrink-0 snap-start flex-col rounded-xl border border-border bg-surface p-3 sm:w-auto sm:p-4"
            >
              <button
                type="button"
                onClick={() => removeProduct(p.slug)}
                className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-full text-muted hover:text-primary transition-colors no-print"
                aria-label={`Remove ${p.name} from comparison`}
              >
                <X size={14} aria-hidden />
              </button>

              <Link href={`/${p.category_slug}/${p.slug}`} tabIndex={-1} aria-hidden>
                <div className="relative mx-auto mb-2 h-20 w-20 overflow-hidden rounded-xl bg-surface-alt">
                  {p.thumbnail_url && (
                    <Image src={p.thumbnail_url} alt="" fill sizes="80px" className="object-contain p-2" />
                  )}
                </div>
              </Link>

              <p className="text-xs text-muted">{p.brand_name}</p>
              <Link href={`/${p.category_slug}/${p.slug}`}>
                <h2 className="mt-0.5 text-sm font-semibold text-primary leading-tight hover:text-accent transition-colors line-clamp-2">
                  {p.name}
                </h2>
              </Link>

              <div className="mt-2">
                <RatingBadge score={p.creator_rating} showVerdict />
              </div>

              {best.price != null ? (
                <Price value={best.price} size="md" className="mt-2" />
              ) : (
                <p className="mt-2 text-sm text-muted">{best.allUnavailable ? 'Out of stock' : 'Price unavailable'}</p>
              )}

              {link && (
                <AffiliateOutboundLink
                  href={`/go/${link.id}`}
                  linkId={link.id}
                  storeName={link.store_name}
                  productName={p.name}
                  priceInr={link.price_inr}
                  className={buttonVariants({ variant: 'primary', size: 'sm', className: 'mt-3 w-full px-2 text-sm no-print' })}
                >
                  <span className="truncate">Buy at {link.store_name}</span>
                  <ExternalLink size={11} className="opacity-70 shrink-0" aria-hidden />
                  <span className="sr-only"> (opens in a new tab)</span>
                </AffiliateOutboundLink>
              )}
            </div>
          )
        })}

        {/* Add product slot — show while under max */}
        {products.length < slots && (
          <div ref={pickerRef} className="relative w-44 shrink-0 snap-start sm:w-auto no-print">
            <button
              ref={addButtonRef}
              type="button"
              onClick={() => (pickerOpen ? closePicker() : setPickerOpen(true))}
              aria-expanded={pickerOpen}
              aria-haspopup="listbox"
              className="flex h-full min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-500 bg-surface-alt text-muted hover:border-accent hover:text-accent transition-colors"
            >
              <Plus size={24} aria-hidden />
              <span className="text-sm font-medium">Add product</span>
            </button>

            {pickerOpen && (
              <div
                onKeyDown={onPickerKeyDown}
                className="absolute right-0 top-full z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-surface shadow-lg sm:left-0 sm:right-auto"
              >
                <div className="border-b border-border p-2">
                  <label htmlFor={`${uid}-search`} className="sr-only">Search products to add</label>
                  <Input
                    id={`${uid}-search`}
                    autoFocus
                    type="search"
                    role="combobox"
                    aria-expanded
                    aria-controls={listboxId}
                    aria-activedescendant={filteredOptions[activeOption] ? `${uid}-opt-${activeOption}` : undefined}
                    aria-autocomplete="list"
                    value={pickerQuery}
                    onChange={(e) => {
                      setPickerQuery(e.target.value)
                      setActiveOption(0)
                    }}
                    placeholder="Search products…"
                    autoComplete="off"
                  />
                </div>

                <ul id={listboxId} role="listbox" aria-label="Products" className="max-h-64 overflow-y-auto">
                  {filteredOptions.length === 0 ? (
                    <li role="presentation" className="px-4 py-3 text-sm text-muted">No products found</li>
                  ) : (
                    filteredOptions.map((opt, i) => (
                      <li
                        key={opt.slug}
                        id={`${uid}-opt-${i}`}
                        role="option"
                        aria-selected={i === activeOption}
                        onMouseEnter={() => setActiveOption(i)}
                        onClick={() => addProduct(opt.slug)}
                        className={`flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2 text-sm text-primary transition-colors ${
                          i === activeOption ? 'bg-surface-alt' : ''
                        }`}
                      >
                        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-surface-alt">
                          {opt.thumbnail_url && (
                            <Image src={opt.thumbnail_url} alt="" fill sizes="32px" className="object-contain p-0.5" />
                          )}
                        </div>
                        <span className="flex-1 leading-tight line-clamp-2">{opt.name}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Spec win summary ───────────────────────────────────────────── */}
      {products.length >= 2 && rows.length > 0 && (
        <CompareWinnerSummary products={products} diffRows={diffRows} />
      )}

      {allIdentical && diffsOnly && (
        <p role="status" className="rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm text-muted">
          These products have identical specs — switch off &ldquo;Differences only&rdquo; to see them side by side.
        </p>
      )}

      {/* ── Spec table ─────────────────────────────────────────────────── */}
      {products.length >= 2 && rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm" style={{ minWidth: `${products.length * 130 + 96}px` }}>
            <caption className="sr-only">Specification comparison</caption>
            <thead className="bg-surface-alt border-b border-border">
              <tr>
                <th scope="col" className="sticky left-0 z-10 w-24 bg-surface-alt px-3 py-3 text-left sm:w-36 sm:px-4 text-xs font-semibold uppercase tracking-wider text-muted">
                  Spec
                </th>
                {products.map((p) => (
                  <th key={p.id} scope="col" className="px-2 py-3 text-center text-xs font-semibold text-primary sm:px-4">
                    <span className="line-clamp-2">{p.name}</span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {rows.map((row, rowIdx) => {
                const winners = row.hasDiff ? winnerFlags(row.values, row.specKey) : []

                return (
                  <tr
                    key={row.specKey}
                    className={[
                      rowIdx % 2 === 0 ? 'bg-surface' : 'bg-surface-alt',
                      row.hasDiff ? 'ring-1 ring-inset ring-accent/20' : '',
                    ].join(' ')}
                  >
                    <th scope="row" className="sticky left-0 z-10 w-24 bg-inherit px-3 py-3 text-left text-xs font-medium text-muted sm:w-36 sm:px-4">
                      <div className="flex items-center gap-1.5">
                        {row.hasDiff && (
                          <>
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                            <span className="sr-only">Values differ: </span>
                          </>
                        )}
                        {row.label}
                      </div>
                    </th>

                    {row.values.map((val, colIdx) => {
                      const isWinner = winners[colIdx]

                      return (
                        <td
                          key={colIdx}
                          className={['px-2 py-3 text-center text-sm sm:px-4', isWinner ? 'font-semibold' : ''].join(' ')}
                        >
                          <span
                            className={[
                              'inline-flex items-center justify-center gap-1',
                              isWinner ? 'text-accent' : 'text-primary',
                            ].join(' ')}
                          >
                            {isWinner && (
                              <>
                                <Crown size={12} className="shrink-0 text-accent" aria-hidden />
                                <span className="sr-only">Best: </span>
                              </>
                            )}
                            {formatVal(val)}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Legend ─────────────────────────────────────────────────────── */}
      {products.length >= 2 && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <Crown size={12} className="text-accent" aria-hidden /> Better on this spec (lighter, bigger or longer — whichever is better)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden /> Values differ
          </span>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {products.length < 2 && (
        <div className="flex flex-col items-center gap-5 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-alt text-muted">
            <ArrowUpDown size={28} aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold text-primary">Add products to compare</h2>
            <p className="text-sm text-muted max-w-xs mt-1">
              Pick up to 4 products and compare specs side by side — or jump into a popular matchup below.
            </p>
          </div>
          <CompareSuggestions className="max-w-2xl" />
        </div>
      )}
    </div>
  )
}
