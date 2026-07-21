'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-card border border-border p-8 rounded-lg shadow-sm flex flex-col items-center">
        <div className="h-16 w-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mb-6">
          <FileQuestion className="h-8 w-8" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">404</h1>
        <h2 className="text-xl font-bold text-foreground mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          We couldn't find the page you were looking for. It might have been moved or deleted.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Button onClick={() => router.back()} className="w-full flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: 'outline' }), "w-full flex items-center justify-center gap-2")}
          >
            <Home className="w-4 h-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
