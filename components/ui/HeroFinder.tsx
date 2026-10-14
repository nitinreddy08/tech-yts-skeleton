'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import * as Slider from '@radix-ui/react-slider'
import { Input } from '@/components/ui/Input'
import { Chip } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import {
  Wifi,
  MemoryStick,
  HardDrive,
  Smartphone,
  Zap,
  Monitor,
  Laptop,
  Headphones,
  Tablet,
  Search,
} from 'lucide-react'

const CATEGORIES = [
  { slug: 'smartphones', label: 'Phones', icon: Smartphone, maxPrice: 200000 },
  { slug: 'laptops', label: 'Laptops', icon: Laptop, maxPrice: 300000 },
  { slug: 'headphones', label: 'Headphones', icon: Headphones, maxPrice: 50000 },
  { slug: 'tablets', label: 'Tablets', icon: Tablet, maxPrice: 150000 },
] as const

const PRICE_PRESETS = [
  { label: 'Under ₹15K', min: 0, max: 15000 },
  { label: '₹15K–30K', min: 15000, max: 30000 },
  { label: '₹30K–60K', min: 30000, max: 60000 },
  { label: '₹60K–1L', min: 60000, max: 100000 },
  { label: 'Over ₹1L', min: 100000, max: 999999 },
]

const POPULAR_FEATURES = [
  { label: '5G Ready', icon: Wifi, href: '/search?q=5g&category=smartphones' },
  { label: '8GB+ RAM', icon: MemoryStick, href: '/search?q=8gb&category=smartphones' },
  { label: '256GB+ Storage', icon: HardDrive, href: '/search?q=256gb&category=smartphones' },
  { label: '120Hz Display', icon: Monitor, href: '/search?q=120hz&category=smartphones' },
  { label: 'AI Phones', icon: Zap, href: '/search?q=ai&category=smartphones' },
  { label: 'Top Rated 9+', icon: Smartphone, href: '/search?minRating=9&sort=rating_desc' },
]

const MIN_PRICE = 0
const STEP = 1000

function fmt(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(v % 100000 === 0 ? 0 : 1)}L`
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`
  return `₹${v}`
}

function parseRaw(raw: string): number | null {
  const n = Number(raw.replace(/[^0-9]/g, ''))
  return isNaN(n) || raw.trim() === '' ? null : n
}

