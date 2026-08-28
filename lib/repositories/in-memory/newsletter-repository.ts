/**
 * lib/repositories/in-memory/newsletter-repository.ts
 */
import { db, newId, type db as DbType } from '@/lib/mock/db'
import { newsletterSubscribeInputSchema, type NewsletterSubscriber } from '@/lib/schemas'
import { parseOrThrow } from '../validate'
import { ConflictError } from '../errors'
import type { NewsletterRepository, NewsletterQuery } from '../newsletter-repository'

type Store = typeof DbType

export function createInMemoryNewsletterRepository(store: Store = db): NewsletterRepository {
  return {
    async list(query: NewsletterQuery = {}) {
      let rows = [...store.newsletterSubscribers].sort(
        (a, b) => new Date(b.subscribed_at).getTime() - new Date(a.subscribed_at).getTime()
      )
      if (query.search) {
        const q = query.search.toLowerCase()
        rows = rows.filter((s) => s.email.toLowerCase().includes(q))
      }
      return rows
    },

    async count() {
      return store.newsletterSubscribers.length
    },

    async subscribe(input) {
      // Schema already trims + lowercases, so `data.email` is normalised.
      const data = parseOrThrow(newsletterSubscribeInputSchema, input, 'Invalid email')

      if (store.newsletterSubscribers.some((s) => s.email === data.email)) {
        throw new ConflictError("You're already subscribed")
      }

      const subscriber: NewsletterSubscriber = {
        id: newId(),
        email: data.email,
        subscribed_at: new Date().toISOString(),
      }
      store.newsletterSubscribers.push(subscriber)
      return subscriber
    },
  }
}
