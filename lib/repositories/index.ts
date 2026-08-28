/**
 * lib/repositories/index.ts
 *
 * The composition root for data access. Everything in the app imports its
 * repositories from here and never constructs one itself. This is the single
 * file you edit to go live: implement the repository interfaces against your
 * backend (e.g. `createSupabaseProductRepository()`), swap the bindings below,
 * and the entire app — server components, server actions, MSW handlers — moves
 * to the real backend with no other changes.
 *
 *   // export const productRepository = createSupabaseProductRepository(supabase)
 */
import { createInMemoryProductRepository } from './in-memory/product-repository'
import { createInMemoryDealRepository } from './in-memory/deal-repository'
import type { ProductRepository } from './product-repository'
import type { DealRepository } from './deal-repository'

export const productRepository: ProductRepository = createInMemoryProductRepository()
export const dealRepository: DealRepository = createInMemoryDealRepository()

export type { ProductRepository } from './product-repository'
export type { DealRepository, DealView } from './deal-repository'
export type { ProductQuery, ProductSort } from './product-repository'
export type { DealQuery } from './deal-repository'
export * from './errors'
