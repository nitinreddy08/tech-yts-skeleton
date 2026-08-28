/** SEO-friendly compare URL — GSMArena / 91Mobiles shareable pattern */
export function buildCompareUrl(slugs: string[]): string {
  const valid = slugs.filter(Boolean).slice(0, 4)
  if (valid.length < 2) return '/compare'
  return `/compare/${valid.join('-vs-')}`
}
