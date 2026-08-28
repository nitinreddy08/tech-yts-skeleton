// Feature: ui-redesign, Property 2 (admin): No dark background classes on admin pages

import { describe, it, expect, vi } from 'vitest'
import { render, act } from '@testing-library/react'

// --- Mocks ---

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      from: () => ({
        select: () => Promise.resolve({ count: 42, error: null }),
      }),
    }),
}))

// Import page AFTER mocks
import AdminDashboard from '../admin/page'

// --- Tests ---

describe('Admin Dashboard', () => {
  /**
   * Property 2 (admin): No dark background classes on admin pages
   * Validates: Requirements 13.1, 16.1
   *
   * The admin dashboard renders no dark background Tailwind classes.
   */
  it('renders no dark background Tailwind classes', async () => {
    const darkBgPattern =
      /\b(bg-zinc-[6-9]00|bg-black|bg-gray-[6-9]00|bg-white\/5|bg-zinc-950|bg-zinc-900)\b/

    let container!: HTMLElement
    await act(async () => {
      const result = render(await AdminDashboard())
      container = result.container
    })

    expect(darkBgPattern.test(container.innerHTML)).toBe(false)
  })
})
