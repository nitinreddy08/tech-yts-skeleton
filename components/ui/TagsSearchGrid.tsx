'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

interface TagItem {
  slug: string
  label: string
  count: number
}

interface TagsSearchGridProps {
  tags: TagItem[]
}

export function TagsSearchGrid({ tags }: TagsSearchGridProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tags
    return tags.filter(
      (t) => t.label.toLowerCase().includes(q) || t.slug.includes(q.replace(/\s+/g, '-'))
    )
  }, [tags, query])

  return (
    <>
      <div className="relative max-w-md mx-auto mb-10">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter tags — e.g. 5g, gaming, anc..."
          className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-primary placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none"
          aria-label="Filter tags"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-muted py-12">
          No tags match &ldquo;{query}&rdquo;.{' '}
          <button type="button" onClick={() => setQuery('')} className="text-accent hover:underline">
            Clear filter
          </button>
        </p>
      ) : (
        <>
          {query.trim() && (
            <p className="text-xs text-muted text-center mb-4">
              {filtered.length} tag{filtered.length !== 1 ? 's' : ''} found
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            {filtered.map((t) => (
              <Link
                key={t.slug}
                href={`/tag/${t.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-primary hover:border-accent hover:text-accent transition-colors capitalize"
              >
                #{t.label}
                <span className="rounded-full bg-surface-alt px-2 py-0.5 text-[10px] text-muted tabular-nums">
                  {t.count}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  )
}
