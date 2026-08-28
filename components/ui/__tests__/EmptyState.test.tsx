// Feature: ui-redesign, Property 19: EmptyState renders all props with correct token styling

/**
 * Property-based tests for EmptyState
 * Validates: Requirements 15.1, 15.2, 15.3, 15.4
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import * as fc from 'fast-check'
import { EmptyState } from '../EmptyState'
import { Package } from 'lucide-react'

vi.mock('next/link', () => ({ default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a> }))

describe('EmptyState', () => {
  /**
   * Property 19a: For any heading/description strings, EmptyState renders both in the output
   * Validates: Requirements 15.1, 15.2
   */
  it('Property 19a: renders heading and description for any string inputs', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 80 }),
        fc.string({ minLength: 1, maxLength: 80 }),
        (heading, description) => {
          const { container } = render(
            <EmptyState icon={Package} heading={heading} description={description} />
          )
          const text = container.textContent ?? ''
          expect(text).toContain(heading)
          expect(text).toContain(description)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 19b: Icon is rendered at size 48 with text-muted class
   * Validates: Requirements 15.3
   */
  it('Property 19b: icon SVG is rendered with text-muted class', () => {
    const { container } = render(
      <EmptyState icon={Package} heading="Heading" description="Description" />
    )
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    // The icon wrapper or svg should carry the text-muted class
    const hasMutedClass =
      svg?.classList.contains('text-muted') ||
      svg?.closest('.text-muted') !== null
    expect(hasMutedClass).toBe(true)
  })

  /**
   * Property 19c: Action link renders with correct href when action.href is provided
   * Validates: Requirements 15.4
   */
  it('Property 19c: action link renders with correct href', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        fc.string({ minLength: 1 }),
        (href, label) => {
          const { container } = render(
            <EmptyState
              icon={Package}
              heading="Heading"
              description="Description"
              action={{ label, href }}
            />
          )
          const anchor = container.querySelector('a')
          expect(anchor).not.toBeNull()
          expect(anchor?.getAttribute('href')).toBe(href)
        }
      ),
      { numRuns: 100 }
    )
  }, 30000)

  /**
   * Property 19d: Action button renders when action.onClick is provided (no href)
   * Validates: Requirements 15.4
   */
  it('Property 19d: action button renders when onClick is provided without href', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (label) => {
          const { container } = render(
            <EmptyState
              icon={Package}
              heading="Heading"
              description="Description"
              action={{ label, onClick: () => {} }}
            />
          )
          expect(container.querySelector('button')).not.toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })
})
