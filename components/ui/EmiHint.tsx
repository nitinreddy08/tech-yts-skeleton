import { formatEmiLine } from '@/lib/utils/emi'

interface EmiHintProps {
  priceInr: number
  className?: string
}

export function EmiHint({ priceInr, className = '' }: EmiHintProps) {
  if (priceInr < 5000) return null
  return (
    <p className={`text-xs text-muted ${className}`}>
      {formatEmiLine(priceInr, priceInr >= 50000 ? 12 : 6)}
    </p>
  )
}
