import { describe, it, expect, beforeEach } from 'vitest'
import { createInMemoryNewsletterRepository } from '../in-memory/newsletter-repository'
import { ConflictError, ValidationError } from '../errors'
import { makeStore, type TestStore } from './fixtures'

let store: TestStore
let repo: ReturnType<typeof createInMemoryNewsletterRepository>

beforeEach(() => {
  store = makeStore()
  repo = createInMemoryNewsletterRepository(store as unknown as Parameters<typeof createInMemoryNewsletterRepository>[0])
})

describe('NewsletterRepository — list/count', () => {
  it('lists subscribers newest first', async () => {
    const list = await repo.list()
    const times = list.map((s) => new Date(s.subscribed_at).getTime())
    expect(times).toEqual([...times].sort((a, b) => b - a))
  })

  it('filters by email substring, case-insensitively', async () => {
    const list = await repo.list({ search: 'GMAIL' })
    expect(list.every((s) => s.email.includes('gmail'))).toBe(true)
    expect(list.length).toBeGreaterThan(0)
  })

  it('count matches list length', async () => {
    expect(await repo.count()).toBe(store.newsletterSubscribers.length)
  })
})

describe('NewsletterRepository — subscribe', () => {
  it('adds a new subscriber, normalising email to lowercase/trimmed', async () => {
    const before = store.newsletterSubscribers.length
    const sub = await repo.subscribe({ email: '  New.Person@Example.com  ' })
    expect(sub.email).toBe('new.person@example.com')
    expect(store.newsletterSubscribers).toHaveLength(before + 1)
  })

  it('rejects an invalid email', async () => {
    await expect(repo.subscribe({ email: 'not-an-email' })).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejects a duplicate email (case-insensitive)', async () => {
    await repo.subscribe({ email: 'dup@example.com' })
    await expect(repo.subscribe({ email: 'DUP@example.com' })).rejects.toBeInstanceOf(ConflictError)
  })

  it('rejects an email already in the seed data', async () => {
    await expect(repo.subscribe({ email: 'rahul.sharma@gmail.com' })).rejects.toBeInstanceOf(
      ConflictError
    )
  })
})
