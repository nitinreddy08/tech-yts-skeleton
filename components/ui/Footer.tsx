'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { siteConfig } from '@/lib/config'
import { ArrowUp } from 'lucide-react'
import { NewsletterSignup } from '@/components/ui/NewsletterSignup'
import { SiteLogoMark } from '@/components/ui/SiteLogo'

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" width="20" height="20" aria-hidden="true">
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

const EXPLORE_LINKS = [
  { href: '/deals', label: 'Deals & offers' },
  { href: '/best-of', label: 'Editor’s guides' },
  { href: '/compare', label: 'Compare products' },
  { href: '/brands', label: 'All brands' },
  { href: '/my', label: 'My Stuff' },
]

const ABOUT_LINKS = [
  { href: '/about', label: 'About us' },
  { href: '/how-we-test', label: 'How we test' },
  { href: '/affiliate-disclosure', label: 'Affiliate disclosure' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
]

const linkClass =
  'flex min-h-8 items-center pointer-coarse:min-h-11 text-sm text-muted transition-colors hover:text-accent'

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const hasSocial = Object.values(siteConfig.social_links).some(Boolean)

  return (
    <footer className="mt-auto border-t border-border bg-surface-alt">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-[2fr_1fr_1fr]">
          {/* Brand + newsletter */}
          <div className="col-span-2 lg:col-span-1">
            <p className="flex items-center gap-2 font-heading text-lg font-bold text-primary">
              <SiteLogoMark className="h-6 w-6 shrink-0" />
              {siteConfig.site_name}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{siteConfig.tagline}</p>
            <NewsletterSignup />
            {hasSocial && (
              <div className="mt-3 flex gap-2">
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
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:border-accent hover:text-accent"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {/* Explore */}
          <div>
            <h2 className="mb-2 text-sm font-semibold text-primary">Explore</h2>
            <nav aria-label="Explore" className="flex flex-col">
              {EXPLORE_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* About + legal */}
          <div>
            <h2 className="mb-2 text-sm font-semibold text-primary">About</h2>
            <nav aria-label="About and legal" className="flex flex-col">
              {ABOUT_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-1 px-4 py-3 text-xs text-muted sm:flex-row sm:items-center sm:px-6">
          <p>{siteConfig.footer_text}</p>
          <p>We may earn a commission from qualifying purchases.</p>
        </div>
      </div>

      {/* Back to top */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors bottom-[calc(var(--layer-tabbar)_+_var(--layer-compare)_+_var(--layer-buy)_+_var(--layer-cookie)_+_1rem)]"
          aria-label="Back to top"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </footer>
  )
}
