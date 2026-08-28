/**
 * A freshly-cloned copy of the seed store for each test, so repository tests
 * can mutate freely without leaking state between cases or into the singleton.
 */
import {
  categories,
  brands,
  products,
  affiliateLinks,
  faqs,
  deals,
  bestOfLists,
  clickLogs,
  newsletterSubscribers,
} from '@/lib/mock/db'

export function makeStore() {
  return {
    categories: structuredClone(categories),
    brands: structuredClone(brands),
    products: structuredClone(products),
    affiliateLinks: structuredClone(affiliateLinks),
    faqs: structuredClone(faqs),
    deals: structuredClone(deals),
    bestOfLists: structuredClone(bestOfLists),
    clickLogs: structuredClone(clickLogs),
    newsletterSubscribers: structuredClone(newsletterSubscribers),
  }
}

export type TestStore = ReturnType<typeof makeStore>
