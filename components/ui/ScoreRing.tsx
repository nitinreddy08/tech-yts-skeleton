'use client'

/**
 * ScoreRing — Animated SVG radial score indicator, RTINGS-inspired.
 * Rating is 0–10. Color shifts from red → amber → green as score rises.
 */

interface ScoreRingProps {
  score: number       // 0–10
  size?: number       // px
  strokeWidth?: number
  label?: string
}

function scoreColor(score: number): string {
  if (score >= 9) return '#22c55e'   // green-500
  if (score >= 8) return '#84cc16'   // lime-500
  if (score >= 7) return '#f59e0b'   // amber-500
  if (score >= 6) return '#f97316'   // orange-500
  return '#ef4444'                   // red-500
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
  const color = scoreColor(score)

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
            stroke={color}
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
            style={{ color }}
          >
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] text-muted leading-none mt-0.5">/10</span>
        </div>
      </div>
      <span className="text-xs font-semibold" style={{ color }}>
        {scoreVerdict(score)}
      </span>
      {label && <span className="text-xs text-muted text-center leading-tight">{label}</span>}
    </div>
  )
}