export function HeroFinder() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['slug']>('smartphones')
  const catConfig = CATEGORIES.find((c) => c.slug === category)!
  const MAX_PRICE = catConfig.maxPrice

  const [range, setRange] = useState([MIN_PRICE, MAX_PRICE])
  // Drafts hold what's being typed; null means "show the current range value".
  const [minDraft, setMinDraft] = useState<string | null>(null)
  const [maxDraft, setMaxDraft] = useState<string | null>(null)
  const [resultCount, setResultCount] = useState<number | null>(null)
  const router = useRouter()

  const [min, max] = range

  useEffect(() => {
    setRange([MIN_PRICE, MAX_PRICE])
    setResultCount(null)
  }, [category, MAX_PRICE])

  const fetchCount = useCallback(async (minP: number, maxP: number) => {
    const params = new URLSearchParams()
    params.set('category', category)
    params.set('limit', '50')
    if (minP > MIN_PRICE) params.set('minPrice', String(minP))
    if (maxP < MAX_PRICE) params.set('maxPrice', String(maxP))
    try {
      const res = await fetch(`/api/search?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setResultCount(Array.isArray(data) ? data.length : 0)
      }
    } catch {
      setResultCount(null)
    }
  }, [category, MAX_PRICE])

  useEffect(() => {
    const timer = setTimeout(() => fetchCount(min, max), 400)
    return () => clearTimeout(timer)
  }, [min, max, fetchCount])

  function applyPreset(minP: number, maxP: number) {
    const cappedMax = Math.min(maxP, MAX_PRICE)
    setRange([minP, Math.max(minP + STEP, cappedMax)])
  }

  function commitMin() {
    const v = parseRaw(minDraft ?? '')
    if (v !== null) setRange([Math.max(MIN_PRICE, Math.min(v, max - STEP)), max])
    else if (minDraft !== null && minDraft.trim() === '') setRange([MIN_PRICE, max])
    setMinDraft(null)
  }

  function commitMax() {
    const v = parseRaw(maxDraft ?? '')
    if (v !== null) setRange([min, Math.min(MAX_PRICE, Math.max(v, min + STEP))])
    else if (maxDraft !== null && maxDraft.trim() === '') setRange([min, MAX_PRICE])
    setMaxDraft(null)
  }

  function handleFind() {
    const params = new URLSearchParams()
    params.set('category', category)
    if (min > MIN_PRICE) params.set('minPrice', String(min))
    if (max < MAX_PRICE) params.set('maxPrice', String(max))
    router.push(`/search?${params.toString()}`)
  }

  const activePreset = PRICE_PRESETS.find((p) => p.min === min && p.max === max)
  // The count comes from a capped (50) search, so say "50+" rather than imply an exact total.
  const countLabel = resultCount != null && resultCount >= 50 ? '50+' : String(resultCount ?? '')
  const noMatches = resultCount === 0

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="font-heading text-lg font-bold text-primary">
          Find Your Perfect Gadget
        </h2>
        {resultCount != null && (
          <p className="text-xs text-muted" aria-live="polite">
            <span className="font-semibold text-accent">{countLabel}</span> {resultCount === 1 ? 'product' : 'products'} in range
          </p>
        )}
      </div>

      {/* Category tabs — 91Mobiles multi-finder pattern */}
      <div role="group" aria-label="Category" className="flex flex-wrap gap-1.5 mb-5">
        {CATEGORIES.map(({ slug, label, icon: Icon }) => (
          <Chip key={slug} onClick={() => setCategory(slug)} active={category === slug} aria-pressed={category === slug}>
            <Icon size={14} aria-hidden />
            {label}
          </Chip>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Price finder */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-primary mb-2" id="budget-label">Budget</p>

          {/* Quick presets */}
          <div role="group" aria-labelledby="budget-label" className="flex flex-wrap gap-1.5 mb-4">
            {PRICE_PRESETS.filter((p) => p.min < MAX_PRICE).map((preset) => (
              <Chip
                key={preset.label}
                onClick={() => applyPreset(preset.min, Math.min(preset.max, MAX_PRICE))}
                active={activePreset?.label === preset.label}
                aria-pressed={activePreset?.label === preset.label}
              >
                {preset.label}
              </Chip>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={minDraft ?? (min > MIN_PRICE ? String(min) : '')}
              onChange={(e) => setMinDraft(e.target.value)}
              onBlur={commitMin}
              onKeyDown={(e) => e.key === 'Enter' && commitMin()}
              aria-label="Minimum price in rupees"
              className="flex-1 min-w-0"
            />
            <span className="text-muted text-sm shrink-0" aria-hidden>to</span>
            <Input
              type="text"
              inputMode="numeric"
              placeholder={`${fmt(MAX_PRICE)}+`}
              value={maxDraft ?? (max < MAX_PRICE ? String(max) : '')}
              onChange={(e) => setMaxDraft(e.target.value)}
              onBlur={commitMax}
              onKeyDown={(e) => e.key === 'Enter' && commitMax()}
              aria-label="Maximum price in rupees"
              className="flex-1 min-w-0"
            />
          </div>

          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-10 mb-1"
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={STEP}
            value={range}
            onValueChange={setRange}
            minStepsBetweenThumbs={1}
          >
            <Slider.Track className="relative grow rounded-full h-2 bg-border">
              <Slider.Range className="absolute rounded-full h-full bg-accent" />
            </Slider.Track>
            <Slider.Thumb
              className="block h-6 w-6 rounded-full bg-accent border-2 border-white shadow-md hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 cursor-grab active:cursor-grabbing transition-transform after:absolute after:-inset-2 after:content-['']"
              aria-label="Minimum price slider"
            />
            <Slider.Thumb
              className="block h-6 w-6 rounded-full bg-accent border-2 border-white shadow-md hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 cursor-grab active:cursor-grabbing transition-transform after:absolute after:-inset-2 after:content-['']"
              aria-label="Maximum price slider"
            />
          </Slider.Root>

          <div className="flex justify-between text-xs text-muted mb-5">
            <span>{fmt(MIN_PRICE)}</span>
            <span className="font-semibold text-primary">{fmt(min)} – {max >= MAX_PRICE ? `${fmt(MAX_PRICE)}+` : fmt(max)}</span>
            <span>{fmt(MAX_PRICE)}+</span>
          </div>

          <Button onClick={handleFind} disabled={noMatches} className="w-full">
            <Search size={16} aria-hidden />
            {noMatches
              ? 'Nothing in this range — widen it'
              : resultCount != null
                ? `Show ${countLabel} ${catConfig.label}`
                : `Find ${catConfig.label}`}
          </Button>
        </div>

        {/* Popular shortcuts — only for smartphones */}
        {category === 'smartphones' && (
          <div className="lg:w-44 shrink-0">
            <p className="text-sm font-bold text-primary mb-2">Popular Features</p>
            <ul className="grid grid-cols-2 lg:grid-cols-1 gap-1">
              {POPULAR_FEATURES.map(({ label, icon: Icon, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex min-h-11 items-center gap-2 px-2 rounded-lg text-sm text-primary hover:bg-surface-alt hover:text-accent transition-colors"
                  >
                    <span className="flex items-center justify-center h-7 w-7 rounded-md bg-surface-alt shrink-0">
                      <Icon size={14} className="text-accent/70" aria-hidden />
                    </span>
                    <span className="flex-1 line-clamp-1">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
