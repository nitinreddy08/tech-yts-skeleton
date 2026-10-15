'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Chip } from '@/components/ui/Chip'
import { Input } from '@/components/ui/Input'

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
      <div className="relative mb-6 max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter tags — e.g. 5g, gaming, anc…"
          className="rounded-full pl-10"
          aria-label="Filter tags"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-muted py-12">
          No tags match &ldquo;{query}&rdquo;.{' '}
          <button type="button" onClick={() => setQuery('')} className="inline-flex min-h-11 items-center text-accent underline">
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
              <Chip key={t.slug} href={`/tag/${t.slug}`} size="md" className="capitalize">
                #{t.label}
                <span className="rounded-full bg-surface-alt px-2 py-0.5 text-[11px] text-muted tabular-nums">
                  {t.count}
                </span>
              </Chip>
            ))}
          </div>
        </>
      )}
    </>
  )
}
