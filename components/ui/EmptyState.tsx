import Link from 'next/link'

interface EmptyStateProps {
  icon: React.ComponentType<{ size?: number; className?: string }>
  heading: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

const actionClassName =
  'mt-6 inline-flex items-center px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors'

export function EmptyState({ icon: Icon, heading, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={48} className="text-muted mb-4" />
      <h3 className="text-lg font-semibold text-primary mb-2">{heading}</h3>
      <p className="text-sm text-muted max-w-sm">{description}</p>
      {action && (
        action.href ? (
          <Link href={action.href} className={actionClassName}>
            {action.label}
          </Link>
        ) : (
          <button onClick={action.onClick} className={actionClassName}>
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
