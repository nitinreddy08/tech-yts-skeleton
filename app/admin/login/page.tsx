'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirectTo = searchParams.get('redirectTo') ?? '/admin'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = (formData.get('email') as string) ?? ''
    const password = (formData.get('password') as string) ?? ''

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const json = await res.json()

    if (!res.ok || !json.ok) {
      setError(json.error ?? 'Invalid credentials')
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
      <div className="bg-surface rounded-[var(--radius-card-lg)] border border-border shadow-[var(--shadow-md)] p-8 flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-primary mb-1.5 block">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-primary placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium text-primary mb-1.5 block">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-primary placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-center text-xs text-muted">
          Mock credentials: <span className="font-mono">admin@example.com</span> /{' '}
          <span className="font-mono">admin</span>
        </p>
      </div>
    </form>
  )
}

/**
 * Mock admin login page.
 * Credentials: any email containing "admin" OR password "admin"
 * Sets a simple cookie `mock-admin-session=1` which the middleware reads.
 */
export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-alt px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-2xl font-bold text-primary text-center">Admin Login</h1>
        <p className="mt-1 text-sm text-muted text-center">Sign in to manage your platform</p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
