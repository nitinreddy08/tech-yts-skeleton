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
        <Clock size={14} className="text-muted shrink-0" aria-hidden />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Your recent searches
        </h2>
      </div>
      <ul className="flex flex-wrap gap-2">
        {visible.map((term) => (
          // Link and remove button are siblings (a button inside a link is
          // invalid HTML), and the remove button is always visible so it
          // works on touch screens too.
          <li
            key={term}
            className="inline-flex h-9 items-center rounded-full border border-neutral-500 bg-surface text-sm font-medium text-primary transition-colors hover:border-accent"
          >
            <Link
              href={`/search?q=${encodeURIComponent(term)}`}
              className="relative flex h-full items-center pl-4 pr-1 hover:text-accent after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']"
            >
              {term}
            </Link>
            <button
              type="button"
              onClick={(e) => handleRemove(e, term)}
              className="relative flex h-full w-9 items-center justify-center rounded-r-full text-muted hover:text-primary after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']"
              aria-label={`Remove "${term}" from recent searches`}
            >
              <X size={14} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
