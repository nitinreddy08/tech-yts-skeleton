'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useBottomLayer } from '@/lib/hooks/useBottomLayer'

const CONSENT_KEY = 'techreviews-cookie-consent'

export function CookieConsent() {
  const pathname = usePathname() ?? ''
  const [stored, setStored] = useState<'accepted' | 'declined' | null | undefined>(undefined)
  const visible = stored === null && !pathname.startsWith('/admin')
  const ref = useBottomLayer<HTMLDivElement>('cookie', visible)

  useEffect(() => {
    const v = localStorage.getItem(CONSENT_KEY)
    setStored(v === 'accepted' || v === 'declined' ? v : null)
  }, [])

  function choose(choice: 'accepted' | 'declined') {
    localStorage.setItem(CONSENT_KEY, choice)
    setStored(choice)
    if (choice === 'accepted') window.dispatchEvent(new Event('cookie-consent-accepted'))
  }

  if (!visible) return null

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 z-50 p-3 bottom-[calc(var(--layer-tabbar)_+_var(--layer-compare)_+_var(--layer-buy))] md:inset-x-auto md:left-4 md:max-w-md md:p-0 md:bottom-[calc(var(--layer-compare)_+_var(--layer-buy)_+_1rem)]"
    >
      <div className="rounded-xl border border-border bg-surface shadow-lg p-4">
        <p className="text-sm text-primary font-medium mb-1">Cookies &amp; analytics</p>
        <p className="text-xs text-muted leading-relaxed mb-3">
          We use cookies for analytics and affiliate tracking. Essential cookies always stay on;
          you can decline the rest. See our{' '}
          <Link href="/privacy" className="text-accent underline underline-offset-2">Privacy Policy</Link>.
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="auto"
            className="h-11 flex-1 px-4 text-sm"
            onClick={() => choose('declined')}
          >
            Decline
          </Button>
          <Button size="auto" className="h-11 flex-1 px-4 text-sm" onClick={() => choose('accepted')}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}

export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(CONSENT_KEY) === 'accepted'
}
