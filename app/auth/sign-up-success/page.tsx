'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function SignUpSuccessPage() {
  const router = useRouter()
  const [isConfirmed, setIsConfirmed] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsConfirmed(true)
        // Give a brief moment for the user to see the success state
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 1500)
      }
    })

    // Check current session just in case it's already active
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsConfirmed(true)
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 1500)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden">
            <div className="h-2 w-full bg-primary/20">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-in-out"
                style={{ width: isConfirmed ? '100%' : '33%' }}
              />
            </div>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                {isConfirmed ? (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                ) : (
                  <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {isConfirmed ? 'Account Confirmed!' : 'Check your email'}
              </CardTitle>
              <CardDescription>
                {isConfirmed 
                  ? 'Redirecting to your dashboard...' 
                  : 'We sent a verification link to your inbox.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {!isConfirmed && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Click the link in the email to verify your account. This page will automatically redirect you once confirmed.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 py-2 rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Waiting for confirmation...
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
