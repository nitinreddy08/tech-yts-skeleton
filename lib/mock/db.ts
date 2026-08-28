/**
 * lib/mock/db.ts
 *
 * Single-source-of-truth in-memory store for all mock data.
 * Imported directly by server-side code (Server Components, Server Actions,
 * Route Handlers) so they never need a network round-trip.
 *
 * The same data is also served via /api/mock/* route handlers so that
 * client-side code (and MSW browser handlers) can access it over HTTP.
 */

import type {
  Category,
  Brand,
  ProductDetail,
  Deal,
  BestOfList,
  BestOfListItem,
  AffiliateLink,
  FAQ,
  ClickLog,
  NewsletterSubscriber,
} from '@/types'
import { isDealLive } from '@/lib/schemas'

// ─── Categories ──────────────────────────────────────────────────────────────

export const categories: Category[] = [
  {
    id: 'cat-smartphones',
    name: 'Smartphones',
    slug: 'smartphones',
    icon: '📱',
    description: 'Latest smartphones reviewed by our team',
    spec_template: {
      fields: [
        { key: 'display', label: 'Display', type: 'text', group: 'Display' },
        { key: 'processor', label: 'Processor', type: 'text', group: 'Performance' },
        { key: 'ram', label: 'RAM (GB)', type: 'number', unit: 'GB', group: 'Performance' },
        { key: 'storage', label: 'Storage (GB)', type: 'number', unit: 'GB', group: 'Performance' },
        { key: 'battery', label: 'Battery (mAh)', type: 'number', unit: 'mAh', group: 'Battery' },
        { key: 'camera', label: 'Main Camera (MP)', type: 'number', unit: 'MP', group: 'Camera' },
        { key: 'os', label: 'Operating System', type: 'text', group: 'Software' },
        { key: '5g', label: '5G Support', type: 'boolean', group: 'Software' },
      ],
    },
    display_order: 1,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-laptops',
    name: 'Laptops',
    slug: 'laptops',
    icon: '💻',
    description: 'Laptops for every budget and use case',
    spec_template: {
      fields: [
        { key: 'display', label: 'Display', type: 'text' },
        { key: 'processor', label: 'Processor', type: 'text' },
        { key: 'ram', label: 'RAM (GB)', type: 'number', unit: 'GB' },
        { key: 'storage', label: 'Storage (GB)', type: 'number', unit: 'GB' },
        { key: 'battery_life', label: 'Battery Life (hrs)', type: 'number', unit: 'hrs' },
        { key: 'weight', label: 'Weight (kg)', type: 'number', unit: 'kg' },
        { key: 'os', label: 'Operating System', type: 'text' },
      ],
    },
    display_order: 2,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-headphones',
    name: 'Headphones',
    slug: 'headphones',
    icon: '🎧',
    description: 'Wireless and wired headphones for audiophiles',
    spec_template: {
      fields: [
        { key: 'type', label: 'Type', type: 'select', options: ['Over-Ear', 'On-Ear', 'In-Ear'] },
        { key: 'connectivity', label: 'Connectivity', type: 'select', options: ['Wired', 'Wireless', 'Both'] },
        { key: 'anc', label: 'Active Noise Cancellation', type: 'boolean' },
        { key: 'battery', label: 'Battery Life (hrs)', type: 'number', unit: 'hrs' },
        { key: 'driver_size', label: 'Driver Size (mm)', type: 'number', unit: 'mm' },
      ],
    },
    display_order: 3,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-tablets',
    name: 'Tablets',
    slug: 'tablets',
    icon: '📟',
    description: 'Tablets for work, study, and entertainment',
    spec_template: {
      fields: [
        { key: 'display', label: 'Display', type: 'text' },
        { key: 'processor', label: 'Processor', type: 'text' },
        { key: 'ram', label: 'RAM (GB)', type: 'number', unit: 'GB' },
        { key: 'storage', label: 'Storage (GB)', type: 'number', unit: 'GB' },
        { key: 'battery', label: 'Battery (mAh)', type: 'number', unit: 'mAh' },
        { key: 'stylus', label: 'Stylus Support', type: 'boolean' },
      ],
    },
    display_order: 4,
    created_at: '2026-01-01T00:00:00Z',
  },
]

// ─── Brands ───────────────────────────────────────────────────────────────────

