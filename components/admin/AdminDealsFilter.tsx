'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { Search, X } from 'lucide-react'

const DEAL_TYPES = [
  { value: 'deal_of_day', label: 'Deal of Day' },
  { value: 'price_drop', label: 'Price Drop' },
  { value: 'bank_offer', label: 'Bank Offer' },
  { value: 'sale_event', label: 'Sale' },
  { value: 'coupon', label: 'Coupon' },
]

interface AdminDealsFilterProps {
  currentQ: string
  currentStatus: string
  currentType: string
  resultCount: number
}

export function AdminDealsFilter({
  currentQ,
  currentStatus,
  currentType,
  resultCount,
}: AdminDealsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState(currentQ)

  useEffect(() => setQuery(currentQ), [currentQ])

  const update = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [k, v] of Object.entries(updates)) {
        if (v) params.set(k, v)
        else params.delete(k)
      }
      startTransition(() => router.push(`/admin/deals?${params.toString()}`))
    },
    [router, searchParams]
  )

  useEffect(() => {
    const t = setTimeout(() => {
      if (query !== currentQ) update({ q: query || null })
    }, 300)
    return () => clearTimeout(t)
  }, [query, currentQ, update])

  const hasFilters = Boolean(currentQ || currentStatus || currentType)

  return (
    <div className={`rounded-xl border border-border bg-surface p-4 mb-4 ${isPending ? 'opacity-70' : ''}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search headline, product, store…"
            className="w-full rounded-lg border border-border bg-surface-alt pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <select
          value={currentStatus}
          onChange={(e) => update({ status: e.target.value || null })}
          className="rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive / Expired</option>
        </select>
        <select
          value={currentType}
          onChange={(e) => update({ type: e.target.value || null })}
          className="rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          {DEAL_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>{resultCount} deal{resultCount !== 1 ? 's' : ''}</span>
        {hasFilters && (
          <button type="button" onClick={() => update({ q: null, status: null, type: null })} className="text-accent hover:underline inline-flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        )}
      </div>
    </div>
  )
}
