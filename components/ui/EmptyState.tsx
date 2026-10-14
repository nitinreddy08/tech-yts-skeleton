import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  icon: React.ComponentType<{ size?: number; className?: string }>
  heading: string
  /** Heading level. Pages whose only content is the empty state should pass 1. */
  headingLevel?: 1 | 2 | 3
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export function EmptyState({ icon: Icon, heading, headingLevel = 2, description, action }: EmptyStateProps) {
  const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3'
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={48} className="text-muted mb-4" aria-hidden />
      <Heading className="text-lg font-semibold text-primary mb-2">{heading}</Heading>
      <p className="text-sm text-muted max-w-sm">{description}</p>
      {action && (
        <Button
          size="auto"
          className="mt-6 h-11 px-5 text-sm"
          {...(action.href ? { href: action.href } : { onClick: action.onClick })}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