export const brands: Brand[] = [
  { id: 'brand-samsung', name: 'Samsung', slug: 'samsung', logo_url: null },
  { id: 'brand-apple', name: 'Apple', slug: 'apple', logo_url: null },
  { id: 'brand-oneplus', name: 'OnePlus', slug: 'oneplus', logo_url: null },
  { id: 'brand-xiaomi', name: 'Xiaomi', slug: 'xiaomi', logo_url: null },
  { id: 'brand-sony', name: 'Sony', slug: 'sony', logo_url: null },
  { id: 'brand-dell', name: 'Dell', slug: 'dell', logo_url: null },
  { id: 'brand-asus', name: 'Asus', slug: 'asus', logo_url: null },
  { id: 'brand-bose', name: 'Bose', slug: 'bose', logo_url: null },
]

// ─── Affiliate Links (keyed by product id) ────────────────────────────────────

export const affiliateLinks: AffiliateLink[] = [
  {
    id: 'al-s25-amazon',
    product_id: 'prod-samsung-s25',
    store_name: 'Amazon',
    store_icon: null,
    affiliate_url: 'https://amazon.in/dp/mock-s25',
    price_inr: 79999,
    is_best_price: true,
    last_updated: '2026-08-01T00:00:00Z',
    stock_status: 'in_stock',
  },
  {
    id: 'al-s25-flipkart',
    product_id: 'prod-samsung-s25',
    store_name: 'Flipkart',
    store_icon: null,
    affiliate_url: 'https://flipkart.com/mock-s25',
    price_inr: 82999,
    is_best_price: false,
    last_updated: '2026-08-01T00:00:00Z',
    stock_status: 'low_stock',
  },
  {
    id: 'al-ip16-amazon',
    product_id: 'prod-iphone-16',
    store_name: 'Amazon',
    store_icon: null,
    affiliate_url: 'https://amazon.in/dp/mock-ip16',
    price_inr: 89999,
    is_best_price: false,
    last_updated: '2026-08-01T00:00:00Z',
    stock_status: 'out_of_stock',
  },
  {
    id: 'al-ip16-apple',
    product_id: 'prod-iphone-16',
    store_name: 'Apple Store',
    store_icon: null,
    affiliate_url: 'https://apple.com/in/mock-ip16',
    price_inr: 87900,
    is_best_price: true,
    last_updated: '2026-08-01T00:00:00Z',
    stock_status: 'in_stock',
  },
  {
    id: 'al-op13-amazon',
    product_id: 'prod-oneplus-13',
    store_name: 'Amazon',
    store_icon: null,
    affiliate_url: 'https://amazon.in/dp/mock-op13',
    price_inr: 69999,
    is_best_price: true,
    last_updated: '2026-08-01T00:00:00Z',
    stock_status: 'in_stock',
  },
  {
    id: 'al-rn14-flipkart',
    product_id: 'prod-redmi-note-14',
    store_name: 'Flipkart',
    store_icon: null,
    affiliate_url: 'https://flipkart.com/mock-rn14',
    price_inr: 18999,
    is_best_price: true,
    last_updated: '2026-08-01T00:00:00Z',
    stock_status: 'in_stock',
  },
  {
    id: 'al-wh1000-amazon',
    product_id: 'prod-sony-wh1000xm6',
    store_name: 'Amazon',
    store_icon: null,
    affiliate_url: 'https://amazon.in/dp/mock-wh1000',
    price_inr: 26990,
    is_best_price: true,
    last_updated: '2026-08-01T00:00:00Z',
    stock_status: 'low_stock',
  },
  {
    id: 'al-mba-amazon',
    product_id: 'prod-macbook-air-m3',
    store_name: 'Amazon',
    store_icon: null,
    affiliate_url: 'https://amazon.in/dp/mock-mba',
    price_inr: 114900,
    is_best_price: false,
    last_updated: '2026-08-01T00:00:00Z',
    stock_status: 'in_stock',
  },
  {
    id: 'al-mba-apple',
    product_id: 'prod-macbook-air-m3',
    store_name: 'Apple Store',
    store_icon: null,
    affiliate_url: 'https://apple.com/in/mock-mba',
    price_inr: 112900,
    is_best_price: true,
    last_updated: '2026-08-01T00:00:00Z',
    stock_status: 'in_stock',
  },
  {
    id: 'al-ipad-amazon',
    product_id: 'prod-ipad-air-m2',
    store_name: 'Amazon',
    store_icon: null,
    affiliate_url: 'https://amazon.in/dp/mock-ipad',
    price_inr: 59900,
    is_best_price: true,
    last_updated: '2026-08-01T00:00:00Z',
    stock_status: 'in_stock',
  },
]

// ─── FAQs (keyed by product id) ───────────────────────────────────────────────

