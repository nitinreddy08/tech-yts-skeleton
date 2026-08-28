import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.youtube.com https://s.ytimg.com https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.google-analytics.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://placehold.co https://i.ytimg.com https://store.storeimages.cdn-apple.com https://images.samsung.com https://image01.oneplus.net https://www.google-analytics.com https://www.googletagmanager.com;
  font-src 'self';
  frame-src https://www.youtube.com https://www.youtube-nocookie.com;
  connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'store.storeimages.cdn-apple.com' },
      { protocol: 'https', hostname: 'images.samsung.com' },
      { protocol: 'https', hostname: 'image01.oneplus.net' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
    ],
  },

  async headers() {
    return [
      // Cache-Control for all public routes (Requirements 12.5)
      {
        source: '/((?!admin|api|_next).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim(),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

export default nextConfig
