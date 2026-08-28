'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/lib/config'
import { SearchBar } from '@/components/ui/SearchBar'
import { useCompareOptional } from '@/components/providers/CompareProvider'
import { buildCompareUrl } from '@/lib/utils/compare-url'
import { SavedNavLink } from '@/components/ui/SavedNavLink'
import { AlertsNavLink } from '@/components/ui/AlertsNavLink'
import { MyStuffNavLink } from '@/components/ui/MyStuffNavLink'
import { Menu, X, ChevronDown, Zap, GitCompare, Trophy } from 'lucide-react'

interface NavCategory {
  slug: string
  name: string
  icon: string
}

interface NavBestOfList {
  slug: string
  title: string
  itemCount: number
}

interface NavbarProps {
  categories: NavCategory[]
  bestOfLists: NavBestOfList[]
  activeDealCount: number
}

function useDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  return { open, setOpen, ref }
}

function NavLink({
  href,
  children,
  className = '',
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={`px-3 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
        active
          ? 'text-accent border-b-2 border-accent -mb-px'
          : 'text-muted hover:text-primary'
      } ${className}`}
    >
      {children}
    </Link>
  )
}

function Top10Dropdown({ lists }: { lists: NavBestOfList[] }) {
  const { open, setOpen, ref } = useDropdown()

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="flex items-center gap-1 px-3 py-3 text-sm font-medium text-muted hover:text-primary transition-colors whitespace-nowrap"
        aria-expanded={open}
      >
        <Trophy size={14} className="text-accent" />
        Top 10
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && lists.length > 0 && (
        <div className="absolute left-0 top-full w-80 rounded-xl border border-border bg-surface shadow-lg z-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Editor&apos;s Guides</p>
          <div className="flex flex-col gap-1">
            {lists.map((list) => (
              <Link
                key={list.slug}
                href={`/best-of/${list.slug}`}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-primary hover:bg-surface-alt hover:text-accent transition-colors"
              >
                <span className="font-medium line-clamp-1">{list.title}</span>
                <span className="text-xs text-muted shrink-0 ml-2">{list.itemCount} picks</span>
              </Link>
            ))}
          </div>
          <Link
            href="/best-of"
            className="mt-3 block text-center text-xs font-semibold text-accent hover:underline pt-2 border-t border-border"
          >
            View all guides →
          </Link>
        </div>
      )}
    </div>
  )
}

function CompareDropdown({ categories }: { categories: NavCategory[] }) {
  const { open, setOpen, ref } = useDropdown()
  const compare = useCompareOptional()
  const count = compare?.products.length ?? 0
  const compareHref = count >= 2 ? buildCompareUrl(compare!.products.map((p) => p.slug)) : '/compare'

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link
        href={compareHref}
        className="flex items-center gap-1 px-3 py-3 text-sm font-medium text-muted hover:text-primary transition-colors whitespace-nowrap"
        aria-label={count > 0 ? `Compare ${count} products` : 'Compare products'}
      >
        <GitCompare size={14} />
        Compare
        {count > 0 && (
          <span className="rounded-full bg-accent text-white px-1.5 py-0.5 text-[10px] font-bold min-w-[18px] text-center">
            {count}
          </span>
        )}
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </Link>
      {open && (
        <div className="absolute left-0 top-full w-52 rounded-xl border border-border bg-surface shadow-lg z-50 p-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary hover:bg-surface-alt hover:text-accent transition-colors"
            >
              <span aria-hidden>{cat.icon}</span>
              {cat.name}
            </Link>
          ))}
          <Link
            href="/compare"
            className="mt-2 flex items-center gap-1 rounded-lg px-3 py-2.5 text-sm font-semibold text-accent hover:bg-accent/5 border-t border-border pt-3"
          >
            Compare any product →
          </Link>
        </div>
      )}
    </div>
  )
}

