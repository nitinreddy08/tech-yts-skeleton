'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const CONSENT_KEY = 'techreviews-cookie-consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
    window.dispatchEvent(new Event('cookie-consent-accepted'))
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:bottom-4 md:left-4 md:right-auto md:max-w-md">
      <div className="rounded-xl border border-border bg-surface shadow-lg p-4">
        <p className="text-sm text-primary font-medium mb-1">Cookies & analytics</p>
        <p className="text-xs text-muted leading-relaxed mb-3">
          We use cookies for analytics and affiliate tracking. See our{' '}
          <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
        </p>
        <button
          type="button"
          onClick={accept}
          className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90"
        >
          Accept
        </button>
      </div>
    </div>
  )
}

export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(CONSENT_KEY) === 'accepted'
}
