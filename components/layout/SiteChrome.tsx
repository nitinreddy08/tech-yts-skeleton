'use client'

import { usePathname } from 'next/navigation'

interface SiteChromeProps {
  header: React.ReactNode
  footer: React.ReactNode
  children: React.ReactNode
}

/**
 * Wraps page content in the storefront chrome (skip link, header, footer).
 * The admin area has its own shell, so storefront chrome is skipped there —
 * previously the public header, footer and search sat around every admin page.
 *
 * `header` / `footer` arrive as already-rendered server components, which is
 * why this is a thin client wrapper rather than the layout itself.
 */
export function SiteChrome({ header, footer, children }: SiteChromeProps) {
  const pathname = usePathname() ?? ''
  if (pathname.startsWith('/admin')) return <>{children}</>

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] rounded-md bg-accent px-4 py-3 text-sm font-semibold text-white shadow-lg"
      >
        Skip to main content
      </a>
      {header}
      {/* Pages render their own <main>; this wrapper is only the skip-link
          target and keeps the footer pinned to the bottom on short pages. */}
      <div id="main-content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {children}
      </div>
      {footer}
    </>
  )
}
