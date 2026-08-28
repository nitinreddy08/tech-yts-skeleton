import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/ui/LegalPageShell'
import { siteConfig } from '@/lib/config'
import { SITE_URL } from '@/lib/utils/seo'

export const metadata: Metadata = {
  title: `How We Test | ${siteConfig.site_name}`,
  description: 'Our review methodology — real-world testing, spec verification, and transparent scoring.',
  alternates: { canonical: `${SITE_URL}/how-we-test` },
}

export default function HowWeTestPage() {
  return (
    <LegalPageShell title="How We Test">
      <p>
        Every product on {siteConfig.site_name} goes through hands-on evaluation before we publish a
        score. We use devices as daily drivers — not just lab benchmarks — covering battery, camera,
        display, performance, and value for money in the Indian market.
      </p>
      <h2 className="font-heading text-lg font-bold text-primary pt-2">Creator rating (out of 10)</h2>
      <p>
        Our headline score reflects overall recommendation strength. It weighs performance, build
        quality, software support, and price at launch versus current street prices. A 7+ is a solid
        buy; 8+ is highly recommended; 9+ is best-in-class for its segment.
      </p>
      <h2 className="font-heading text-lg font-bold text-primary pt-2">Specs &amp; prices</h2>
      <p>
        Specifications are verified against official datasheets and in-device settings. Prices are
        refreshed regularly from affiliate feeds; stale prices are flagged on product pages and in our
        admin price-health queue.
      </p>
      <h2 className="font-heading text-lg font-bold text-primary pt-2">Comparisons &amp; best-of lists</h2>
      <p>
        Compare tools highlight spec differences side-by-side. Editor&apos;s picks (best-of lists) are
        curated for specific budgets and use cases — gaming, photography, students, and more — and
        updated when major launches land.
      </p>
    </LegalPageShell>
  )
}
