'use client'

import { useState, useEffect, useRef, useCallback, useId } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X, SearchX, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import { formatIndianPrice } from '@/lib/utils/format'
import {
  loadRecentSearches,
  saveRecentSearch,
} from '@/lib/utils/recent-searches'
import type { SearchResult } from '@/types'

const POPULAR_SEARCHES = [
  'OnePlus 13',
  'iPhone 16',
  'Samsung Galaxy S25',
  'best phones under 30000',
  'Sony headphones',
  'MacBook Air',
]

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-accent/15 text-accent font-semibold rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export function SearchBar() {
  // The navbar mounts two instances (desktop + mobile), so ids must be unique.
  const uid = useId()
  const inputId = `${uid}-input`
  const listboxId = `${uid}-listbox`
  const optionId = (i: number) => `${uid}-option-${i}`
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [recent, setRecent] = useState<string[]>([])
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setRecent(loadRecentSearches())
  }, [])

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setTotalCount(0)
      setActiveIndex(-1)
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`)
        if (res.ok) {
          const data = (await res.json()) as SearchResult[]
          setResults(data)
          setTotalCount(data.length)
          setOpen(true)
          setActiveIndex(-1)

          // Fetch total count for "see all"
          const fullRes = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=50`)
          if (fullRes.ok) {
            const full = (await fullRes.json()) as SearchResult[]
            setTotalCount(full.length)
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const navigate = useCallback(
    (term: string) => {
      if (!term.trim()) return
      saveRecentSearch(term.trim())
      setRecent(loadRecentSearches())
      setOpen(false)
      setFocused(false)
      setQuery('')
      router.push(`/search?q=${encodeURIComponent(term.trim())}`)
    },
    [router]
  )

  const selectResult = useCallback(
    (r: SearchResult) => {
      saveRecentSearch(query.trim())
      setOpen(false)
      setFocused(false)
      setQuery('')
      router.push(`/${r.category_slug}/${r.slug}`)
    },
    [query, router]
  )

  function handleKeyDown(e: React.KeyboardEvent) {
    const showSuggestions = open && (results.length > 0 || query.trim().length < 2)
    const suggestionCount =
      query.trim().length >= 2 ? results.length + 1 : recent.length + POPULAR_SEARCHES.length

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) setOpen(true)
      setActiveIndex((i) => Math.min(i + 1, suggestionCount - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && query.trim().length >= 2 && activeIndex < results.length) {
        e.preventDefault()
        selectResult(results[activeIndex])
      } else if (activeIndex === results.length && query.trim().length >= 2) {
        e.preventDefault()
        navigate(query)
      } else if (query.trim()) {
        navigate(query)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setFocused(false)
      setActiveIndex(-1)
    }
  }

  const showDropdown = open && (focused || query.length > 0)
  const showEmpty = showDropdown && !loading && results.length === 0 && query.trim().length >= 2
  const showRecentOrPopular = showDropdown && query.trim().length < 2 && focused

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (query.trim()) navigate(query)
        }}
        role="search"
      >
        <label htmlFor={inputId} className="sr-only">Search products</label>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listboxId}
            aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
            aria-autocomplete="list"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => {
              setFocused(true)
              setOpen(true)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search phones, laptops, earbuds..."
            className="w-full rounded-full border border-border bg-surface px-4 py-2 pl-10 text-sm text-primary placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none"
            autoComplete="off"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setOpen(false)
                setActiveIndex(-1)
                inputRef.current?.focus()
              }}
              className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-muted hover:text-primary"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {showRecentOrPopular && (
          <motion.div
            ref={listRef}
            id={listboxId}
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {recent.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Recent
                </p>
                {recent.map((term, i) => (
                  <button
                    key={term}
                    type="button"
                    id={optionId(i)}
                    role="option"
                    aria-selected={activeIndex === i}
                    onClick={() => navigate(term)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${
                      activeIndex === i ? 'bg-accent/10 text-accent' : 'text-primary hover:bg-surface-alt'
                    }`}
                  >
                    <Clock size={14} className="text-muted shrink-0" />
                    {term}
                  </button>
                ))}
              </div>
            )}
            <div className="p-2 border-t border-border">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1">
                <TrendingUp size={10} /> Popular
              </p>
              {POPULAR_SEARCHES.map((term, i) => {
                const idx = recent.length + i
                return (
                  <button
                    key={term}
                    type="button"
                    role="option"
                    onClick={() => navigate(term)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${
                      activeIndex === idx ? 'bg-accent/10 text-accent' : 'text-primary hover:bg-surface-alt'
                    }`}
                  >
                    <Search size={14} className="text-muted shrink-0" />
                    {term}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDropdown && results.length > 0 && (
          <motion.div
            ref={listRef}
            id={listboxId}
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {loading && (
              <div className="px-4 py-3 text-xs text-muted" aria-live="polite">
                Searching…
              </div>
            )}
            {results.map((r, i) => (
              <button
                key={r.id}
                type="button"
                id={optionId(i)}
                role="option"
                aria-selected={activeIndex === i}
                onClick={() => selectResult(r)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors min-h-[52px] ${
                  activeIndex === i ? 'bg-accent/10' : 'hover:bg-surface-alt'
                }`}
              >
                {r.thumbnail_url && (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-alt">
                    <Image src={r.thumbnail_url} alt="" fill sizes="40px" className="object-contain p-1" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-primary">
                    {highlightMatch(r.name, query)}
                  </p>
                  <p className="text-xs text-muted">
                    {r.brand_name ?? r.category_slug}
                    {r.creator_rating != null && (
                      <span className="ml-2 font-medium text-primary">{r.creator_rating.toFixed(1)}/10</span>
                    )}
                  </p>
                </div>
                {r.current_price_inr != null && (
                  <p className="text-xs text-accent font-semibold shrink-0">
                    {formatIndianPrice(r.current_price_inr)}
                  </p>
                )}
              </button>
            ))}
            <button
              type="button"
              id={optionId(results.length)}
              role="option"
              aria-selected={activeIndex === results.length}
              onClick={() => navigate(query)}
              className={`flex w-full items-center justify-between gap-2 border-t border-border px-4 py-3 text-sm font-medium transition-colors ${
                activeIndex === results.length ? 'bg-accent/10 text-accent' : 'text-accent hover:bg-surface-alt'
              }`}
            >
              <span>
                See all {totalCount} result{totalCount !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
              </span>
              <ArrowRight size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEmpty && (
          <motion.div
            className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border bg-surface shadow-lg p-6 text-center"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <SearchX size={24} className="mx-auto text-muted mb-2" />
            <p className="text-sm font-medium text-primary">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-xs text-muted mt-1">Try a different term or browse categories</p>
            <Link
              href="/smartphones"
              className="inline-block mt-3 text-xs font-medium text-accent hover:underline"
              onClick={() => setOpen(false)}
            >
              Browse smartphones →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