export const faqs: FAQ[] = [
  {
    id: 'faq-s25-1',
    product_id: 'prod-samsung-s25',
    question: 'Does the Samsung Galaxy S25 support 5G?',
    answer: 'Yes, the Samsung Galaxy S25 supports both Sub-6GHz and mmWave 5G networks.',
    display_order: 0,
  },
  {
    id: 'faq-s25-2',
    product_id: 'prod-samsung-s25',
    question: 'What is the battery life like?',
    answer: 'The 4000mAh battery easily lasts a full day with moderate use, and the 45W fast charging fills it up in about 65 minutes.',
    display_order: 1,
  },
  {
    id: 'faq-ip16-1',
    product_id: 'prod-iphone-16',
    question: 'Does iPhone 16 have USB-C?',
    answer: 'Yes, iPhone 16 ships with USB-C and supports USB 3 speeds, a big improvement over earlier Lightning models.',
    display_order: 0,
  },
  {
    id: 'faq-ip16-2',
    product_id: 'prod-iphone-16',
    question: 'Is it worth upgrading from iPhone 14?',
    answer: 'If you care about the Camera Control button, improved AI features (Apple Intelligence), and a faster chip, yes — the upgrade is worth it.',
    display_order: 1,
  },
  {
    id: 'faq-op13-1',
    product_id: 'prod-oneplus-13',
    question: 'How fast is OnePlus 13 charging?',
    answer: 'OnePlus 13 supports 100W wired SUPERVOOC charging and 50W wireless, going 0-100% in under 36 minutes wired.',
    display_order: 0,
  },
  {
    id: 'faq-wh1000-1',
    product_id: 'prod-sony-wh1000xm6',
    question: 'How good is the ANC on WH-1000XM6?',
    answer: 'Industry-leading. Sony\'s sixth-gen QN3 chip powers adaptive ANC that adjusts in real time to ambient noise — excellent for flights and offices.',
    display_order: 0,
  },
  {
    id: 'faq-mba-1',
    product_id: 'prod-macbook-air-m3',
    question: 'Can the MacBook Air M3 run multiple external monitors?',
    answer: 'Yes, unlike M2, the M3 MacBook Air can drive two external displays simultaneously (with the lid closed for one of them).',
    display_order: 0,
  },
]

// ─── Products ─────────────────────────────────────────────────────────────────

