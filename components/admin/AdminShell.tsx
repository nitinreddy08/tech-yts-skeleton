'use client'

import { usePathname } from 'next/navigation'

interface AdminShellProps {
  sidebar: React.ReactNode
  mobileNav: React.ReactNode
  children: React.ReactNode
}

/**
 * Admin chrome (sidebar + mobile tab bar). The login page is shown to
 * signed-out visitors, so it renders bare — no navigation to screens they
 * can't open, and no "Sign Out" button on a page you aren't signed in to.
 */
export function AdminShell({ sidebar, mobileNav, children }: AdminShellProps) {
  const pathname = usePathname() ?? ''

  if (pathname === '/admin/login') {
    return <main id="main-content" className="min-h-screen bg-surface-alt">{children}</main>
  }

  return (
    <div className="flex min-h-screen bg-surface-admin">
      {sidebar}
      <main id="main-content" className="flex-1 overflow-auto pb-16 lg:pb-0">
        {children}
      </main>
      {mobileNav}
    </div>
  )
}