function CategoryLink({ category }: { category: NavCategory }) {
  const pathname = usePathname()
  const active = pathname.startsWith(`/${category.slug}`)

  return (
    <Link
      href={`/${category.slug}`}
      className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
        active ? 'text-accent border-b-2 border-accent -mb-px' : 'text-muted hover:text-primary'
      }`}
    >
      <span aria-hidden>{category.icon}</span>
      {category.name}
    </Link>
  )
}

export default function Navbar({ categories, bestOfLists, activeDealCount }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const pathname = usePathname()
  const compare = useCompareOptional()
  const compareCount = compare?.products.length ?? 0
  const compareHref = compareCount >= 2 ? buildCompareUrl(compare!.products.map((p) => p.slug)) : '/compare'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setDrawerOpen(false)
    setExpandedSection(null)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  return (
    <header className="sticky top-0 z-50 bg-surface">
      {/* Top row: logo + search + menu */}
      <div
        className={`border-b border-border transition-all duration-200 ${
          scrolled ? 'shadow-sm' : ''
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center gap-3 px-4 transition-all duration-200 ${
            scrolled ? 'h-12' : 'h-14'
          }`}
        >
          <Link
            href="/"
            className="font-heading text-lg font-bold text-primary shrink-0 hover:text-accent transition-colors"
          >
            {siteConfig.site_name}
          </Link>

          <div className="flex-1 max-w-2xl hidden md:block">
            <SearchBar />
          </div>

          <Link
            href="/deals"
            className="hidden sm:inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-primary hover:border-accent hover:text-accent transition-colors shrink-0"
          >
            <Zap size={12} className="text-accent" />
            Deals
            {activeDealCount > 0 && (
              <span className="rounded-full bg-accent text-white px-1.5 py-0.5 text-[10px] font-bold">
                {activeDealCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="md:hidden ml-auto flex items-center justify-center w-10 h-10 rounded-lg text-primary hover:bg-surface-alt"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Mobile search — always visible */}
        <div className="md:hidden px-4 pb-3">
          <SearchBar />
        </div>
      </div>

      {/* Desktop nav row */}
      <nav className="hidden md:block border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center px-4">
          <Top10Dropdown lists={bestOfLists} />
          <CompareDropdown categories={categories} />
          <NavLink href="/deals">
            <span className="inline-flex items-center gap-1.5">
              <Zap size={14} className="text-accent" />
              Deals
              {activeDealCount > 0 && (
                <span className="rounded-full bg-accent/10 text-accent px-1.5 py-0.5 text-[10px] font-bold">
                  {activeDealCount}
                </span>
              )}
            </span>
          </NavLink>
          <NavLink href="/search">Search</NavLink>
          <SavedNavLink className="px-3 py-3 text-sm font-medium whitespace-nowrap -mb-px" />
          <AlertsNavLink className="px-3 py-3 text-sm font-medium whitespace-nowrap -mb-px" />
          <MyStuffNavLink className="px-3 py-3 text-sm font-medium whitespace-nowrap -mb-px hidden xl:inline-flex" />
          <div className="ml-auto flex items-center">
            {categories.map((cat) => (
              <CategoryLink key={cat.slug} category={cat} />
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile full-screen drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} aria-hidden />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-surface shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 h-14 shrink-0">
              <span className="font-heading font-bold text-primary">{siteConfig.site_name}</span>
              <button
                type="button"
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-alt"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
              <Link
                href="/"
                className={`rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
                  pathname === '/' ? 'bg-accent/10 text-accent' : 'text-primary hover:bg-surface-alt'
                }`}
              >
                Home
              </Link>

              <Link
                href="/deals"
                className={`flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
                  pathname === '/deals' ? 'bg-accent/10 text-accent' : 'text-primary hover:bg-surface-alt'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Zap size={16} className="text-accent" /> Deals
                </span>
                {activeDealCount > 0 && (
                  <span className="rounded-full bg-accent text-white px-2 py-0.5 text-xs font-bold">
                    {activeDealCount}
                  </span>
                )}
              </Link>

              <Link
                href={compareHref}
                className={`flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
                  pathname.startsWith('/compare') ? 'bg-accent/10 text-accent' : 'text-primary hover:bg-surface-alt'
                }`}
              >
                <span className="flex items-center gap-2">
                  <GitCompare size={16} /> Compare Products
                </span>
                {compareCount > 0 && (
                  <span className="rounded-full bg-accent text-white px-2 py-0.5 text-xs font-bold">
                    {compareCount}
                  </span>
                )}
              </Link>

              {/* Best-of accordion */}
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === 'guides' ? null : 'guides')}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold text-primary hover:bg-surface-alt"
                >
                  <span className="flex items-center gap-2">
                    <Trophy size={16} className="text-accent" /> Editor&apos;s Guides
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${expandedSection === 'guides' ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedSection === 'guides' && (
                  <div className="ml-4 flex flex-col gap-0.5 pb-2">
                    {bestOfLists.map((list) => (
                      <Link
                        key={list.slug}
                        href={`/best-of/${list.slug}`}
                        className="rounded-lg px-3 py-2.5 text-sm text-muted hover:text-accent hover:bg-surface-alt"
                      >
                        {list.title}
                      </Link>
                    ))}
                    <Link href="/best-of" className="px-3 py-2 text-xs font-semibold text-accent">
                      View all →
                    </Link>
                  </div>
                )}
              </div>

              {/* Categories accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === 'categories' ? null : 'categories')}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold text-primary hover:bg-surface-alt"
                >
                  Browse Categories
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${expandedSection === 'categories' ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedSection === 'categories' && (
                  <div className="ml-4 flex flex-col gap-0.5 pb-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/${cat.slug}`}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                          pathname.startsWith(`/${cat.slug}`)
                            ? 'text-accent font-medium'
                            : 'text-muted hover:text-primary hover:bg-surface-alt'
                        }`}
                      >
                        <span aria-hidden>{cat.icon}</span>
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/search"
                className={`mt-2 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
                  pathname === '/search' ? 'bg-accent/10 text-accent' : 'text-primary hover:bg-surface-alt'
                }`}
              >
                Search
              </Link>

              <div className="rounded-lg px-3 py-3">
                <SavedNavLink className="text-sm font-semibold" />
              </div>
              <div className="rounded-lg px-3 py-3">
                <AlertsNavLink className="text-sm font-semibold" />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