export const products: ProductDetail[] = [
  {
    id: 'prod-samsung-s25',
    name: 'Samsung Galaxy S25',
    slug: 'samsung-galaxy-s25',
    category_id: 'cat-smartphones',
    category_slug: 'smartphones',
    brand_id: 'brand-samsung',
    brand_name: 'Samsung',
    tagline: 'The Galaxy you\'ve been waiting for',
    description: 'Samsung Galaxy S25 packs Snapdragon 8 Elite, a refined triple-camera system, and Galaxy AI features — all in a thinner, lighter body.',
    specifications: {
      display: '6.2" Dynamic AMOLED 2X, 120Hz',
      processor: 'Snapdragon 8 Elite',
      ram: 12,
      storage: 256,
      battery: 4000,
      camera: 50,
      os: 'Android 15 / One UI 7',
      '5g': true,
    },
    pros: ['Excellent Snapdragon 8 Elite performance', 'Refined camera with AI enhancements', 'Compact and lightweight design', 'Seven years of OS updates'],
    cons: ['No zoom improvement over S24', 'No expandable storage', '4000mAh battery on the smaller side'],
    creator_rating: 8.7,
    youtube_video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtube_short_url: null,
    thumbnail_url: '/products/samsung-galaxy-s25.svg',
    gallery_images: [],
    launch_price_inr: 84999,
    current_price_inr: 79999,
    is_featured: true,
    is_deal_of_the_day: false,
    deal_badge_text: null,
    is_published: true,
    tags: ['flagship', '5g', 'snapdragon', 'android'],
    benchmarks: { antutu: 2100000, geekbench_single: 3400, geekbench_multi: 9200 },
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
    affiliate_links: affiliateLinks.filter(l => l.product_id === 'prod-samsung-s25'),
    faqs: faqs.filter(f => f.product_id === 'prod-samsung-s25'),
    category: categories.find(c => c.id === 'cat-smartphones')!,
    brand: brands.find(b => b.id === 'brand-samsung')!,
  },
  {
    id: 'prod-iphone-16',
    name: 'Apple iPhone 16',
    slug: 'apple-iphone-16',
    category_id: 'cat-smartphones',
    category_slug: 'smartphones',
    brand_id: 'brand-apple',
    brand_name: 'Apple',
    tagline: 'Built for Apple Intelligence',
    description: 'iPhone 16 introduces the Camera Control button, Apple Intelligence AI features, and A18 chip — the most capable iPhone for everyday users.',
    specifications: {
      display: '6.1" Super Retina XDR OLED, 60Hz',
      processor: 'Apple A18',
      ram: 8,
      storage: 128,
      battery: 3561,
      camera: 48,
      os: 'iOS 18',
      '5g': true,
    },
    pros: ['Apple Intelligence AI features', 'Camera Control hardware button', 'Excellent A18 performance', 'USB-C with USB 3 speeds'],
    cons: ['Base model still 60Hz display', 'Expensive for 128GB base storage', 'No significant design change'],
    creator_rating: 8.5,
    youtube_video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtube_short_url: null,
    thumbnail_url: '/products/apple-iphone-16.svg',
    gallery_images: [],
    launch_price_inr: 87900,
    current_price_inr: 87900,
    is_featured: true,
    is_deal_of_the_day: false,
    deal_badge_text: null,
    is_published: true,
    tags: ['flagship', '5g', 'ios', 'apple-intelligence'],
    benchmarks: { antutu: 1850000, geekbench_single: 3800, geekbench_multi: 9800 },
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
    affiliate_links: affiliateLinks.filter(l => l.product_id === 'prod-iphone-16'),
    faqs: faqs.filter(f => f.product_id === 'prod-iphone-16'),
    category: categories.find(c => c.id === 'cat-smartphones')!,
    brand: brands.find(b => b.id === 'brand-apple')!,
  },
  {
    id: 'prod-oneplus-13',
    name: 'OnePlus 13',
    slug: 'oneplus-13',
    category_id: 'cat-smartphones',
    category_slug: 'smartphones',
    brand_id: 'brand-oneplus',
    brand_name: 'OnePlus',
    tagline: 'Never Settle — at a flagship price',
    description: 'OnePlus 13 comes with Snapdragon 8 Elite, a massive 6000mAh battery, 100W SuperVOOC charging, and Hasselblad-tuned cameras.',
    specifications: {
      display: '6.82" LTPO AMOLED, 1-120Hz',
      processor: 'Snapdragon 8 Elite',
      ram: 12,
      storage: 256,
      battery: 6000,
      camera: 50,
      os: 'OxygenOS 15',
      '5g': true,
    },
    pros: ['6000mAh massive battery', '100W fast charging', 'Smooth 120Hz LTPO display', 'Great value for specs'],
    cons: ['OxygenOS has become closer to ColorOS', 'No wireless charging on base variant', 'Bulky due to large battery'],
    creator_rating: 8.8,
    youtube_video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtube_short_url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    thumbnail_url: '/products/oneplus-13.svg',
    gallery_images: [],
    launch_price_inr: 69999,
    current_price_inr: 69999,
    is_featured: true,
    is_deal_of_the_day: true,
    deal_badge_text: '🔥 Deal of the Day',
    is_published: true,
    tags: ['flagship', '5g', 'snapdragon', 'fast-charging'],
    benchmarks: { antutu: 2250000, geekbench_single: 3500, geekbench_multi: 9400 },
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
    affiliate_links: affiliateLinks.filter(l => l.product_id === 'prod-oneplus-13'),
    faqs: faqs.filter(f => f.product_id === 'prod-oneplus-13'),
    category: categories.find(c => c.id === 'cat-smartphones')!,
    brand: brands.find(b => b.id === 'brand-oneplus')!,
  },
  {
    id: 'prod-redmi-note-14',
    name: 'Redmi Note 14 Pro',
    slug: 'redmi-note-14-pro',
    category_id: 'cat-smartphones',
    category_slug: 'smartphones',
    brand_id: 'brand-xiaomi',
    brand_name: 'Xiaomi',
    tagline: 'Pro features at a mid-range price',
    description: 'The Redmi Note 14 Pro brings a 200MP camera, 67W fast charging, and a crisp AMOLED display to the budget segment.',
    specifications: {
      display: '6.67" AMOLED, 120Hz',
      processor: 'Dimensity 7200-Ultra',
      ram: 8,
      storage: 128,
      battery: 5110,
      camera: 200,
      os: 'MIUI 14 / HyperOS',
      '5g': true,
    },
    pros: ['200MP main camera', 'Bright AMOLED display', '67W fast charging', 'Under ₹20,000'],
    cons: ['Dimensity 7200 shows limits in gaming', 'Bloatware from MIUI', 'Average ultrawide camera'],
    creator_rating: 7.8,
    youtube_video_url: null,
    youtube_short_url: null,
    thumbnail_url: '/products/redmi-note-14-pro.svg',
    gallery_images: [],
    launch_price_inr: 19999,
    current_price_inr: 18999,
    is_featured: false,
    is_deal_of_the_day: false,
    deal_badge_text: null,
    is_published: true,
    tags: ['mid-range', '5g', '200mp', 'budget'],
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
    affiliate_links: affiliateLinks.filter(l => l.product_id === 'prod-redmi-note-14'),
    faqs: [],
    category: categories.find(c => c.id === 'cat-smartphones')!,
    brand: brands.find(b => b.id === 'brand-xiaomi')!,
  },
  {
    id: 'prod-sony-wh1000xm6',
    name: 'Sony WH-1000XM6',
    slug: 'sony-wh-1000xm6',
    category_id: 'cat-headphones',
    category_slug: 'headphones',
    brand_id: 'brand-sony',
    brand_name: 'Sony',
    tagline: 'Still the king of ANC',
    description: 'Sony\'s WH-1000XM6 headphones offer best-in-class noise cancellation, 30-hour battery, and new foldable design.',
    specifications: {
      type: 'Over-Ear',
      connectivity: 'Wireless',
      anc: true,
      battery: 30,
      driver_size: 40,
    },
    pros: ['Best-in-class ANC', '30-hour battery', 'Comfortable for long sessions', 'Excellent sound quality'],
    cons: ['Expensive', 'Touch controls can be finnicky', 'New design loses carrying case quality'],
    creator_rating: 9.0,
    youtube_video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtube_short_url: null,
    thumbnail_url: '/products/sony-wh-1000xm6.svg',
    gallery_images: [],
    launch_price_inr: 29990,
    current_price_inr: 26990,
    is_featured: true,
    is_deal_of_the_day: false,
    deal_badge_text: null,
    is_published: true,
    tags: ['anc', 'wireless', 'premium', 'over-ear'],
    created_at: '2026-05-15T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
    affiliate_links: affiliateLinks.filter(l => l.product_id === 'prod-sony-wh1000xm6'),
    faqs: faqs.filter(f => f.product_id === 'prod-sony-wh1000xm6'),
    category: categories.find(c => c.id === 'cat-headphones')!,
    brand: brands.find(b => b.id === 'brand-sony')!,
  },
  {
    id: 'prod-macbook-air-m3',
    name: 'MacBook Air M3',
    slug: 'macbook-air-m3',
    category_id: 'cat-laptops',
    category_slug: 'laptops',
    brand_id: 'brand-apple',
    brand_name: 'Apple',
    tagline: 'Impossibly thin. Incredibly powerful.',
    description: 'MacBook Air M3 is the best laptop for most people — fanless, featherlight, with 18-hour battery life and dual-display support.',
    specifications: {
      display: '13.6" Liquid Retina, 500 nits',
      processor: 'Apple M3',
      ram: 8,
      storage: 256,
      battery_life: 18,
      weight: 1.24,
      os: 'macOS Sonoma',
    },
    pros: ['18-hour battery life', 'Fanless silent operation', 'Dual external display support', 'Excellent build quality'],
    cons: ['Base 8GB RAM gets tight with heavy loads', '256GB base storage fills up fast', 'No SD card slot'],
    creator_rating: 9.2,
    youtube_video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtube_short_url: null,
    thumbnail_url: '/products/macbook-air-m3.svg',
    gallery_images: [],
    launch_price_inr: 114900,
    current_price_inr: 112900,
    is_featured: true,
    is_deal_of_the_day: false,
    deal_badge_text: null,
    is_published: true,
    tags: ['laptop', 'macos', 'm3', 'ultrabook'],
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
    affiliate_links: affiliateLinks.filter(l => l.product_id === 'prod-macbook-air-m3'),
    faqs: faqs.filter(f => f.product_id === 'prod-macbook-air-m3'),
    category: categories.find(c => c.id === 'cat-laptops')!,
    brand: brands.find(b => b.id === 'brand-apple')!,
  },
  {
    id: 'prod-ipad-air-m2',
    name: 'Apple iPad Air M2',
    slug: 'apple-ipad-air-m2',
    category_id: 'cat-tablets',
    category_slug: 'tablets',
    brand_id: 'brand-apple',
    brand_name: 'Apple',
    tagline: 'Supercharged by M2',
    description: 'iPad Air with M2 chip now comes in 11" and 13" sizes with Apple Pencil Pro support and landscape front camera.',
    specifications: {
      display: '11" Liquid Retina, 500 nits',
      processor: 'Apple M2',
      ram: 8,
      storage: 128,
      battery: 7606,
      stylus: true,
    },
    pros: ['M2 chip handles any creative task', 'Beautiful Liquid Retina display', 'Apple Pencil Pro support', 'Landscape front camera'],
    cons: ['No ProMotion 120Hz', 'iPadOS multitasking still limited', 'No Thunderbolt port'],
    creator_rating: 8.6,
    youtube_video_url: null,
    youtube_short_url: null,
    thumbnail_url: '/products/apple-ipad-air-m2.svg',
    gallery_images: [],
    launch_price_inr: 59900,
    current_price_inr: 59900,
    is_featured: false,
    is_deal_of_the_day: false,
    deal_badge_text: null,
    is_published: true,
    tags: ['tablet', 'ipad', 'm2', 'apple-pencil'],
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
    affiliate_links: affiliateLinks.filter(l => l.product_id === 'prod-ipad-air-m2'),
    faqs: [],
    category: categories.find(c => c.id === 'cat-tablets')!,
    brand: brands.find(b => b.id === 'brand-apple')!,
  },
  {
    id: 'prod-asus-rog-phone-8',
    name: 'Asus ROG Phone 8',
    slug: 'asus-rog-phone-8',
    category_id: 'cat-smartphones',
    category_slug: 'smartphones',
    brand_id: 'brand-asus',
    brand_name: 'Asus',
    tagline: 'Born to dominate mobile gaming',
    description: 'ROG Phone 8 is the ultimate gaming smartphone with Snapdragon 8 Gen 3, 165Hz display, AirTrigger buttons, and advanced cooling.',
    specifications: {
      display: '6.78" AMOLED, 165Hz',
      processor: 'Snapdragon 8 Gen 3',
      ram: 16,
      storage: 256,
      battery: 5500,
      camera: 50,
      os: 'Android 14 / ROG UI',
      '5g': true,
    },
    pros: ['165Hz buttery gaming display', 'AirTrigger shoulder buttons', 'Excellent thermal management', '16GB RAM is plenty for gaming'],
    cons: ['Large and heavy', 'Not for casual users', 'Camera underwhelms vs. camera flagships'],
    creator_rating: 8.3,
    youtube_video_url: null,
    youtube_short_url: null,
    thumbnail_url: '/products/asus-rog-phone-8.svg',
    gallery_images: [],
    launch_price_inr: 89999,
    current_price_inr: 84999,
    is_featured: false,
    is_deal_of_the_day: false,
    deal_badge_text: null,
    is_published: true,
    tags: ['gaming', 'snapdragon', '5g', 'flagship'],
    created_at: '2026-06-15T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
    affiliate_links: [],
    faqs: [],
    category: categories.find(c => c.id === 'cat-smartphones')!,
    brand: brands.find(b => b.id === 'brand-asus')!,
  },
]

