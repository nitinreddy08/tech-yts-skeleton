'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Zap, Trophy, LogOut, Mail, IndianRupee } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package, exact: false },
  { href: '/admin/prices', label: 'Prices', icon: IndianRupee, exact: false },
  { href: '/admin/deals', label: 'Deals', icon: Zap, exact: false },
  { href: '/admin/best-of-lists', label: 'Best Of Lists', icon: Trophy, exact: false },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Mail, exact: false },
]

function isActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border bg-surface">
      <div className="px-4 py-5 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Admin Panel</p>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(pathname, item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted hover:bg-surface-alt hover:text-primary'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto border-t border-border p-3">
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-alt hover:text-primary transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
