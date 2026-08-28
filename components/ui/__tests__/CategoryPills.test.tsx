// Feature: ui-redesign, Property 21: CategoryPills render icon and name for every category

/**
 * Property-based tests for CategoryPills
 * Validates: Requirements 4.2
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import * as fc from 'fast-check'
import { CategoryPills } from '../CategoryPills'
import type { Category } from '@/types'

vi.mock('next/link', () => ({ default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a> }))

const categoryArb: fc.Arbitrary<Category> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 40 }),
  slug: fc.stringMatching(/^[a-z0-9-]{1,30}$/),
  icon: fc.constantFrom('smartphone', 'laptop', 'headphones', 'unknown-icon'),
  description: fc.option(fc.string(), { nil: null }),
  spec_template: fc.constant({ fields: [] }),
  display_order: fc.integer({ min: 0, max: 100 }),
  created_at: fc.constant('2024-01-01T00:00:00Z'),
})

describe('CategoryPills', () => {
  /**
   * Property 21: CategoryPills render icon and name for every category
   * Validates: Requirements 4.2
   */
  it('Property 21: every category name appears in the rendered output', () => {
    fc.assert(
      fc.property(fc.array(categoryArb, { minLength: 1, maxLength: 8 }), (categories) => {
        const { container } = render(<CategoryPills categories={categories} />)
        const text = container.textContent ?? ''
        categories.forEach((cat) => {
          expect(text).toContain(cat.name)
        })
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 21b: number of rendered links equals number of categories
   * Validates: Requirements 4.2
   */
  it('Property 21b: number of rendered links equals number of categories', () => {
    fc.assert(
      fc.property(fc.array(categoryArb, { minLength: 1, maxLength: 8 }), (categories) => {
        const { container } = render(<CategoryPills categories={categories} />)
        expect(container.querySelectorAll('a').length).toBe(categories.length)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 21c: each link href is /{cat.slug}
   * Validates: Requirements 4.2
   */
  it('Property 21c: each link href is /{cat.slug}', () => {
    fc.assert(
      fc.property(fc.array(categoryArb, { minLength: 1, maxLength: 8 }), (categories) => {
        const { container } = render(<CategoryPills categories={categories} />)
        const anchors = Array.from(container.querySelectorAll('a'))
        anchors.forEach((anchor, i) => {
          expect(anchor.getAttribute('href')).toBe(`/${categories[i].slug}`)
        })
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 21d: active pill gets accent classes, inactive pills do not
   * Validates: Requirements 4.2
   */
  it('Property 21d: active pill gets accent classes, inactive pills do not', () => {
    // Use uniqueArray to ensure no two categories share the same slug
    const uniqueCategoriesArb = fc.uniqueArray(categoryArb, {
      minLength: 1,
      maxLength: 8,
      selector: (c) => c.slug,
    })
    fc.assert(
      fc.property(uniqueCategoriesArb, (categories) => {
        const activeSlug = categories[0].slug
        const { container } = render(
          <CategoryPills categories={categories} activeSlug={activeSlug} />
        )
        const anchors = Array.from(container.querySelectorAll('a'))

        expect(anchors[0].className).toContain('text-accent')

        if (categories.length > 1) {
          anchors.slice(1).forEach((anchor) => {
            expect(anchor.className).not.toContain('text-accent')
          })
        }
      }),
      { numRuns: 100 }
    )
  })
})