// ─── Deals ────────────────────────────────────────────────────────────────────

function productSummaryFromDetail(p: ProductDetail) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category_id: p.category_id,
    category_slug: p.category_slug,
    brand_id: p.brand_id,
    brand_name: p.brand_name,
    thumbnail_url: p.thumbnail_url,
    creator_rating: p.creator_rating,
    current_price_inr: p.current_price_inr,
    launch_price_inr: p.launch_price_inr,
    is_featured: p.is_featured,
    is_deal_of_the_day: p.is_deal_of_the_day,
    deal_badge_text: p.deal_badge_text,
    tags: p.tags,
    youtube_video_url: p.youtube_video_url,
    created_at: p.created_at,
  }
}

/**
 * Deal timestamps are computed relative to module-load time rather than
 * hardcoded absolute dates. A seeded "Deal of the Day" with a fixed
 * `expires_at` silently goes stale the moment real time passes it — this demo
 * data should always look freshly authored, on any day the app is run.
 */
const seedNow = Date.now()
const hoursFromSeed = (h: number): string => new Date(seedNow + h * 3600_000).toISOString()

export const deals: Deal[] = [
  {
    id: 'deal-op13-dotd',
    product_id: 'prod-oneplus-13',
    deal_type: 'deal_of_day',
    headline: '🔥 OnePlus 13 — Deal of the Day! Save ₹5,000',
    original_price_inr: 74999,
    deal_price_inr: 69999,
    store_name: 'Amazon',
    affiliate_url: 'https://amazon.in/dp/mock-op13',
    starts_at: hoursFromSeed(-6),
    expires_at: hoursFromSeed(18),
    is_active: true,
    created_at: hoursFromSeed(-6),
    product: productSummaryFromDetail(products.find(p => p.id === 'prod-oneplus-13')!),
  },
  {
    id: 'deal-wh1000-drop',
    product_id: 'prod-sony-wh1000xm6',
    deal_type: 'price_drop',
    headline: 'Sony WH-1000XM6 — ₹3,000 Price Drop on Amazon',
    original_price_inr: 29990,
    deal_price_inr: 26990,
    store_name: 'Amazon',
    affiliate_url: 'https://amazon.in/dp/mock-wh1000',
    starts_at: hoursFromSeed(-48),
    expires_at: hoursFromSeed(24 * 7),
    is_active: true,
    created_at: hoursFromSeed(-72),
    product: productSummaryFromDetail(products.find(p => p.id === 'prod-sony-wh1000xm6')!),
  },
  {
    id: 'deal-rn14-bank',
    product_id: 'prod-redmi-note-14',
    deal_type: 'bank_offer',
    headline: 'Extra 10% off Redmi Note 14 Pro with HDFC Bank cards',
    original_price_inr: 19999,
    deal_price_inr: 17999,
    store_name: 'Flipkart',
    affiliate_url: 'https://flipkart.com/mock-rn14',
    starts_at: hoursFromSeed(-48),
    expires_at: hoursFromSeed(24 * 10),
    is_active: true,
    created_at: hoursFromSeed(-48),
    product: productSummaryFromDetail(products.find(p => p.id === 'prod-redmi-note-14')!),
  },
  {
    id: 'deal-s25-bank',
    product_id: 'prod-samsung-s25',
    deal_type: 'bank_offer',
    headline: '₹4,000 instant discount on Galaxy S25 with ICICI credit cards',
    original_price_inr: 79999,
    deal_price_inr: 75999,
    store_name: 'Samsung',
    affiliate_url: 'https://samsung.com/in/mock-s25',
    starts_at: hoursFromSeed(-24),
    expires_at: hoursFromSeed(24 * 25),
    is_active: true,
    created_at: hoursFromSeed(-24),
    product: productSummaryFromDetail(products.find(p => p.id === 'prod-samsung-s25')!),
  },
]

