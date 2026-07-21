import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  primaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  children?: ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  children
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 text-center min-h-[280px] sm:min-h-[360px] border border-dashed border-border rounded-lg bg-card w-full">
      <div className="h-16 w-16 sm:h-20 sm:w-20 bg-muted text-muted-foreground rounded-full flex items-center justify-center mb-4 sm:mb-6 shrink-0">
        <Icon className="h-8 w-8 sm:h-10 sm:w-10" aria-hidden="true" />
      </div>
      
      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 sm:mb-8 px-2">{description}</p>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
        {primaryAction && (
          primaryAction.href ? (
            <Link
              href={primaryAction.href}
              className={cn(buttonVariants({ variant: 'default' }), "w-full sm:w-auto")}
            >
              {primaryAction.label}
            </Link>
          ) : (
            <Button onClick={primaryAction.onClick} className="w-full sm:w-auto">
              {primaryAction.label}
            </Button>
          )
        )}
        
        {secondaryAction && (
          secondaryAction.href ? (
            <Link
              href={secondaryAction.href}
              className={cn(buttonVariants({ variant: 'outline' }), "w-full sm:w-auto")}
            >
              {secondaryAction.label}
            </Link>
          ) : (
            <Button variant="outline" onClick={secondaryAction.onClick} className="w-full sm:w-auto">
              {secondaryAction.label}
            </Button>
          )
        )}
      </div>

      {children && <div className="mt-6 sm:mt-8 w-full max-w-md">{children}</div>}
    </div>
  )
}
