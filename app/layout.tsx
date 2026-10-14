import type { Metadata } from 'next'
import { Geist, Inter } from 'next/font/google'
import './globals.css'
import { siteConfig } from '@/lib/config'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import { SiteChrome } from '@/components/layout/SiteChrome'
import { MockProvider } from '@/components/providers/MockProvider'
import { CompareProvider } from '@/components/providers/CompareProvider'
import { AnalyticsScripts } from '@/components/ui/AnalyticsScripts'
import { CookieConsent } from '@/components/ui/CookieConsent'
import { generateWebSiteJsonLd } from '@/lib/utils/seo'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: { default: siteConfig.meta_default_title, template: `%s | ${siteConfig.site_name}` },
  description: siteConfig.meta_default_description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'),
  alternates: {
    types: {
      'application/rss+xml': `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'}/feed.xml`,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const websiteLd = generateWebSiteJsonLd()

  return (
    <html lang="en" className={`${geist.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-surface text-primary">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
        <MockProvider>
          <CompareProvider>
            <SiteChrome header={<SiteHeader />} footer={<SiteFooter />}>
              {children}
            </SiteChrome>
          </CompareProvider>
        </MockProvider>

        <AnalyticsScripts />
        <CookieConsent />
      </body>
    </html>
  )
}
