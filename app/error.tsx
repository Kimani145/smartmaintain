'use client'

import { useEffect } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-card border border-border p-8 rounded-lg shadow-sm flex flex-col items-center">
        <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong!</h1>
        <p className="text-muted-foreground mb-8">
          We experienced an unexpected issue. Our team has been notified.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Button onClick={() => reset()} className="flex-1">
            Try again
          </Button>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: 'outline' }), "flex-1")}>
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
