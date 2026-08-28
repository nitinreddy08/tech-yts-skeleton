/**
 * lib/mock/browser.ts
 *
 * Sets up the MSW Service Worker for the browser environment.
 * This is imported from a client-side provider component that is only
 * rendered when NODE_ENV === 'development'.
 */

import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
