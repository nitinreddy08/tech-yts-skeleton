import type { ScraperConfig } from '../types'

/**
 * Frozen copies of store rules, used to test the extraction ENGINE's behaviour (fallbacks, failure
 * classification, health). They deliberately do not follow config/price-scrapers/*.json: when
 * prices:heal changes a live config, these tests must keep passing untouched. The live configs
 * are guarded by their own `samples` instead (see extract.test.ts).
 */
export const PINNED_AMAZON: ScraperConfig = {
  store: 'amazon',
  hosts: ['amazon.in'],
  strategies: [
    { type: 'jsonld' },
    { type: 'css', selectors: ['#corePrice_feature_div .a-price:not(.a-text-price) .a-offscreen', '#priceblock_ourprice'] },
  ],
  availability: {
    selectors: ['#availability', '#outOfStock'],
    outOfStockTexts: ['currently unavailable', 'out of stock'],
    lowStockTexts: ['only 1 left', 'only 2 left'],
  },
}

export const PINNED_FLIPKART: ScraperConfig = {
  store: 'flipkart',
  hosts: ['flipkart.com'],
  strategies: [
    { type: 'jsonld' },
    { type: 'regex', patterns: ['"finalPrice":\\{[^}]*?"value":(\\d+)'] },
  ],
}

export const PINNED_GENERIC: ScraperConfig = {
  store: 'generic',
  hosts: [],
  strategies: [
    { type: 'jsonld' },
    { type: 'meta', selectors: ['meta[property="product:price:amount"]', 'meta[property="og:price:amount"]', 'meta[itemprop="price"]'] },
  ],
}

export const PINNED = [PINNED_AMAZON, PINNED_FLIPKART, PINNED_GENERIC]
