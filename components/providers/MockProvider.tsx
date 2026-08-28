'use client'

import { useEffect, useState } from 'react'

/**
 * Starts the MSW Service Worker in the browser during development.
 * Renders children immediately — MSW starts in the background.
 * In production this component is a no-op passthrough.
 */
export function MockProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(process.env.NODE_ENV !== 'development')

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    import('@/lib/mock/browser').then(({ worker }) => {
      worker
        .start({
          onUnhandledRequest: 'bypass', // let real next.js routes through
          serviceWorker: { url: '/mockServiceWorker.js' },
        })
        .then(() => setReady(true))
        .catch(err => {
          console.warn('[MSW] Service worker failed to start:', err)
          setReady(true) // unblock rendering even if MSW fails
        })
    })
  }, [])

  // Show nothing until MSW is ready to avoid flash of unhandled requests
  if (!ready) return null

  return <>{children}</>
}
