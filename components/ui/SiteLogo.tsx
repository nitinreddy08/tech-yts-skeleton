/**
 * Site logo mark — an inline SVG monogram, not an <img>. siteConfig.logo_url
 * is empty (this is a white-label template; a real deployment would supply
 * its own asset here), and hotlinking a stand-in isn't reliable in this
 * environment. An SVG mark has zero network dependency and scales cleanly at
 * any size.
 */
export function SiteLogoMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="9" fill="var(--color-accent)" />
      <path
        d="M17.5 6L10 18h5.5L14 26l7.5-12H16z"
        fill="white"
      />
    </svg>
  )
}
