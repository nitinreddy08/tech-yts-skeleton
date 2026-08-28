import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { formatIndianPrice } from '../format'

describe('formatIndianPrice', () => {
  it('formats 129999 as ₹1,29,999', () => {
    expect(formatIndianPrice(129999)).toBe('₹1,29,999')
  })

  /**
   * Property 19: formatIndianPrice ₹ prefix
   * **Validates: Requirements 15.2**
   */
  it('always starts with ₹ for any non-negative integer', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0 }), (n) => {
        expect(formatIndianPrice(n).startsWith('₹')).toBe(true)
      })
    )
  })
})
