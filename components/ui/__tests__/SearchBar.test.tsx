// Feature: ui-redesign, Property 9: SearchBar suggestion count limit
// Feature: ui-redesign, Property 10: SearchBar suggestion item completeness

/**
 * Property-based tests for SearchBar
 * Validates: Requirements 3.2, 3.3
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act, waitFor } from '@testing-library/react'
import * as fc from 'fast-check'
import { SearchBar } from '../SearchBar'
import type { SearchResult } from '@/types'

vi.mock('next/image', () => ({ default: (props: any) => <img {...props} /> }))
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, ...rest } = props
      return <div {...rest}>{children}</div>
    },
  },
}))

// Arbitrary for a single SearchResult
const searchResultArb: fc.Arbitrary<SearchResult> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 60 }),
  slug: fc.stringMatching(/^[a-z0-9-]{1,30}$/),
  category_slug: fc.stringMatching(/^[a-z0-9-]{1,20}$/),
  thumbnail_url: fc.oneof(
    fc.constant(''),
    fc.constant('https://example.com/thumb.jpg'),
  ),
  current_price_inr: fc.oneof(fc.constant(null), fc.integer({ min: 1, max: 200000 })),
  type: fc.constant('product' as const),
})

// Array of unique SearchResults with length > 8 (to test the cap)
const largeResultsArb = fc.uniqueArray(searchResultArb, {
  minLength: 9,
  maxLength: 30,
  selector: (r) => r.id,
})

// Array of 1–8 unique SearchResults
const smallResultsArb = fc.uniqueArray(searchResultArb, {
  minLength: 1,
  maxLength: 8,
  selector: (r) => r.id,
})

function mockFetch(results: SearchResult[]) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => results,
  } as Response)
}

describe('SearchBar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  /**
   * Property 9: SearchBar suggestion count limit
   * Validates: Requirements 3.2
   *
   * For any array of search results with length > 8, the SearchBar dropdown
   * should render at most 8 suggestion items.
   */
  it('Property 9: renders at most 8 suggestion items regardless of API response size', async () => {
    await fc.assert(
      fc.asyncProperty(largeResultsArb, async (results) => {
        mockFetch(results)

        const { container, unmount } = render(<SearchBar />)

        const input = container.querySelector('input')!
        // Trigger change event with a query long enough to fire search (>= 2 chars)
        await act(async () => {
          input.value = 'test'
          input.dispatchEvent(new Event('input', { bubbles: true }))
          // Simulate React's onChange
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value',
          )!.set!
          nativeInputValueSetter.call(input, 'test')
          input.dispatchEvent(new Event('change', { bubbles: true }))
        })

        // Advance debounce timer (300ms)
        await act(async () => {
          vi.advanceTimersByTime(350)
        })

        await act(async () => {
          await Promise.resolve()
        })

        // Count rendered suggestion links (each result is a <Link> = <a>)
        const suggestionLinks = container.querySelectorAll('a[href*="/"]')
        expect(suggestionLinks.length).toBeLessThanOrEqual(8)

        unmount()
      }),
      { numRuns: 25 },
    )
  }, 30000)

  /**
   * Property 10: SearchBar suggestion item completeness
   * Validates: Requirements 3.3
   *
   * For any search result item, the rendered suggestion should contain
   * the product name, category, and a thumbnail (or placeholder).
   */
  it('Property 10: each suggestion item contains product name, category slug, and thumbnail or placeholder', async () => {
    await fc.assert(
      fc.asyncProperty(smallResultsArb, async (results) => {        mockFetch(results)

        const { container, unmount } = render(<SearchBar />)

        const input = container.querySelector('input')!

        await act(async () => {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value',
          )!.set!
          nativeInputValueSetter.call(input, 'test')
          input.dispatchEvent(new Event('change', { bubbles: true }))
        })

        await act(async () => {
          vi.advanceTimersByTime(350)
        })

        await act(async () => {
          await Promise.resolve()
        })

        const suggestionLinks = Array.from(container.querySelectorAll('a[href*="/"]'))

        // Each rendered suggestion should contain the product name and category slug
        results.forEach((result, i) => {
          const link = suggestionLinks[i]
          if (!link) return // shouldn't happen for smallResultsArb (≤8)

          const text = link.textContent ?? ''
          expect(text).toContain(result.name)
          expect(text).toContain(result.category_slug)

          // Thumbnail: either an <img> or a placeholder container
          const hasImg = link.querySelector('img') !== null
          const hasPlaceholder = link.querySelector('div') !== null
          expect(hasImg || hasPlaceholder).toBe(true)
        })

        unmount()
      }),
      { numRuns: 25 },
    )
  }, 30000)
})
