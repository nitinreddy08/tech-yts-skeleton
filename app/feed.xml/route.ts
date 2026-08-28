import { fetchActiveDeals } from '@/lib/data/deals'
import { buildDealsRssXml } from '@/lib/feed/deals-rss'
import { siteConfig } from '@/lib/config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'

export const revalidate = 3600

export async function GET() {
  const deals = await fetchActiveDeals()
  const xml = buildDealsRssXml(deals, SITE_URL, siteConfig.site_name)

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
