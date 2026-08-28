'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'compare-products'
const MAX_PRODUCTS = 4

export function useComparisonEngine() {
  const [productIds, setProductIds] = useState<string[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setProductIds(parsed.slice(0, MAX_PRODUCTS))
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // Persist to localStorage whenever productIds changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds))
    } catch {
      // ignore
    }
  }, [productIds])

  const addProduct = useCallback((id: string) => {
    setProductIds((prev) => {
      if (prev.includes(id)) return prev
      if (prev.length >= MAX_PRODUCTS) return prev
      return [...prev, id]
    })
  }, [])

  const removeProduct = useCallback((id: string) => {
    setProductIds((prev) => prev.filter((p) => p !== id))
  }, [])

  const clearAll = useCallback(() => {
    setProductIds([])
  }, [])

  const isSelected = useCallback(
    (id: string) => productIds.includes(id),
    [productIds]
  )

  const isFull = productIds.length >= MAX_PRODUCTS

  return { productIds, addProduct, removeProduct, clearAll, isSelected, isFull }
}
