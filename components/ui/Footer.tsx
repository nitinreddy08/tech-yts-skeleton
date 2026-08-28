'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { siteConfig } from '@/lib/config'
import { ArrowUp, ShieldCheck } from 'lucide-react'
import { NewsletterSignup } from '@/components/ui/NewsletterSignup'
import { SiteLogoMark } from '@/components/ui/SiteLogo'

interface FooterCategory {
  slug: string
  name: string
}

interface FooterBestOf {
  slug: string
  title: string
}

interface FooterProps {
  categories: FooterCategory[]
  bestOfLists: FooterBestOf[]
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" className={className} fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" className={className} fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" className={className} fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  )
}

const SOCIAL_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  youtube: YoutubeIcon,
  twitter: XIcon,
  x: XIcon,
  instagram: InstagramIcon,
}

const QUICK_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/deals', label: 'Deals & Offers' },
  { href: '/compare', label: 'Compare Products' },
  { href: '/brands', label: 'All Brands' },
  { href: '/tags', label: 'Browse Tags' },
  { href: '/search', label: 'Search' },
  { href: '/my', label: 'My Stuff' },
  { href: '/saved', label: 'Saved' },
  { href: '/alerts', label: 'Price Alerts' },
  { href: '/feed.xml', label: 'Deals RSS Feed' },
]

const LEGAL_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/how-we-test', label: 'How We Test' },
  { href: '/affiliate-disclosure', label: 'Affiliate Disclosure' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Use' },
]

export default function Footer({ categories, bestOfLists }: FooterProps) {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const hasSocial = Object.values(siteConfig.social_links).some(Boolean)

  return (
    <footer className="mt-auto bg-surface-alt border-t border-border">
      {/* Trust strip */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-accent" />
            Independent reviews — no paid rankings
          </span>
          <span>Prices tracked across Amazon, Flipkart & more</span>
          <span>Updated daily</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand + newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="flex items-center gap-2 font-heading text-lg font-bold text-primary">
              <SiteLogoMark className="h-6 w-6 shrink-0" />
              {siteConfig.site_name}
            </p>
            <p className="mt-2 text-sm text-muted leading-relaxed">{siteConfig.tagline}</p>
            <p className="mt-3 text-xs text-muted">
              Honest tech reviews and best prices for the Indian market.
            </p>

            <NewsletterSignup />
          </div>

          {/* Browse */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">Browse</p>
            <nav className="flex flex-col gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  className="text-sm text-muted hover:text-accent transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Guides */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">Editor&apos;s Guides</p>
            <nav className="flex flex-col gap-2">
              {bestOfLists.map((list) => (
                <Link
                  key={list.slug}
                  href={`/best-of/${list.slug}`}
                  className="text-sm text-muted hover:text-accent transition-colors line-clamp-1"
                >
                  {list.title}
                </Link>
              ))}
              <Link href="/best-of" className="text-sm font-semibold text-accent hover:underline mt-1">
                All guides →
              </Link>
            </nav>
          </div>

          {/* Quick links + social */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">Quick Links</p>
            <nav className="flex flex-col gap-2 mb-6">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Legal</p>
            <nav className="flex flex-col gap-2 mb-6">
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {hasSocial && (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Follow</p>
                <div className="flex gap-3">
                  {Object.entries(siteConfig.social_links).map(([platform, url]) => {
                    const Icon = SOCIAL_ICON_MAP[platform.toLowerCase()]
                    if (!Icon || !url) return null
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Follow on ${platform}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted hover:text-accent hover:border-accent transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
          <p>{siteConfig.footer_text}</p>
          <p>
            <Link href="/affiliate-disclosure" className="hover:text-accent transition-colors">
              Affiliate disclosure
            </Link>
            {' · '}
            We may earn from qualifying purchases.
          </p>
        </div>
      </div>

      {/* Back to top */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors md:bottom-6"
          aria-label="Back to top"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </footer>
  )
}
