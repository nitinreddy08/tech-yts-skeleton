'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  X,
  Plus,
  Crown,
  ArrowUpDown,
  ShoppingCart,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Printer,
} from 'lucide-react'
import { formatIndianPrice } from '@/lib/utils/format'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { AffiliateOutboundLink } from '@/components/ui/AffiliateOutboundLink'
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
}

// ── helpers ──────────────────────────────────────────────────────────────────

function formatVal(v: string | number | boolean | null): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  return String(v)
}

/**
 * For numeric specs, find which product has the highest value.
 * Returns an array of booleans indicating if that product "wins" this row.
 */
function winnerFlags(values: (string | number | boolean | null)[]): boolean[] {
  return specWinners(values)
}

// ── component ─────────────────────────────────────────────────────────────────

export function CompareClient({ products, diffRows, allProductOptions, shareUrl }: CompareClientProps) {
  const router = useRouter()
  const [diffsOnly, setDiffsOnly] = useState(false)
  const [pickerOpen, setPickerOpen] = useState<number | null>(null) // slot index
  const [pickerQuery, setPickerQuery] = useState('')
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(null)
        setPickerQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
    setPickerOpen(null)
    setPickerQuery('')
  }

  const filteredOptions = allProductOptions.filter(
    (o) =>
      !products.some((p) => p.slug === o.slug) &&
      o.name.toLowerCase().includes(pickerQuery.toLowerCase())
  )

  // Cheapest price per product
  function bestPrice(p: ProductDetail): number | null {
    const prices = p.affiliate_links.map((l) => l.price_inr).filter((x): x is number => x != null)
    return prices.length ? Math.min(...prices) : null
  }

  return (
    <div className="compare-print-area flex flex-col gap-6">
      {/* ── Controls bar ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-primary">
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
          <div className="flex flex-wrap items-center gap-2 no-print">
            {shareUrl && (
              <ShareBar
                url={shareUrl}
                title={products.map((p) => p.name).join(' vs ')}
                text={`Compare ${products.map((p) => p.name).join(', ')} — specs, prices & ratings side-by-side.`}
                className="!mt-0"
              />
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:border-accent hover:text-accent transition-colors"
            >
              <Printer size={13} />
              Print
            </button>
            <button
              onClick={() => setDiffsOnly((v) => !v)}
              className={[
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                diffsOnly
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted hover:border-accent hover:text-accent',
              ].join(' ')}
              aria-pressed={diffsOnly}
            >
              <ArrowUpDown size={13} />
              {diffsOnly ? 'Showing differences' : 'Show differences only'}
            </button>
          </div>
        )}
      </div>

      {/* ── Product header cards + picker ─────────────────────────────── */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {/* Existing product cards */}
        {products.map((p) => {
          const price = bestPrice(p)
          const cheapestLink = [...p.affiliate_links]
            .sort((a, b) => (a.price_inr ?? Infinity) - (b.price_inr ?? Infinity))
            .find((l) => l.price_inr != null)

          return (
            <div
              key={p.id}
              className="relative flex flex-col rounded-xl border border-border bg-surface p-4 shadow-sm"
            >
              {/* Remove button */}
              <button
                onClick={() => removeProduct(p.slug)}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-muted hover:bg-surface-alt hover:text-primary transition-colors"
                aria-label={`Remove ${p.name}`}
              >
                <X size={13} />
              </button>

              {/* Thumbnail */}
              <Link href={`/${p.category_slug}/${p.slug}`}>
                <div className="relative mx-auto mb-3 h-24 w-24 overflow-hidden rounded-xl bg-surface-alt">
                  {p.thumbnail_url && (
                    <Image
                      src={p.thumbnail_url}
                      alt={p.name}
                      fill
                      sizes="96px"
                      className="object-contain p-2"
                    />
                  )}
                </div>
              </Link>

              {/* Info */}
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                {p.brand_name}
              </p>
              <Link href={`/${p.category_slug}/${p.slug}`}>
                <h2 className="mt-0.5 text-sm font-semibold text-primary leading-tight hover:text-accent transition-colors line-clamp-2">
                  {p.name}
                </h2>
              </Link>

              {/* Score ring */}
              <div className="my-3 flex justify-center">
                <ScoreRing score={p.creator_rating} size={64} />
              </div>

              {/* Price */}
              {price != null && (
                <p className="text-center text-base font-extrabold text-accent">
                  {formatIndianPrice(price)}
                </p>
              )}

              {/* Buy button */}
              {cheapestLink && (
                <AffiliateOutboundLink
                  href={`/go/${cheapestLink.id}`}
                  linkId={cheapestLink.id}
                  storeName={cheapestLink.store_name}
                  productName={p.name}
                  priceInr={cheapestLink.price_inr}
                  className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white hover:bg-accent/90 transition-colors"
                >
                  <ShoppingCart size={12} />
                  Buy on {cheapestLink.store_name}
                  <ExternalLink size={11} className="opacity-70" />
                </AffiliateOutboundLink>
              )}
            </div>
          )
        })}

        {/* Add product slot — show while under max */}
        {products.length < slots && (
          <div ref={pickerOpen !== null ? pickerRef : undefined} className="relative">
            <button
              onClick={() => setPickerOpen(pickerOpen === 0 ? null : 0)}
              className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface-alt text-muted hover:border-accent hover:text-accent transition-colors"
              aria-label="Add product to compare"
            >
              <Plus size={24} />
              <span className="text-xs font-medium">Add Product</span>
            </button>

            {pickerOpen !== null && (
              <div
                ref={pickerRef}
                className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-surface shadow-lg overflow-hidden"
              >
                {/* Search input */}
                <div className="p-2 border-b border-border">
                  <input
                    autoFocus
                    type="text"
                    value={pickerQuery}
                    onChange={(e) => setPickerQuery(e.target.value)}
                    placeholder="Search products…"
                    className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-primary placeholder:text-muted outline-none focus:border-accent"
                  />
                </div>

                {/* Options */}
                <div className="max-h-64 overflow-y-auto">
                  {filteredOptions.length === 0 ? (
                    <p className="px-4 py-3 text-xs text-muted">No products found</p>
                  ) : (
                    filteredOptions.map((opt) => (
                      <button
                        key={opt.slug}
                        onClick={() => addProduct(opt.slug)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-primary hover:bg-surface-alt transition-colors"
                      >
                        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-surface-alt">
                          {opt.thumbnail_url && (
                            <Image src={opt.thumbnail_url} alt={opt.name} fill sizes="32px" className="object-contain p-0.5" />
                          )}
                        </div>
                        <span className="flex-1 leading-tight line-clamp-2">{opt.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Spec win summary ───────────────────────────────────────────── */}
      {products.length >= 2 && rows.length > 0 && (
        <CompareWinnerSummary products={products} diffRows={diffRows} />
      )}

      {/* ── Spec table ─────────────────────────────────────────────────── */}
      {products.length >= 2 && rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm" style={{ minWidth: `${cols * 160 + 160}px` }}>
            <thead className="sticky top-0 z-10 bg-surface-alt border-b border-border">
              <tr>
                {/* Label column header */}
                <th className="w-40 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  Spec
                </th>
                {products.map((p) => (
                  <th key={p.id} className="px-4 py-3 text-center text-xs font-semibold text-primary">
                    <span className="line-clamp-1">{p.name}</span>
                  </th>
                ))}
                {/* Pad if < 4 cols */}
                {products.length < slots &&
                  Array.from({ length: slots - products.length }).map((_, i) => (
                    <th key={`pad-${i}`} />
                  ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {rows.map((row, rowIdx) => {
                const winners = row.hasDiff ? winnerFlags(row.values) : []

                return (
                  <tr
                    key={row.specKey}
                    className={[
                      rowIdx % 2 === 0 ? 'bg-surface' : 'bg-surface-alt',
                      row.hasDiff ? 'ring-1 ring-inset ring-accent/20' : '',
                    ].join(' ')}
                  >
                    {/* Spec label — sticky left */}
                    <td className="sticky left-0 bg-inherit w-40 px-4 py-3 font-medium text-muted text-xs">
                      <div className="flex items-center gap-1.5">
                        {row.hasDiff && (
                          <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" aria-label="Values differ" />
                        )}
                        {row.label}
                      </div>
                    </td>

                    {/* Value cells */}
                    {row.values.map((val, colIdx) => {
                      const isWinner = winners[colIdx]

                      return (
                        <td
                          key={colIdx}
                          className={[
                            'px-4 py-3 text-center text-sm',
                            isWinner ? 'font-semibold' : '',
                          ].join(' ')}
                        >
                          <span
                            className={[
                              'inline-flex items-center justify-center gap-1',
                              isWinner
                                ? 'text-accent'
                                : val === null
                                ? 'text-muted/40'
                                : 'text-primary',
                            ].join(' ')}
                          >
                            {isWinner && (
                              <Crown size={12} className="text-accent shrink-0" aria-label="Best value" />
                            )}
                            {formatVal(val)}
                          </span>
                        </td>
                      )
                    })}

                    {/* Padding cells */}
                    {products.length < slots &&
                      Array.from({ length: slots - products.length }).map((_, i) => (
                        <td key={`pad-${i}`} className="px-4 py-3 text-center text-muted/20 text-xs">
                          —
                        </td>
                      ))}
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
            <Crown size={12} className="text-accent" /> Best value in this spec
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Values differ
          </span>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {products.length < 2 && (
        <div className="flex flex-col items-center gap-5 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-alt text-muted">
            <ArrowUpDown size={28} />
          </div>
          <div>
            <p className="text-base font-semibold text-primary">Add products to compare</p>
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
