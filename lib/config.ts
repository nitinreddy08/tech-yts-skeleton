/**
 * Site configuration — hardcoded constants for this creator's site.
 * To rebrand for a different creator, edit this file.
 */
export const siteConfig = {
  // Branding
  site_name: 'TechReviews India',
  tagline: 'Honest reviews. Best prices.',
  // Homepage hero (the H1 should say what the site does, not just its name)
  hero_heading: 'Find the right phone, laptop or earbuds for your budget',
  hero_subheading: 'Honest, creator-tested reviews and live price comparisons across Indian stores.',
  logo_url: '',
  favicon_url: '',

  // Creator
  creator_name: 'Creator',
  creator_photo_url: '',
  creator_youtube_channel_url: '',

  // Colors (also set via CSS variables in globals.css)
  primary_color: '#6366f1',
  secondary_color: '#8b5cf6',

  // SEO
  meta_default_title: 'TechReviews India',
  meta_default_description: 'Tech reviews and best prices in India.',

  // Analytics (or use env vars: process.env.NEXT_PUBLIC_GA_ID)
  google_analytics_id: process.env.NEXT_PUBLIC_GA_ID ?? null,
  google_adsense_id: process.env.NEXT_PUBLIC_ADSENSE_ID ?? null,

  // Footer
  footer_text: `© ${new Date().getFullYear()} TechReviews India. All rights reserved.`,

  // Social links
  social_links: {
    youtube: '',
    twitter: '',
    instagram: '',
  } as Record<string, string>,
} as const