// ─── Best-Of Lists ────────────────────────────────────────────────────────────

export const bestOfLists: BestOfList[] = [
  {
    id: 'bol-best-phones-2026',
    title: 'Best Smartphones of 2026',
    slug: 'best-smartphones-2026',
    description: 'Our team has reviewed dozens of phones this year. Here are the best ones for every budget — from budget beasts to camera kings.',
    cover_image_url: null,
    is_published: true,
    display_order: 1,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
    items: [
      {
        id: 'boli-op13',
        list_id: 'bol-best-phones-2026',
        product_id: 'prod-oneplus-13',
        product: productSummaryFromDetail(products.find(p => p.id === 'prod-oneplus-13')!),
        rank: 1,
        pick_reason: 'Best overall value — massive battery, 100W charging, Snapdragon 8 Elite.',
      },
      {
        id: 'boli-s25',
        list_id: 'bol-best-phones-2026',
        product_id: 'prod-samsung-s25',
        product: productSummaryFromDetail(products.find(p => p.id === 'prod-samsung-s25')!),
        rank: 2,
        pick_reason: 'Best Android flagship — Galaxy AI, compact design, seven years of updates.',
      },
      {
        id: 'boli-ip16',
        list_id: 'bol-best-phones-2026',
        product_id: 'prod-iphone-16',
        product: productSummaryFromDetail(products.find(p => p.id === 'prod-iphone-16')!),
        rank: 3,
        pick_reason: 'Best for iOS users — Apple Intelligence, Camera Control, USB-C.',
      },
      {
        id: 'boli-rn14',
        list_id: 'bol-best-phones-2026',
        product_id: 'prod-redmi-note-14',
        product: productSummaryFromDetail(products.find(p => p.id === 'prod-redmi-note-14')!),
        rank: 4,
        pick_reason: 'Best under ₹20,000 — 200MP camera and AMOLED at a steal.',
      },
    ] as BestOfListItem[],
  },
  {
    id: 'bol-best-wireless-headphones',
    title: 'Best Wireless Headphones 2026',
    slug: 'best-wireless-headphones-2026',
    description: 'Cut the cord without losing quality. These are the best wireless headphones we\'ve tested in 2026.',
    cover_image_url: null,
    is_published: true,
    display_order: 2,
    created_at: '2026-08-05T00:00:00Z',
    updated_at: '2026-08-05T00:00:00Z',
    items: [
      {
        id: 'boli-wh1000',
        list_id: 'bol-best-wireless-headphones',
        product_id: 'prod-sony-wh1000xm6',
        product: productSummaryFromDetail(products.find(p => p.id === 'prod-sony-wh1000xm6')!),
        rank: 1,
        pick_reason: 'Still the ANC king with best-in-class sound and comfort.',
      },
    ] as BestOfListItem[],
  },
]

