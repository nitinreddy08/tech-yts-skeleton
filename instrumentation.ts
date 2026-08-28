/**
 * Next.js instrumentation hook (runs once at server startup).
 * Starts the MSW Node HTTP interceptor so that any fetch() calls
 * made inside Server Components/Actions that target /api/mock/* are
 * intercepted by the mock handlers — no real network needed.
 *
 * This only activates in development (NODE_ENV !== 'production').
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (process.env.NODE_ENV !== 'production') {
      const { server } = await import('./lib/mock/server')
      server.listen({ onUnhandledRequest: 'bypass' })
      console.log('[MSW] Node server started — mock API active')
    }
  }
}
