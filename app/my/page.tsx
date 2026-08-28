import type { Metadata } from 'next'
import { MyStuffClient } from '@/components/ui/MyStuffClient'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: `My Stuff | ${siteConfig.site_name}`,
  description: 'Your saved products, price alerts, and recent comparisons.',
  robots: { index: false, follow: true },
}

export default function MyStuffPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <MyStuffClient />
    </main>
  )
}
