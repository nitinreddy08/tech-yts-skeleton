'use client'

import { useState, useEffect, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/lib/config'
import { SearchBar } from '@/components/ui/SearchBar'
import { useCompareOptional } from '@/components/providers/CompareProvider'
import { buildCompareUrl } from '@/lib/utils/compare-url'
import { MyStuffNavLink } from '@/components/ui/MyStuffNavLink'
import { Button } from '@/components/ui/Button'
import { useBottomLayer, useNavbarHeight } from '@/lib/hooks/useBottomLayer'
import { useDialog } from '@/lib/hooks/useDialog'
import { SiteLogoMark } from '@/components/ui/SiteLogo'
import { loadWishlist } from '@/lib/utils/wishlist'
import { Menu, X, ChevronDown, Zap, GitCompare, Trophy, Home, Search, Bookmark } from 'lucide-react'

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

/**
 * Menu-style dropdown: opens on hover (desktop pointers), on click/tap and
 * Enter/Space (keyboard), and closes on Escape, outside press or focus leaving.
 */
function useDropdown() {
  const [open, setOpen] = useState(false)
  // A click/tap/Enter "pins" the menu open so the pointer leaving (or the
  // hover that preceded the click) doesn't immediately close it again.
  const pinned = useRef(false)
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()

  const close = () => {
    pinned.current = false
    setOpen(false)
  }
  const toggle = () => {
    if (open && !pinned.current) {
      pinned.current = true // opened by hover → keep it open
    } else if (open) {
      close()
    } else {
      pinned.current = true
      setOpen(true)
    }
  }

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        pinned.current = false
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        pinned.current = false
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const containerProps = {
    ref,
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => {
      if (!pinned.current) setOpen(false)
    },
    onBlur: (e: React.FocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) close()
    },
  }
  return { open, toggle, id, containerProps }
}

function Top10Dropdown({ lists }: { lists: NavBestOfList[] }) {
  const { open, toggle, id, containerProps } = useDropdown()

  return (
    <div className="relative" {...containerProps}>
      <button
        type="button"
        className="flex min-h-11 items-center gap-1 px-3 py-3 text-sm font-medium text-muted hover:text-primary transition-colors whitespace-nowrap"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={id}
        onClick={toggle}
      >
        <Trophy size={14} className="text-accent" aria-hidden />
        Top 10
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && lists.length > 0 && (
        <div id={id} className="absolute left-0 top-full w-80 rounded-xl border border-border bg-surface shadow-lg z-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Editor&apos;s Guides</p>
          <div className="flex flex-col gap-1">
            {lists.map((list) => (
              <Link
                key={list.slug}
                href={`/best-of/${list.slug}`}
                className="flex min-h-11 items-center justify-between rounded-lg px-3 py-2 text-sm text-primary hover:bg-surface-alt hover:text-accent transition-colors"
              >
                <span className="font-medium line-clamp-1">{list.title}</span>
                <span className="text-xs text-muted shrink-0 ml-2">{list.itemCount} picks</span>
              </Link>
            ))}
          </div>
          <Link
            href="/best-of"
            className="mt-3 flex min-h-11 items-center justify-center text-sm font-semibold text-accent hover:underline pt-2 border-t border-border"
          >
            View all guides →
          </Link>
        </div>
      )}
    </div>
  )
}

/**
 * "Compare" is a real link (to the tray, or the compare page when empty) with a
 * separate chevron that opens a menu of the current comparison — so the menu
 * holds compare actions rather than a duplicate of the category links.
 */
