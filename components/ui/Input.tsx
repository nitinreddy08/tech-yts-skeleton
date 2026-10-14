import { cn } from '@/lib/utils/cn'

export function inputVariants({ error = false, className = '' }: { error?: boolean; className?: string } = {}): string {
  return cn(
    'h-11 w-full rounded-md border bg-surface px-4 text-base sm:text-sm text-primary placeholder:text-muted transition-colors',
    'focus:outline-none focus:border-2 focus:px-[15px]',
    'disabled:bg-neutral-100 disabled:text-neutral-600 disabled:border-neutral-300 disabled:cursor-not-allowed',
    error
      ? 'border-error-500 bg-error-50 focus:border-error-500'
      : 'border-neutral-500 focus:border-primary-500',
    className
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function Input({ error = false, className = '', ...props }: InputProps) {
  return <input className={inputVariants({ error, className })} {...props} />
}
