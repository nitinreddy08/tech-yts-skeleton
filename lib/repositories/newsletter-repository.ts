/**
 * lib/repositories/newsletter-repository.ts
 */
import type { NewsletterSubscriber } from '@/lib/schemas'

export interface NewsletterQuery {
  /** Case-insensitive substring match against email. */
  search?: string
}

export interface NewsletterRepository {
  list(query?: NewsletterQuery): Promise<NewsletterSubscriber[]>
  count(): Promise<number>

  /**
   * Accepts `unknown` deliberately — see the matching note on
   * ProductRepository.create. Throws ConflictError if the (normalised) email
   * is already subscribed.
   */
  subscribe(input: unknown): Promise<NewsletterSubscriber>
}
