import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/ui/LegalPageShell'
import { siteConfig } from '@/lib/config'
import { SITE_URL } from '@/lib/utils/seo'

export const metadata: Metadata = {
  title: `Terms of Use | ${siteConfig.site_name}`,
  description: 'Terms and conditions for using TechReviews India.',
  alternates: { canonical: `${SITE_URL}/terms` },
}

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Use">
      <p>
        By using {siteConfig.site_name}, you agree to these terms. If you do not agree, please do
        not use the site.
      </p>
      <h2 className="font-heading text-lg font-bold text-primary pt-2">Content &amp; accuracy</h2>
      <p>
        Reviews, prices, and specifications are provided for informational purposes. Prices change
        frequently; always confirm on the retailer before purchase. We are not responsible for
        third-party store pricing or availability.
      </p>
      <h2 className="font-heading text-lg font-bold text-primary pt-2">Intellectual property</h2>
      <p>
        Site content, branding, and original review text are owned by {siteConfig.site_name}. Product
        images and trademarks belong to their respective owners.
      </p>
      <h2 className="font-heading text-lg font-bold text-primary pt-2">Limitation of liability</h2>
      <p>
        We provide the site &quot;as is&quot; without warranties. We are not liable for decisions you
        make based on our content or for issues arising from affiliate retailer transactions.
      </p>
      <h2 className="font-heading text-lg font-bold text-primary pt-2">Changes</h2>
      <p>
        We may update these terms at any time. Continued use after changes constitutes acceptance.
      </p>
    </LegalPageShell>
  )
}
