import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/ui/LegalPageShell'
import { siteConfig } from '@/lib/config'
import { SITE_URL } from '@/lib/utils/seo'

export const metadata: Metadata = {
  title: `About Us | ${siteConfig.site_name}`,
  description: `Learn about ${siteConfig.site_name} — independent tech reviews and price tracking for India.`,
  alternates: { canonical: `${SITE_URL}/about` },
}

export default function AboutPage() {
  return (
    <LegalPageShell title="About Us">
      <p>
        {siteConfig.site_name} helps Indian shoppers make confident tech purchases. We publish
        honest, creator-led reviews and track prices across Amazon, Flipkart, and official brand
        stores — so you always know where to buy at the best price.
      </p>
      <p>
        Our rankings are editorial, not paid. Brands cannot buy placement on our best-of lists or
        review scores. When you click an affiliate link, we may earn a commission at no extra cost
        to you — that keeps the site free to use.
      </p>
      <p>
        Have feedback or a product tip? Reach us through the social links in the footer or subscribe
        to our deals newsletter for price drops and bank offers.
      </p>
    </LegalPageShell>
  )
}
