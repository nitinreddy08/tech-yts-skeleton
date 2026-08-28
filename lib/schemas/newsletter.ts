/**
 * lib/schemas/newsletter.ts
 *
 * Schema for newsletter subscribers. Previously this list lived in its own
 * disconnected module-level array (lib/mock/newsletter.ts) — outside the
 * shared `db` store every other entity is part of, so it never got a
 * consistent test story and a real migration would have had to remember it
 * as a special case. It's now just another table in the same store.
 */
import { z } from 'zod'
import { idSchema, isoDateSchema } from './common'

export const newsletterSubscriberSchema = z.object({
  id: idSchema,
  email: z.email(),
  subscribed_at: isoDateSchema,
})

/**
 * What a visitor submits via the footer signup form. Trims and lowercases
 * before validating format — " Foo@Example.com " should be treated the same
 * as "foo@example.com", both for the format check and for the repository's
 * duplicate-subscription check.
 */
export const newsletterSubscribeInputSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Enter a valid email address')),
})

export type NewsletterSubscriber = z.infer<typeof newsletterSubscriberSchema>
export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeInputSchema>
