'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bookmark } from 'lucide-react'
import { loadWishlist } from '@/lib/utils/wishlist'

export function SavedNavLink({ className = '' }: { className?: string }) {
  const pathname = usePathname()
  const [count, setCount] = useState(0)
  const active = pathname === '/saved'

  useEffect(() => {
    const refresh = () => setCount(loadWishlist().length)
    refresh()
    window.addEventListener('wishlist-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('wishlist-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return (
    <Link
      href="/saved"
      className={`inline-flex items-center gap-1.5 transition-colors ${className} ${
        active ? 'text-accent' : 'text-muted hover:text-primary'
      }`}
      aria-label={count > 0 ? `Saved products (${count})` : 'Saved products'}
    >
      <Bookmark size={14} className={active ? 'fill-accent/20' : ''} />
      Saved
      {count > 0 && (
        <span className="rounded-full bg-accent text-white px-1.5 py-0.5 text-[10px] font-bold min-w-[18px] text-center">
          {count}
        </span>
      )}
    </Link>
  )
}
