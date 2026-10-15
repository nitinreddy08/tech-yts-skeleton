import { Suspense } from 'react'
import type { Metadata } from 'next'
import { MyStuffClient } from '@/components/ui/MyStuffClient'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: `My Stuff | ${siteConfig.site_name}`,
  description: 'Your saved products, price watches and recent comparisons.',
  robots: { index: false, follow: true },
}

export default function MyStuffPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8">
      {/* MyStuffClient reads ?tab= via useSearchParams, which needs a Suspense boundary. */}
      <Suspense fallback={<div className="h-64 shimmer rounded-xl" aria-hidden />}>
        <MyStuffClient />
      </Suspense>
    </main>
  )
}
