/**
 * lib/data/deals.ts
 *
 * Server-side deal read API. Thin `unstable_cache` wrappers around
 * `dealRepository` — "active" is no longer computed locally, it's the
 * repository's derived `status === 'active'` filter, so the public site and
 * the admin panel share one definition of what counts as live.
 */
import { unstable_cache } from 'next/cache'
import { dealRepository } from '@/lib/repositories'
import type { Deal } from '@/types'

export const fetchActiveDeals = unstable_cache(
  async (): Promise<Deal[]> => {
    return dealRepository.list({ liveOnly: true })
  },
  ['active-deals'],
  { revalidate: 60, tags: ['deals'] }
)

export const fetchDealOfTheDay = unstable_cache(
  async (): Promise<Deal | null> => {
    return dealRepository.dealOfTheDay()
  },
  ['deal-of-the-day'],
  { revalidate: 60, tags: ['deals'] }
)

/** Deals expiring within the next 48 hours */
export const fetchExpiringSoonDeals = unstable_cache(
  async (hours = 48): Promise<Deal[]> => {
    return dealRepository.list({ expiringWithinHours: hours })
  },
  ['expiring-soon-deals'],
  { revalidate: 60, tags: ['deals'] }
)
