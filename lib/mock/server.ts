/**
 * lib/mock/server.ts
 *
 * Sets up MSW's Node.js HTTP interceptor for the Next.js server runtime.
 * This allows fetch() calls from Server Components to be intercepted
 * during development / tests.
 *
 * Started from instrumentation.ts (Next.js 15+ instrumentation hook).
 */

import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
