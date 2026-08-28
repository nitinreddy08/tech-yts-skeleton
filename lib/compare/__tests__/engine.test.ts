/**
 * Property-based tests for useComparisonEngine
 * Validates: Requirements 5.1
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import * as fc from 'fast-check'
import { useComparisonEngine } from '../engine'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

vi.stubGlobal('localStorage', localStorageMock)

beforeEach(() => {
  localStorageMock.clear()
})

describe('useComparisonEngine', () => {
  /**
   * Property 5: max-4 invariant
   * Validates: Requirements 5.1
   *
   * After any sequence of addProduct calls, productIds.length never exceeds 4
   * and contains no duplicates.
   */
  it('Property 5: productIds.length never exceeds 4 and has no duplicates after any addProduct sequence', () => {
    fc.assert(
      fc.property(
        fc.array(fc.uuid(), { minLength: 1, maxLength: 20 }),
        (ids) => {
          localStorageMock.clear()

          const { result } = renderHook(() => useComparisonEngine())

          act(() => {
            ids.forEach((id) => result.current.addProduct(id))
          })

          expect(result.current.productIds.length).toBeLessThanOrEqual(4)

          const unique = new Set(result.current.productIds)
          expect(unique.size).toBe(result.current.productIds.length)
        }
      )
    )
  })
})

/**
 * Property 8: state round-trip
 * Validates: Requirements 5.2
 *
 * Product IDs persisted to localStorage are restored identically on remount.
 */
describe('state round-trip', () => {
  it('Property 8: productIds restored from localStorage on remount match saved IDs', () => {
    fc.assert(
      fc.property(
        fc.array(fc.uuid(), { minLength: 1, maxLength: 4 }),
        (ids) => {
          localStorageMock.clear()

          // First mount: add all IDs
          const { result: first, unmount } = renderHook(() => useComparisonEngine())

          act(() => {
            ids.forEach((id) => first.current.addProduct(id))
          })

          const savedIds = [...first.current.productIds]
          unmount()

          // Second mount: should restore from localStorage
          const { result: second } = renderHook(() => useComparisonEngine())

          expect(second.current.productIds).toEqual(savedIds)
        }
      )
    )
  })
})
