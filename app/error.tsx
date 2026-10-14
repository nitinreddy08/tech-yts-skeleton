'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/** Route-level error boundary: a failed data fetch no longer blanks the whole app. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <AlertTriangle size={48} className="mb-4 text-warning-700" aria-hidden />
      <h1 className="font-heading text-2xl font-bold text-primary">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted">
        We couldn&apos;t load this page. It&apos;s usually temporary — try again, or head back home.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button size="auto" className="h-11 px-5 text-sm" onClick={reset}>
          Try again
        </Button>
        <Button variant="secondary" size="auto" className="h-11 px-5 text-sm" href="/">
          Go home
        </Button>
      </div>
    </main>
  )
}
