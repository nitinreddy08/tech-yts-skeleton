'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, X } from 'lucide-react'
import {
  loadRecentSearches,
  removeRecentSearch,
  RECENT_SEARCHES_KEY,
} from '@/lib/utils/recent-searches'

interface RecentSearchesStripProps {
  /** Hide the chip matching the current query */
  currentQuery?: string
  className?: string
}

export function RecentSearchesStrip({ currentQuery = '', className = '' }: RecentSearchesStripProps) {
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => {
    setRecent(loadRecentSearches())

    function onStorage(e: StorageEvent) {
      if (e.key === RECENT_SEARCHES_KEY) setRecent(loadRecentSearches())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const visible = recent.filter(
    (term) => term.toLowerCase() !== currentQuery.trim().toLowerCase()
  )

  if (visible.length === 0) return null

  function handleRemove(e: React.MouseEvent, term: string) {
    e.preventDefault()
    e.stopPropagation()
    removeRecentSearch(term)
    setRecent(loadRecentSearches())
  }

  return (
    <section className={className} aria-label="Your recent searches">
      <div className="flex items-center gap-2 mb-2">
        <Clock size={14} className="text-muted shrink-0" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Your recent searches
        </h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {visible.map((term) => (
          <Link
            key={term}
            href={`/search?q=${encodeURIComponent(term)}`}
            className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-primary hover:border-accent hover:text-accent transition-colors"
          >
            {term}
            <button
              type="button"
              onClick={(e) => handleRemove(e, term)}
              className="rounded-full p-0.5 text-muted opacity-0 group-hover:opacity-100 hover:bg-surface-alt hover:text-primary transition-all"
              aria-label={`Remove "${term}" from recent searches`}
            >
              <X size={12} />
            </button>
          </Link>
        ))}
      </div>
    </section>
  )
}
