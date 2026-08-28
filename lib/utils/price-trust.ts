import type { AffiliateLink } from '@/types'

export function relativePriceTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Updated just now'
  if (hours < 24) return `Updated ${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Updated yesterday'
  return `Updated ${days} days ago`
}

export function isStalePrice(iso: string, staleDays = 7): boolean {
  const diff = Date.now() - new Date(iso).getTime()
  return diff > staleDays * 86400000
}

export function getNewestPriceUpdate(links: AffiliateLink[]): string | null {
  if (links.length === 0) return null
  return links.reduce((latest, link) =>
    new Date(link.last_updated) > new Date(latest) ? link.last_updated : latest
  , links[0].last_updated)
}

export function hasStalePrices(links: AffiliateLink[], staleDays = 7): boolean {
  return links.some((l) => isStalePrice(l.last_updated, staleDays))
}
