'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import * as Slider from '@radix-ui/react-slider'
import { Input } from '@/components/ui/Input'
import { Chip } from '@/components/ui/Chip'
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
  { slug: 'headphones', label: 'Audio', icon: Headphones, maxPrice: 50000 },
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
  const [minInput, setMinInput] = useState('')
  const [maxInput, setMaxInput] = useState('')
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
    const v = parseRaw(minInput)
    if (v !== null) setRange([Math.max(MIN_PRICE, Math.min(v, max - STEP)), max])
    setMinInput('')
  }

  function commitMax() {
    const v = parseRaw(maxInput)
    if (v !== null) setRange([min, Math.min(MAX_PRICE, Math.max(v, min + STEP))])
    setMaxInput('')
  }

  function handleFind() {
    const params = new URLSearchParams()
    params.set('category', category)
    if (min > MIN_PRICE) params.set('minPrice', String(min))
    if (max < MAX_PRICE) params.set('maxPrice', String(max))
    router.push(`/search?${params.toString()}`)
  }

  const activePreset = PRICE_PRESETS.find((p) => p.min === min && p.max === max)

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="font-heading text-lg font-bold text-primary">
          Find Your Perfect Gadget
        </h2>
        {resultCount != null && (
          <p className="text-xs text-muted">
            <span className="font-semibold text-accent">{resultCount}</span> products in range
          </p>
        )}
      </div>

      {/* Category tabs — 91Mobiles multi-finder pattern */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {CATEGORIES.map(({ slug, label, icon: Icon }) => (
          <Chip key={slug} onClick={() => setCategory(slug)} active={category === slug}>
            <Icon size={14} />
            {label}
          </Chip>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Price finder */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-primary mb-2">Budget</p>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {PRICE_PRESETS.filter((p) => p.min < MAX_PRICE).map((preset) => (
              <Chip
                key={preset.label}
                size="auto"
                onClick={() => applyPreset(preset.min, Math.min(preset.max, MAX_PRICE))}
                active={activePreset?.label === preset.label}
                className="px-2.5 py-1 text-[11px]"
              >
                {preset.label}
              </Chip>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Input
              type="text"
              inputMode="numeric"
              placeholder={fmt(min)}
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              onBlur={commitMin}
              onKeyDown={(e) => e.key === 'Enter' && commitMin()}
              aria-label="Minimum price"
              className="flex-1 min-w-0"
            />
            <span className="text-muted/60 text-sm shrink-0">to</span>
            <Input
              type="text"
              inputMode="numeric"
              placeholder={max >= MAX_PRICE ? `${fmt(MAX_PRICE)}+` : fmt(max)}
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              onBlur={commitMax}
              onKeyDown={(e) => e.key === 'Enter' && commitMax()}
              aria-label="Maximum price"
              className="flex-1 min-w-0"
            />
          </div>

          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-6 mb-2"
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
              className="block h-5 w-5 rounded-full bg-accent border-2 border-white shadow-md hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent cursor-grab active:cursor-grabbing transition-transform"
              aria-label="Minimum price"
            />
            <Slider.Thumb
              className="block h-5 w-5 rounded-full bg-accent border-2 border-white shadow-md hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent cursor-grab active:cursor-grabbing transition-transform"
              aria-label="Maximum price"
            />
          </Slider.Root>

          <div className="flex justify-between text-[10px] text-muted mb-5">
            <span>{fmt(MIN_PRICE)}</span>
            <span className="font-semibold text-primary">{fmt(min)} – {max >= MAX_PRICE ? `${fmt(MAX_PRICE)}+` : fmt(max)}</span>
            <span>{fmt(MAX_PRICE)}+</span>
          </div>

          <button
            type="button"
            onClick={handleFind}
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white hover:bg-accent/90 transition-all flex items-center justify-center gap-2"
          >
            <Search size={16} />
            {resultCount != null ? `Show ${resultCount} ${catConfig.label}` : `Find ${catConfig.label}`}
          </button>
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
                    className="flex items-center gap-2 py-2 px-2 rounded-lg text-xs text-primary hover:bg-surface-alt hover:text-accent transition-colors"
                  >
                    <span className="flex items-center justify-center h-7 w-7 rounded-md bg-surface-alt shrink-0">
                      <Icon size={14} className="text-accent/70" />
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
