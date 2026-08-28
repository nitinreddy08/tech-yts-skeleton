'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid } from 'lucide-react'
import { loadWishlist } from '@/lib/utils/wishlist'
import { loadPriceAlerts } from '@/lib/utils/price-alerts'
import { loadRecentCompares } from '@/lib/utils/recent-compares'

export function MyStuffNavLink({ className = '' }: { className?: string }) {
  const pathname = usePathname()
  const [count, setCount] = useState(0)
  const active = pathname === '/my'

  useEffect(() => {
    const refresh = () => {
      setCount(
        loadWishlist().length + loadPriceAlerts().length + loadRecentCompares().length
      )
    }
    refresh()
    window.addEventListener('wishlist-updated', refresh)
    window.addEventListener('price-alerts-updated', refresh)
    window.addEventListener('recent-compares-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('wishlist-updated', refresh)
      window.removeEventListener('price-alerts-updated', refresh)
      window.removeEventListener('recent-compares-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return (
    <Link
      href="/my"
      className={`inline-flex items-center gap-1.5 transition-colors ${className} ${
        active ? 'text-accent' : 'text-muted hover:text-primary'
      }`}
      aria-label={count > 0 ? `My stuff (${count} items)` : 'My stuff'}
    >
      <LayoutGrid size={14} />
      My Stuff
      {count > 0 && (
        <span className="rounded-full bg-accent text-white px-1.5 py-0.5 text-[10px] font-bold min-w-[18px] text-center">
          {count}
        </span>
      )}
    </Link>
  )
}
