'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Mail, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

const SUPPORT_EMAIL = 'support@smartmaintain.app'
const AUTO_RETRY_DELAY = 10 // seconds

export default function SetupProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason') ?? 'db_error'
  const errorCode = searchParams.get('code') ?? 'unknown'

  const [countdown, setCountdown] = useState(AUTO_RETRY_DELAY)
  const [retrying, setRetrying] = useState(false)
  const [retryFailed, setRetryFailed] = useState(false)
  const [showDiag, setShowDiag] = useState(false)

  const attemptHeal = useCallback(async () => {
    setRetrying(true)
    setRetryFailed(false)
    try {
      const res = await fetch('/api/profile/heal', { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        // Healed — navigate to dashboard silently.
        router.replace('/dashboard')
        return
      }
      setRetryFailed(true)
    } catch {
      setRetryFailed(true)
    } finally {
      setRetrying(false)
      // Reset the countdown for the next auto-retry.
      setCountdown(AUTO_RETRY_DELAY)
    }
  }, [router])

  // Auto-retry countdown
  useEffect(() => {
    if (retrying) return
    if (countdown <= 0) {
      attemptHeal()
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, retrying, attemptHeal])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card rounded-xl border border-border p-8 shadow-sm">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-amber-500/10 p-4 rounded-full">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-xl font-bold text-foreground text-center mb-2">
          We're finishing setting up your workspace
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          We ran into a temporary issue while preparing your account. We're automatically trying to
          fix this — no action needed on your part.
        </p>

        {/* Auto-retry progress */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6 text-center">
          {retrying ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Retrying…</span>
            </div>
          ) : retryFailed ? (
            <p className="text-sm text-destructive">
              Retry didn't work. Try again manually or contact support.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Retrying automatically in{' '}
              <span className="font-semibold text-foreground tabular-nums">{countdown}s</span>…
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={attemptHeal}
            disabled={retrying}
          >
            {retrying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Trying again…
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again Now
              </>
            )}
          </Button>

          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Account%20Setup%20Issue&body=Hello%20Support%2C%0A%0AI%20was%20unable%20to%20complete%20my%20account%20setup.%20Error%20reference%3A%20${errorCode}%0A%0APlease%20help.`}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-md border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Contact Support
          </a>

          <form action="/auth/logout">
            <Button type="submit" variant="ghost" className="w-full text-muted-foreground">
              Sign out and try a different account
            </Button>
          </form>
        </div>

        {/* Diagnostics accordion (hidden by default) */}
        <div className="mt-6 border-t border-border pt-4">
          <button
            type="button"
            className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowDiag((v) => !v)}
            aria-expanded={showDiag}
          >
            <span>Show diagnostic details</span>
            {showDiag ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {showDiag && (
            <div className="mt-3 rounded-md bg-muted p-3 font-mono text-xs text-muted-foreground space-y-1">
              <p>Reason: {reason}</p>
              <p>Code: {errorCode}</p>
              <p>Time: {new Date().toISOString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
