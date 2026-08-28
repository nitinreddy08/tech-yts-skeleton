import type { Metadata } from 'next'
import { PriceAlertsClient } from '@/components/ui/PriceAlertsClient'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: `Price Alerts | ${siteConfig.site_name}`,
  description: 'Track price drops on tech products you want — get notified when deals hit your target.',
  robots: { index: false, follow: true },
}

export default function AlertsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <PriceAlertsClient />
    </main>
  )
}
