'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GitCompare } from 'lucide-react'
import { buildCompareUrl } from '@/lib/utils/compare-url'
import { loadRecentCompares, type RecentCompare } from '@/lib/utils/recent-compares'

export function RecentComparesStrip() {
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

  if (items.length === 0) return null

  return (
    <section className="py-12 px-4 border-b border-border">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-heading text-xl font-bold text-primary flex items-center gap-2 mb-5">
          <GitCompare size={20} className="text-accent" /> Recent Comparisons
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {items.map((c) => (
            <Link
              key={c.id}
              href={buildCompareUrl(c.slugs)}
              className="shrink-0 max-w-xs rounded-xl border border-border bg-surface-alt px-4 py-3 hover:border-accent transition-colors"
            >
              <p className="text-sm font-semibold text-primary line-clamp-2">{c.label}</p>
              <p className="text-[11px] text-muted mt-1">
                {c.slugs.length} products · {new Date(c.visitedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