function CompareDropdown() {
  const { open, toggle, id, containerProps } = useDropdown()
  const compare = useCompareOptional()
  const products = compare?.products ?? []
  const count = products.length
  const compareHref = count >= 2 ? buildCompareUrl(products.map((p) => p.slug)) : '/compare'

  return (
    <div className="relative flex items-center" {...containerProps}>
      <Link
        href={compareHref}
        className="flex min-h-11 items-center gap-1 py-3 pl-3 pr-1 text-sm font-medium text-muted hover:text-primary transition-colors whitespace-nowrap"
        aria-label={count > 0 ? `Compare ${count} products` : 'Compare products'}
      >
        <GitCompare size={14} aria-hidden />
        Compare
        {count > 0 && (
          <span className="rounded-full bg-accent text-white px-1.5 py-0.5 text-[11px] font-bold min-w-[18px] text-center">
            {count}
          </span>
        )}
      </Link>
      <button
        type="button"
        className="flex h-11 w-8 items-center justify-center text-muted hover:text-primary"
        aria-label="Show comparison menu"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={id}
        onClick={toggle}
      >
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <div id={id} className="absolute left-0 top-full w-72 rounded-xl border border-border bg-surface shadow-lg z-50 p-3">
          <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Your comparison ({count}/4)
          </p>
          {count === 0 ? (
            <p className="px-1 pb-3 text-sm text-muted">
              Tap <span className="font-semibold text-primary">Compare</span> on any product card to add it here.
            </p>
          ) : (
            <ul className="flex flex-col">
              {products.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 pl-1">
                  <span className="truncate text-sm text-primary">{p.name}</span>
                  <button
                    type="button"
                    onClick={() => compare?.removeProduct(p.id)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center text-muted hover:text-primary"
                    aria-label={`Remove ${p.name} from compare`}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {count >= 2 && (
            <Button href={compareHref} size="auto" className="mb-1 mt-1 h-11 w-full text-sm">
              Compare {count} products
            </Button>
          )}
          <Link
            href="/compare"
            className="mt-1 flex min-h-11 items-center rounded-lg border-t border-border px-1 pt-2 text-sm font-semibold text-accent hover:underline"
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

function BottomNavItem({
  href,
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  href?: string
  icon: React.ReactNode
  label: string
  active: boolean
  badge?: number
  onClick?: () => void
}) {
  const content = (
    <>
      <span className="relative">
        {icon}
        {!!badge && badge > 0 && (
          <span className="absolute -top-1.5 -right-2 rounded-full bg-accent text-white px-1 py-0.5 text-[11px] font-bold min-w-[16px] text-center leading-none">
            {badge}
          </span>
        )}
      </span>
      <span className="text-[11px] font-medium">{label}</span>
    </>
  )
  const className = `flex flex-1 flex-col items-center justify-center gap-1 py-2 min-h-[56px] transition-colors ${
    active ? 'text-accent' : 'text-muted'
  }`

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} aria-label={label}>
        {content}
      </button>
    )
  }
  return (
    <Link href={href!} className={className} aria-label={label}>
      {content}
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
  const [savedCount, setSavedCount] = useState(0)
  const headerRef = useNavbarHeight<HTMLElement>()

  const pathSegments = pathname.split('/').filter(Boolean)
  const isProductPage = pathSegments.length === 2 && categories.some((c) => c.slug === pathSegments[0])
  const closeDrawer = () => setDrawerOpen(false)
  const drawerRef = useDialog<HTMLDivElement>(drawerOpen, closeDrawer)
  const tabbarRef = useBottomLayer<HTMLElement>('tabbar', !isProductPage)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const refresh = () => setSavedCount(loadWishlist().length)
    refresh()
    window.addEventListener('wishlist-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('wishlist-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  useEffect(() => {
    setDrawerOpen(false)
    setExpandedSection(null)
  }, [pathname])

  return (
    <header ref={headerRef} className="sticky top-0 z-50 bg-surface">
      {/* Top row: logo + search + menu */}
      <div
        className={`border-b border-border transition-all duration-200 ${
          scrolled ? 'shadow-sm' : ''
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 h-14">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-lg font-bold text-primary shrink-0 hover:text-accent transition-colors"
          >
            <SiteLogoMark className="h-7 w-7 shrink-0" />
            <span className="truncate">{siteConfig.site_name}</span>
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
              <span className="rounded-full bg-accent text-white px-1.5 py-0.5 text-[11px] font-bold">
                {activeDealCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="md:hidden ml-auto flex items-center justify-center w-11 h-11 rounded-lg text-primary hover:bg-surface-alt"
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
      <nav className="hidden md:block border-b border-border bg-surface" aria-label="Main">
        <div className="mx-auto flex max-w-7xl items-center px-4">
          <Top10Dropdown lists={bestOfLists} />
          <CompareDropdown />
          <MyStuffNavLink className="min-h-11 px-3 py-3 text-sm font-medium whitespace-nowrap -mb-px" />
          <div className="ml-auto flex items-center">
            {categories.map((cat) => (
              <CategoryLink key={cat.slug} category={cat} />
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile full-screen drawer. Portaled to <body> so it sits above the
          cookie banner and other fixed layers instead of inside the header's
          stacking context. */}
      {drawerOpen &&
        createPortal(
        <div className="fixed inset-0 z-[70] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} aria-hidden />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            tabIndex={-1}
            className="absolute inset-y-0 right-0 w-full max-w-sm bg-surface shadow-xl flex flex-col outline-none"
          >
            <div className="flex items-center justify-between border-b border-border px-4 h-14 shrink-0">
              <span className="flex items-center gap-2 font-heading font-bold text-primary">
                <SiteLogoMark className="h-6 w-6 shrink-0" />
                {siteConfig.site_name}
              </span>
              <button
                type="button"
                className="flex items-center justify-center w-11 h-11 rounded-lg hover:bg-surface-alt"
                onClick={closeDrawer}
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
                href="/brands"
                className={`mt-2 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
                  pathname.startsWith('/brand') ? 'bg-accent/10 text-accent' : 'text-primary hover:bg-surface-alt'
                }`}
              >
                All brands
              </Link>
              <Link
                href="/tags"
                className={`rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
                  pathname.startsWith('/tag') ? 'bg-accent/10 text-accent' : 'text-primary hover:bg-surface-alt'
                }`}
              >
                Browse by tag
              </Link>

              <div className="rounded-lg px-3 py-3">
                <MyStuffNavLink className="min-h-6 text-sm font-semibold" />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Mobile bottom tab bar — thumb-reachable primary actions.
          Hidden on product pages, which have their own sticky buy bar. */}
      {!isProductPage && (
        <nav
          ref={tabbarRef}
          className="md:hidden fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur-sm"
          aria-label="Primary"
        >
          <BottomNavItem href="/" icon={<Home size={20} />} label="Home" active={pathname === '/'} />
          <BottomNavItem
            href="/search"
            icon={<Search size={20} />}
            label="Search"
            active={pathname === '/search'}
          />
          <BottomNavItem
            href={compareHref}
            icon={<GitCompare size={20} />}
            label="Compare"
            active={pathname.startsWith('/compare')}
            badge={compareCount}
          />
          <BottomNavItem
            href="/my?tab=saved"
            icon={<Bookmark size={20} />}
            label="Saved"
            active={pathname === '/my'}
            badge={savedCount}
          />
          <BottomNavItem
            icon={<Menu size={20} />}
            label="Menu"
            active={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          />
        </nav>
      )}
    </header>
  )
}
