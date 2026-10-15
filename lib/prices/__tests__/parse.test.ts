import { describe, it, expect } from 'vitest'
import { parsePrice, getPath } from '../parse'

describe('parsePrice', () => {
  it.each([
    ['₹1,29,999.00', 129999],
    ['Rs. 79,999', 79999],
    ['79999', 79999],
    ['₹1,299 – ₹1,499', 1299],
    [79999.4, 79999],
  ])('reads %s', (input, expected) => expect(parsePrice(input)).toBe(expected))

  it.each([['Price on request'], [''], [null], [undefined], [0], ['₹0']])('rejects %s', (input) =>
    expect(parsePrice(input as never)).toBeNull()
  )
})

describe('getPath', () => {
  it('reads dotted and indexed paths', () => {
    expect(getPath({ a: { b: [{ c: 5 }] } }, 'a.b[0].c')).toBe(5)
    expect(getPath({ a: 1 }, 'a.b.c')).toBeUndefined()
  })
})
