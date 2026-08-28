/**
 * lib/repositories/in-memory/best-of-list-repository.ts
 */
import { db, newId, type db as DbType } from '@/lib/mock/db'
import { bestOfListCreateSchema, bestOfListUpdateSchema, type BestOfListItem } from '@/lib/schemas'
import { z } from 'zod'
import { parseOrThrow } from '../validate'
import { ConflictError, ForeignKeyError, NotFoundError } from '../errors'
import type { BestOfListRepository, BestOfListQuery } from '../best-of-list-repository'
import { assembleBestOfList, toProductSummary } from './mappers'

type Store = typeof DbType

const itemsInputSchema = bestOfListCreateSchema.shape.items

export function createInMemoryBestOfListRepository(store: Store = db): BestOfListRepository {
  function requireIndex(id: string): number {
    const idx = store.bestOfLists.findIndex((l) => l.id === id)
    if (idx === -1) throw new NotFoundError('Best-of list', id)
    return idx
  }

  /**
   * `product` is re-resolved fresh on every read via assembleBestOfList — what's
   * stored here only needs to satisfy the row's shape and never actually goes
   * stale, but it still has to be a real product (a rank pointing at nothing
   * is a data integrity error, not something to silently accept).
   */
  function toItems(id: string, input: z.infer<typeof itemsInputSchema>): BestOfListItem[] {
    return input.map((item) => {
      const product = store.products.find((p) => p.id === item.product_id)
      if (!product) throw new ForeignKeyError(`Unknown product_id: ${item.product_id}`)
      return {
        id: newId(),
        list_id: id,
        product_id: item.product_id,
        rank: item.rank,
        pick_reason: item.pick_reason,
        product: toProductSummary(product),
      }
    })
  }

  return {
    async list(query: BestOfListQuery = {}) {
      const publishedOnly = query.publishedOnly ?? true
      let rows = [...store.bestOfLists]
      if (publishedOnly) rows = rows.filter((l) => l.is_published)
      rows.sort((a, b) => a.display_order - b.display_order)
      return rows.map((row) => assembleBestOfList(store, row))
    },

    async findBySlug(slug, opts) {
      const row = store.bestOfLists.find(
        (l) => l.slug === slug && (opts?.includeUnpublished || l.is_published)
      )
      return row ? assembleBestOfList(store, row) : null
    },

    async findById(id) {
      const row = store.bestOfLists.find((l) => l.id === id)
      return row ? assembleBestOfList(store, row) : null
    },

    async create(input) {
      const data = parseOrThrow(bestOfListCreateSchema, input, 'Invalid best-of list')
      if (store.bestOfLists.some((l) => l.slug === data.slug)) {
        throw new ConflictError(`A list with slug "${data.slug}" already exists`)
      }
      const id = newId()
      const now = new Date().toISOString()
      const row = {
        id,
        title: data.title,
        slug: data.slug,
        description: data.description,
        cover_image_url: data.cover_image_url,
        is_published: data.is_published,
        display_order: data.display_order,
        created_at: now,
        updated_at: now,
        items: toItems(id, data.items),
      }
      store.bestOfLists.push(row)
      return assembleBestOfList(store, row)
    },

    async update(id, input) {
      const idx = requireIndex(id)
      const data = parseOrThrow(bestOfListUpdateSchema, input, 'Invalid best-of list')
      const existing = store.bestOfLists[idx]

      if (data.slug && data.slug !== existing.slug) {
        if (store.bestOfLists.some((l) => l.slug === data.slug && l.id !== id)) {
          throw new ConflictError(`A list with slug "${data.slug}" already exists`)
        }
      }

      store.bestOfLists[idx] = {
        ...existing,
        ...data,
        items: data.items !== undefined ? toItems(id, data.items) : existing.items,
        updated_at: new Date().toISOString(),
      }
      return assembleBestOfList(store, store.bestOfLists[idx])
    },

    async remove(id) {
      const idx = requireIndex(id)
      store.bestOfLists.splice(idx, 1)
    },

    async replaceItems(id, items) {
      const idx = requireIndex(id)
      const data = parseOrThrow(itemsInputSchema, items, 'Invalid list items')
      store.bestOfLists[idx] = {
        ...store.bestOfLists[idx],
        items: toItems(id, data),
        updated_at: new Date().toISOString(),
      }
      return assembleBestOfList(store, store.bestOfLists[idx])
    },
  }
}