// ─── Click logs (append-only) ─────────────────────────────────────────────────

export const clickLogs: ClickLog[] = [
  { id: 'cl-seed-1', affiliate_link_id: 'al-s25-amazon', product_id: 'prod-samsung-s25', store_name: 'Amazon', clicked_at: '2026-08-22T14:00:00Z', user_agent: null, referrer: null, ip_hash: null },
  { id: 'cl-seed-2', affiliate_link_id: 'al-s25-amazon', product_id: 'prod-samsung-s25', store_name: 'Amazon', clicked_at: '2026-08-22T16:30:00Z', user_agent: null, referrer: null, ip_hash: null },
  { id: 'cl-seed-3', affiliate_link_id: 'al-s25-amazon', product_id: 'prod-samsung-s25', store_name: 'Amazon', clicked_at: '2026-08-23T09:00:00Z', user_agent: null, referrer: null, ip_hash: null },
  { id: 'cl-seed-4', affiliate_link_id: 'al-ip16-apple', product_id: 'prod-iphone-16', store_name: 'Apple Store', clicked_at: '2026-08-23T08:00:00Z', user_agent: null, referrer: null, ip_hash: null },
  { id: 'cl-seed-5', affiliate_link_id: 'al-ip16-apple', product_id: 'prod-iphone-16', store_name: 'Apple Store', clicked_at: '2026-08-23T10:00:00Z', user_agent: null, referrer: null, ip_hash: null },
  { id: 'cl-seed-6', affiliate_link_id: 'al-op13-amazon', product_id: 'prod-oneplus-13', store_name: 'Amazon', clicked_at: '2026-08-21T12:00:00Z', user_agent: null, referrer: null, ip_hash: null },
  { id: 'cl-seed-7', affiliate_link_id: 'al-wh1000-amazon', product_id: 'prod-sony-wh1000xm6', store_name: 'Amazon', clicked_at: '2026-08-22T18:00:00Z', user_agent: null, referrer: null, ip_hash: null },
  { id: 'cl-seed-8', affiliate_link_id: 'al-wh1000-amazon', product_id: 'prod-sony-wh1000xm6', store_name: 'Amazon', clicked_at: '2026-08-23T07:00:00Z', user_agent: null, referrer: null, ip_hash: null },
  { id: 'cl-seed-9', affiliate_link_id: 'al-mba-apple', product_id: 'prod-macbook-air-m3', store_name: 'Apple Store', clicked_at: '2026-08-20T11:00:00Z', user_agent: null, referrer: null, ip_hash: null },
]

