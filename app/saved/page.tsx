import type { Metadata } from 'next'
import { SavedProductsClient } from '@/components/ui/SavedProductsClient'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: `Saved Products | ${siteConfig.site_name}`,
  description: 'Your saved tech products — compare prices and buy at the best deal in India.',
  robots: { index: false, follow: true },
}

export default function SavedPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <SavedProductsClient />
    </main>
  )
}
