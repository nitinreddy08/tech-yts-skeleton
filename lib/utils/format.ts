/**
 * Formats a number as Indian Rupee currency.
 * e.g. 129999 → "₹1,29,999"
 */
export function formatIndianPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Generates a URL-safe slug from a string.
 * e.g. "Samsung Galaxy S25 Ultra" → "samsung-galaxy-s25-ultra"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Extracts a YouTube video ID from a YouTube URL.
 */
export function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:shorts\/|(?:v|e(?:mbed)?)\/|[^/]+\/.+\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  )
  return match ? match[1] : null
}