// ─── Newsletter subscribers ────────────────────────────────────────────────────

export const newsletterSubscribers: NewsletterSubscriber[] = [
  { id: 'sub-seed-1', email: 'rahul.sharma@gmail.com', subscribed_at: '2026-08-01T10:00:00Z' },
  { id: 'sub-seed-2', email: 'priya@outlook.com', subscribed_at: '2026-08-15T14:30:00Z' },
  { id: 'sub-seed-3', email: 'techdeals@yahoo.in', subscribed_at: '2026-08-20T09:15:00Z' },
]

// ─── Mutable store & helpers ──────────────────────────────────────────────────

/** Mutable copies so Server Actions can mutate them at runtime */
export const db = {
  categories: [...categories],
  brands: [...brands],
  products: [...products],
  affiliateLinks: [...affiliateLinks],
  faqs: [...faqs],
  deals: [...deals],
  bestOfLists: [...bestOfLists],
  clickLogs: [...clickLogs],
  newsletterSubscribers: [...newsletterSubscribers],
}

/** Simple UUID generator (no external dep needed) */
export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

/** Look up affiliate link by id, searching all links in db */
export function findAffiliateLinkById(id: string): AffiliateLink | undefined {
  return db.affiliateLinks.find(l => l.id === id)
}

/**
 * Look up a deal by id, but only if it's currently live. Uses the same
 * derived-status predicate the rest of the app uses for "is this deal
 * active" (is_active AND within its starts_at/expires_at window) — not just
 * the raw is_active flag, which stays true for a deal that has already
 * expired (nothing flips it off automatically).
 */
export function findDealById(id: string): Deal | undefined {
  return db.deals.find(d => d.id === id && isDealLive(d))
}

/** Look up product by slug + optional category slug */
export function findProductBySlug(
  productSlug: string,
  categorySlug?: string
): ProductDetail | undefined {
  return db.products.find(
    p =>
      p.slug === productSlug &&
      p.is_published &&
      (categorySlug ? p.category_slug === categorySlug : true)
  )
}


/** Sync affiliate_links + faqs back into the product record */
export function syncProductRelations(productId: string) {
  const product = db.products.find(p => p.id === productId)
  if (!product) return
  product.affiliate_links = db.affiliateLinks.filter(l => l.product_id === productId)
  product.faqs = db.faqs.filter(f => f.product_id === productId)
}
