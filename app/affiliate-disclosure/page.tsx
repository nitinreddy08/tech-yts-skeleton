import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/ui/LegalPageShell'
import { siteConfig } from '@/lib/config'
import { SITE_URL } from '@/lib/utils/seo'

export const metadata: Metadata = {
  title: `Affiliate Disclosure | ${siteConfig.site_name}`,
  description: 'How affiliate links work on TechReviews India and how we stay editorially independent.',
  alternates: { canonical: `${SITE_URL}/affiliate-disclosure` },
}

export default function AffiliateDisclosurePage() {
  return (
    <LegalPageShell title="Affiliate Disclosure">
      <p>
        {siteConfig.site_name} participates in affiliate programs with Amazon, Flipkart, and other
        retailers. When you click a &quot;Check price&quot; or &quot;Buy&quot; button and complete a
        purchase, we may earn a commission at no additional cost to you.
      </p>
      <h2 className="font-heading text-lg font-bold text-primary pt-2">Editorial independence</h2>
      <p>
        Affiliate relationships do not influence our review scores, pros/cons, or best-of rankings.
        We recommend products we would genuinely suggest to friends — commission rates never determine
        placement.
      </p>
      <h2 className="font-heading text-lg font-bold text-primary pt-2">How links work</h2>
      <p>
        Outbound links route through <code className="text-xs bg-surface-alt px-1 py-0.5 rounded">/go/[id]</code>{' '}
        so we can log anonymized click data and keep price-tracking accurate. You are always sent to
        the official store URL.
      </p>
      <h2 className="font-heading text-lg font-bold text-primary pt-2">Your support</h2>
      <p>
        Affiliate revenue funds hosting, price updates, and new reviews. Thank you for supporting
        independent tech journalism in India.
      </p>
    </LegalPageShell>
  )
}
