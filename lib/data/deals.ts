import { unstable_cache } from 'next/cache'
import { db } from '@/lib/mock/db'
import type { Deal } from '@/types'

function isActive(d: Deal): boolean {
  const now = new Date()
  return d.is_active && (d.expires_at == null || new Date(d.expires_at) > now)
}

export const fetchActiveDeals = unstable_cache(
  async (): Promise<Deal[]> => {
    return [...db.deals]
      .filter(isActive)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },
  ['active-deals'],
  { revalidate: 60, tags: ['deals'] }
)

export const fetchDealOfTheDay = unstable_cache(
  async (): Promise<Deal | null> => {
    return (
      [...db.deals]
        .filter(d => isActive(d) && d.deal_type === 'deal_of_day')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] ??
      null
    )
  },
  ['deal-of-the-day'],
  { revalidate: 60, tags: ['deals'] }
)

/** Deals expiring within the next 48 hours */
export const fetchExpiringSoonDeals = unstable_cache(
  async (hours = 48): Promise<Deal[]> => {
    const cutoff = Date.now() + hours * 3600000
    return [...db.deals]
      .filter((d) => {
        if (!isActive(d) || !d.expires_at) return false
        const exp = new Date(d.expires_at).getTime()
        return exp <= cutoff
      })
      .sort((a, b) => new Date(a.expires_at!).getTime() - new Date(b.expires_at!).getTime())
  },
  ['expiring-soon-deals'],
  { revalidate: 60, tags: ['deals'] }
)
