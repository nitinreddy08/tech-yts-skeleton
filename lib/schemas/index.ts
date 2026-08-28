/**
 * lib/schemas — barrel.
 *
 * Zod schemas are the single source of truth for the app's domain model.
 * Runtime code imports the schemas from here; the corresponding TypeScript
 * types are re-exported through `@/types` so existing imports keep working.
 */
export * from './common'
export * from './product'
export * from './deal'
export * from './best-of-list'
export * from './click-log'
export * from './newsletter'
