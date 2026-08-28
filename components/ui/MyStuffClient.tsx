'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bookmark, Bell, GitCompare, LayoutGrid } from 'lucide-react'
import { SavedProductsClient } from '@/components/ui/SavedProductsClient'
import { PriceAlertsClient } from '@/components/ui/PriceAlertsClient'
import { loadRecentCompares, type RecentCompare } from '@/lib/utils/recent-compares'
import { buildCompareUrl } from '@/lib/utils/compare-url'

type Tab = 'saved' | 'alerts' | 'compares'

function RecentComparesPanel() {
  const [items, setItems] = useState<RecentCompare[]>([])

  useEffect(() => {
    const refresh = () => setItems(loadRecentCompares())
    refresh()
    window.addEventListener('recent-compares-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('recent-compares-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface-alt p-8 text-center">
        <GitCompare size={32} className="mx-auto text-muted mb-3" />
        <p className="text-sm font-semibold text-primary">No comparisons yet</p>
        <p className="text-xs text-muted mt-1 mb-4">Compare 2+ products to see them here</p>
        <Link href="/compare" className="text-sm font-semibold text-accent hover:underline">
          Start comparing →
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((c) => (
        <Link
          key={c.id}
          href={buildCompareUrl(c.slugs)}
          className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 hover:border-accent transition-colors"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary line-clamp-2">{c.label}</p>
            <p className="text-xs text-muted mt-0.5">
              {c.slugs.length} products · {new Date(c.visitedAt).toLocaleDateString('en-IN')}
            </p>
          </div>
          <GitCompare size={18} className="text-accent shrink-0 ml-3" />
        </Link>
      ))}
    </div>
  )
}

export function MyStuffClient() {
  const [tab, setTab] = useState<Tab>('saved')

  const tabs: { id: Tab; label: string; icon: typeof Bookmark }[] = [
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'compares', label: 'Compares', icon: GitCompare },
  ]

  return (
    <>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary flex items-center gap-2">
          <LayoutGrid size={28} className="text-accent" />
          My Stuff
        </h1>
        <p className="text-muted mt-2 text-sm">
          Saved products, price alerts, and recent comparisons — all on this device.
        </p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === id ? 'bg-accent text-white' : 'border border-border text-muted hover:text-primary'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'saved' && <SavedProductsClient embedded />}
      {tab === 'alerts' && <PriceAlertsClient embedded />}
      {tab === 'compares' && <RecentComparesPanel />}
    </>
  )
}
