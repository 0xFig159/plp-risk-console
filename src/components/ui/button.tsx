import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors',
        'bg-primary text-primary-foreground hover:bg-primary/80',
        'h-10 px-4 py-2',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
