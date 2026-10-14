'use client'

import { useEffect, useState } from 'react'

/**
 * Current time in ms, ticking every `intervalMs`. Returns null until mounted so
 * server and first client render match (computing Date.now() during render is a
 * hydration mismatch for anything that shows seconds).
 */
export function useNow(intervalMs = 1000): number | null {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    // The first tick runs from a timer so setState never happens synchronously in the effect.
    const first = setTimeout(() => setNow(Date.now()), 0)
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => {
      clearTimeout(first)
      clearInterval(id)
    }
  }, [intervalMs])

  return now
}
