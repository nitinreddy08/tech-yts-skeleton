import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/ui/LegalPageShell'
import { siteConfig } from '@/lib/config'
import { SITE_URL } from '@/lib/utils/seo'

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.site_name}`,
  description: 'How we collect, use, and protect your data on TechReviews India.',
  alternates: { canonical: `${SITE_URL}/privacy` },
}

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy">
      <p>
        {siteConfig.site_name} respects your privacy. This policy explains what we collect when you
        browse our site and how we use it.
      </p>
      <h2 className="font-heading text-lg font-bold text-primary pt-2">Information we collect</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Anonymous analytics (page views, referral source) when you accept cookies</li>
        <li>Affiliate click logs (hashed IP, user agent, store clicked) to measure link performance</li>
        <li>Newsletter email if you subscribe voluntarily</li>
        <li>Browser local storage for saved products, compare lists, and price alerts — stored on your device only</li>
      </ul>
      <h2 className="font-heading text-lg font-bold text-primary pt-2">Cookies</h2>
      <p>
        We use cookies for analytics (Google Analytics, when configured) and to remember your cookie
        consent choice. You can decline non-essential cookies via the banner on first visit.
      </p>
      <h2 className="font-heading text-lg font-bold text-primary pt-2">Third parties</h2>
      <p>
        Outbound links to Amazon, Flipkart, and other stores are governed by their privacy policies.
        We do not sell personal data.
      </p>
      {/* Only shown once a real contact address is configured (siteConfig.contact_email). */}
      {siteConfig.contact_email && (
        <>
          <h2 className="font-heading text-lg font-bold text-primary pt-2">Contact</h2>
          <p>
            Questions about this policy? Email{' '}
            <a href={`mailto:${siteConfig.contact_email}`}>{siteConfig.contact_email}</a>.
          </p>
        </>
      )}
    </LegalPageShell>
  )
}
