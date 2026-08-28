import type { Deal } from '@/types'
import { formatIndianPrice } from '@/lib/utils/format'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function dealUrl(siteUrl: string, deal: Deal): string {
  const product = deal.product
  if (product) {
    return `${siteUrl}/${product.category_slug}/${product.slug}`
  }
  return `${siteUrl}/deals`
}

function dealDescription(deal: Deal): string {
  const parts = [deal.headline]
  if (deal.deal_price_inr != null) {
    parts.push(`Deal price: ${formatIndianPrice(deal.deal_price_inr)}`)
  }
  if (deal.original_price_inr != null && deal.deal_price_inr != null) {
    const pct = Math.round(((deal.original_price_inr - deal.deal_price_inr) / deal.original_price_inr) * 100)
    if (pct > 0) parts.push(`Save ${pct}%`)
  }
  parts.push(`Store: ${deal.store_name}`)
  return parts.join(' · ')
}

export function buildDealsRssXml(deals: Deal[], siteUrl: string, siteName: string): string {
  const now = new Date().toUTCString()
  const items = deals
    .slice(0, 30)
    .map((deal) => {
      const link = dealUrl(siteUrl, deal)
      const pubDate = new Date(deal.created_at).toUTCString()
      const title = escapeXml(deal.headline)
      const description = escapeXml(dealDescription(deal))
      const guid = escapeXml(deal.id)
      return `    <item>
      <title>${title}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="false">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)} — Deals &amp; Offers</title>
    <link>${escapeXml(siteUrl)}/deals</link>
    <description>Latest tech deals, price drops, and offers tracked by ${escapeXml(siteName)}.</description>
    <language>en-in</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${escapeXml(siteUrl)}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`
}
