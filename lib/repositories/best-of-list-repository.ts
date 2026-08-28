/**
 * lib/repositories/best-of-list-repository.ts
 *
 * Repository interface for curated Best-Of Lists (Requirement 11). Every read
 * re-joins each item's `product` summary from the current product row rather
 * than trusting whatever was cached at write time — see the mapper doc comment
 * in in-memory/mappers.ts for why that matters.
 */
import type { BestOfList } from '@/lib/schemas'

export interface BestOfListQuery {
  /** Defaults to true — set false for the admin list, which shows drafts too. */
  publishedOnly?: boolean
}

export interface BestOfListRepository {
  list(query?: BestOfListQuery): Promise<BestOfList[]>
  findBySlug(slug: string, opts?: { includeUnpublished?: boolean }): Promise<BestOfList | null>
  findById(id: string): Promise<BestOfList | null>

  /** Accepts `unknown` deliberately — see the matching note on ProductRepository.create. */
  create(input: unknown): Promise<BestOfList>
  update(id: string, input: unknown): Promise<BestOfList>
  remove(id: string): Promise<void>

  /** Replace just the ranked item set, leaving title/slug/etc. untouched. */
  replaceItems(id: string, items: unknown): Promise<BestOfList>
}
