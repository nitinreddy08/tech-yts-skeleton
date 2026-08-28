'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { CompareBar } from '@/components/ui/CompareBar'
import type { ProductSummary } from '@/types'

const STORAGE_KEY = 'techreviews-compare'
const MAX_COMPARE = 4

type AddResult = { ok: true } | { ok: false; reason: string }

interface CompareContextValue {
  products: ProductSummary[]
  addProduct: (product: ProductSummary) => AddResult
  removeProduct: (id: string) => void
  clearAll: () => void
  isInCompare: (id: string) => boolean
  toggleProduct: (product: ProductSummary) => AddResult
  toast: string | null
  dismissToast: () => void
}

const CompareContext = createContext<CompareContextValue | null>(null)

function loadStored(): ProductSummary[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as ProductSummary[]
  } catch {
    return []
  }
}

function saveStored(products: ProductSummary[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}

function categoryLabel(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1)
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    setProducts(loadStored())
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const persist = useCallback((next: ProductSummary[]) => {
    setProducts(next)
    saveStored(next)
  }, [])

  const addProduct = useCallback(
    (product: ProductSummary): AddResult => {
      if (products.some((p) => p.id === product.id)) {
        return { ok: false, reason: 'Already in compare list' }
      }
      if (products.length >= MAX_COMPARE) {
        const msg = 'Compare list is full (max 4 products)'
        setToast(msg)
        return { ok: false, reason: msg }
      }
      if (products.length > 0 && products[0].category_slug !== product.category_slug) {
        const msg = `Compare only works within ${categoryLabel(products[0].category_slug)} — clear list to switch category`
        setToast(msg)
        return { ok: false, reason: msg }
      }
      persist([...products, product])
      return { ok: true }
    },
    [products, persist]
  )

  const removeProduct = useCallback(
    (id: string) => {
      persist(products.filter((p) => p.id !== id))
    },
    [products, persist]
  )

  const clearAll = useCallback(() => {
    persist([])
  }, [persist])

  const isInCompare = useCallback(
    (id: string) => products.some((p) => p.id === id),
    [products]
  )

  const toggleProduct = useCallback(
    (product: ProductSummary): AddResult => {
      if (isInCompare(product.id)) {
        removeProduct(product.id)
        return { ok: true }
      }
      return addProduct(product)
    },
    [isInCompare, removeProduct, addProduct]
  )

  const dismissToast = useCallback(() => setToast(null), [])

  const value = useMemo(
    () => ({
      products,
      addProduct,
      removeProduct,
      clearAll,
      isInCompare,
      toggleProduct,
      toast,
      dismissToast,
    }),
    [products, addProduct, removeProduct, clearAll, isInCompare, toggleProduct, toast, dismissToast]
  )

  return (
    <CompareContext.Provider value={value}>
      {children}
      {toast && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] max-w-sm mx-4 rounded-xl border border-border bg-primary px-4 py-3 text-sm text-white shadow-lg flex items-start gap-3"
        >
          <span className="flex-1">{toast}</span>
          <button type="button" onClick={dismissToast} className="text-white/70 hover:text-white shrink-0" aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
      <CompareBar
        products={products}
        onRemove={removeProduct}
        onClear={clearAll}
        maxProducts={MAX_COMPARE}
      />
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used within CompareProvider')
  return ctx
}

export function useCompareOptional() {
  return useContext(CompareContext)
}
