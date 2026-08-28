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
import { createInMemoryBestOfListRepository } from './in-memory/best-of-list-repository'
import { createInMemoryClickLogRepository } from './in-memory/click-log-repository'
import { createInMemoryCategoryRepository } from './in-memory/category-repository'
import { createInMemoryBrandRepository } from './in-memory/brand-repository'
import { createInMemoryNewsletterRepository } from './in-memory/newsletter-repository'
import type { ProductRepository } from './product-repository'
import type { DealRepository } from './deal-repository'
import type { BestOfListRepository } from './best-of-list-repository'
import type { ClickLogRepository } from './click-log-repository'
import type { CategoryRepository } from './category-repository'
import type { BrandRepository } from './brand-repository'
import type { NewsletterRepository } from './newsletter-repository'

export const productRepository: ProductRepository = createInMemoryProductRepository()
export const dealRepository: DealRepository = createInMemoryDealRepository()
export const bestOfListRepository: BestOfListRepository = createInMemoryBestOfListRepository()
export const clickLogRepository: ClickLogRepository = createInMemoryClickLogRepository()
export const categoryRepository: CategoryRepository = createInMemoryCategoryRepository()
export const brandRepository: BrandRepository = createInMemoryBrandRepository()
export const newsletterRepository: NewsletterRepository = createInMemoryNewsletterRepository()

export type { ProductRepository } from './product-repository'
export type { DealRepository, DealView } from './deal-repository'
export type { BestOfListRepository, BestOfListQuery } from './best-of-list-repository'
export type { ClickLogRepository, ClickLogQuery } from './click-log-repository'
export type { CategoryRepository } from './category-repository'
export type { BrandRepository, BrandWithCount } from './brand-repository'
export type { NewsletterRepository, NewsletterQuery } from './newsletter-repository'
export type { ProductQuery, ProductSort } from './product-repository'
export type { DealQuery } from './deal-repository'
export * from './errors'
