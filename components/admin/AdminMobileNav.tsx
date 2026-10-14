'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Zap, Trophy, Mail, IndianRupee } from 'lucide-react'

const ITEMS = [
  { href: '/admin', label: 'Home', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package, exact: false },
  { href: '/admin/prices', label: 'Prices', icon: IndianRupee, exact: false },
  { href: '/admin/deals', label: 'Deals', icon: Zap, exact: false },
  { href: '/admin/best-of-lists', label: 'Lists', icon: Trophy, exact: false },
  { href: '/admin/newsletter', label: 'Mail', icon: Mail, exact: false },
]

function active(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminMobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur-sm">
      <div className="flex items-stretch">
        {ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = active(pathname, item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                isActive ? 'text-accent' : 'text-muted'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
