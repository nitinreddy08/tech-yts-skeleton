import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'deal' | 'ghost'
export type ButtonSize = 'md' | 'sm' | 'auto'

const BASE =
  'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:cursor-not-allowed'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-primary-800 active:bg-primary-900 disabled:bg-accent/40 disabled:text-white/60',
  secondary: 'bg-surface text-primary border border-neutral-500 hover:bg-neutral-200 active:bg-neutral-300 disabled:bg-neutral-100 disabled:text-neutral-600 disabled:border-neutral-300',
  deal: 'bg-secondary text-primary hover:bg-secondary-600 active:bg-secondary-700 active:text-white disabled:bg-neutral-300 disabled:text-neutral-600',
  // Adapted from the spec's "on dark/image background" ghost: this app needs a plain
  // tertiary button on ordinary light surfaces far more often, so ghost here reads
  // as a quiet, no-border action rather than a white-on-photo overlay button.
  ghost: 'bg-transparent text-primary hover:bg-neutral-200 active:bg-neutral-300 disabled:text-neutral-600',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'h-12 px-6 text-md',
  // 44px: the minimum comfortable touch target (was 38px).
  sm: 'h-11 px-5 text-base',
  // No height/padding/text-size of its own — for compact contexts (a card
  // footer CTA) that need custom sizing but still want the shared
  // color/radius/transition treatment.
  auto: '',
}

export function buttonVariants({
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} = {}): string {
  return cn(BASE, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)
}

interface ButtonOwnProps {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Renders a Next.js Link styled as a button instead of a <button>. */
  href?: string
}

type ButtonAsButton = ButtonOwnProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps> & { href?: undefined }
type ButtonAsLink = ButtonOwnProps &
  Omit<React.ComponentProps<typeof Link>, keyof ButtonOwnProps | 'href'> & { href: string }

export type ButtonProps = ButtonAsButton | ButtonAsLink

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const classes = buttonVariants({ variant, size, className })

  if (props.href !== undefined) {
    const { href, ...rest } = props as ButtonAsLink
    return <Link href={href} className={classes} {...rest} />
  }

  const { type = 'button', ...rest } = props as ButtonAsButton
  return <button type={type} className={classes} {...rest} />
}
