'use client'

/**
 * ScoreRing — Animated SVG radial score indicator, RTINGS-inspired.
 * Rating is 0–10. Ring color derives from the score in four bands
 * (see design-system/components.md "Score Ring"): success at 9+,
 * brand violet 8–8.9, deal amber 7–7.9, neutral below 7.
 */

interface ScoreRingProps {
  score: number       // 0–10
  size?: number       // px
  strokeWidth?: number
  label?: string
}

/** Ring stroke — vivid, fine at the wider contrast tolerance SVG strokes get. */
function scoreRingColor(score: number): string {
  if (score >= 9) return 'var(--success-500)'
  if (score >= 8) return 'var(--primary-500)'
  if (score >= 7) return 'var(--secondary-500)'
  return 'var(--neutral-600)'
}

/** Text color — one step darker than the ring in the amber band, where
 *  secondary-500 alone doesn't clear text-contrast against white. */
function scoreTextColor(score: number): string {
  if (score >= 9) return 'var(--success-700)'
  if (score >= 8) return 'var(--primary-600)'
  if (score >= 7) return 'var(--secondary-700)'
  return 'var(--neutral-800)'
}

function scoreVerdict(score: number): string {
  if (score >= 9.5) return 'Outstanding'
  if (score >= 9)   return 'Excellent'
  if (score >= 8.5) return 'Very Good'
  if (score >= 8)   return 'Good'
  if (score >= 7)   return 'Decent'
  if (score >= 6)   return 'Average'
  return 'Below Average'
}

export function ScoreRing({ score, size = 96, strokeWidth = 7, label }: ScoreRingProps) {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  // Fill from 0→10 mapped to full circle. Start at top (rotate -90°).
  const fill = Math.min(Math.max(score / 10, 0), 1)
  const dashOffset = circumference * (1 - fill)
  const ringColor = scoreRingColor(score)
  const textColor = scoreTextColor(score)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
          aria-hidden="true"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-border"
          />
          {/* Filled arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        {/* Center score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-xl font-extrabold leading-none tabular-nums"
            style={{ color: textColor }}
          >
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] text-muted leading-none mt-0.5">/10</span>
        </div>
      </div>
      <span className="text-xs font-semibold" style={{ color: textColor }}>
        {scoreVerdict(score)}
      </span>
      {label && <span className="text-xs text-muted text-center leading-tight">{label}</span>}
    </div>
  )
}
