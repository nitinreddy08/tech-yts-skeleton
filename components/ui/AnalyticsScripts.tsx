'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { siteConfig } from '@/lib/config'
import { hasAnalyticsConsent } from '@/components/ui/CookieConsent'

export function AnalyticsScripts() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(hasAnalyticsConsent())
    const onAccept = () => setEnabled(true)
    window.addEventListener('cookie-consent-accepted', onAccept)
    return () => window.removeEventListener('cookie-consent-accepted', onAccept)
  }, [])

  if (!enabled) return null

  return (
    <>
      {siteConfig.google_analytics_id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.google_analytics_id}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${siteConfig.google_analytics_id}');`}
          </Script>
        </>
      )}
      {siteConfig.google_adsense_id && (
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.google_adsense_id}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      )}
    </>
  )
}
