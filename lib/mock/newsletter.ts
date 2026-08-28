export interface NewsletterSubscriber {
  id: string
  email: string
  subscribed_at: string
}

export const newsletterSubscribers: NewsletterSubscriber[] = [
  { id: 'sub-seed-1', email: 'rahul.sharma@gmail.com', subscribed_at: '2026-08-01T10:00:00.000Z' },
  { id: 'sub-seed-2', email: 'priya@outlook.com', subscribed_at: '2026-08-15T14:30:00.000Z' },
  { id: 'sub-seed-3', email: 'techdeals@yahoo.in', subscribed_at: '2026-08-20T09:15:00.000Z' },
]

export function subscribeEmail(email: string): { ok: true } | { ok: false; error: string } {
  const normalized = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, error: 'Enter a valid email address' }
  }
  if (newsletterSubscribers.some((s) => s.email === normalized)) {
    return { ok: false, error: 'You\'re already subscribed' }
  }
  newsletterSubscribers.push({
    id: `sub-${Date.now()}`,
    email: normalized,
    subscribed_at: new Date().toISOString(),
  })
  return { ok: true }
}
