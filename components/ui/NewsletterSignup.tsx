'use client'

import { useState } from 'react'
import { Mail, Check, Loader2 } from 'lucide-react'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error ?? 'Something went wrong')
        return
      }
      setStatus('success')
      setMessage('You\'re in! Deal alerts on the way.')
      setEmail('')
    } catch {
      setStatus('error')
      setMessage('Network error — try again')
    }
  }

  if (status === 'success') {
    return (
      <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
          <Check size={16} /> {message}
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2 flex items-center gap-1">
        <Mail size={12} /> Stay updated
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          required
          aria-label="Email for updates"
          className="flex-1 min-w-0 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 transition-colors disabled:opacity-60 inline-flex items-center gap-1.5"
        >
          {status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : 'Join'}
        </button>
      </form>
      {status === 'error' && message && (
        <p className="text-xs text-red-600 mt-1.5">{message}</p>
      )}
      <p className="text-[10px] text-muted mt-1.5">Deal alerts & new reviews. No spam.</p>
    </div>
  )
}
