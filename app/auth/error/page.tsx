import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, Mail } from 'lucide-react'

const SUPPORT_EMAIL = 'support@smartmaintain.app'

const REASON_MESSAGES: Record<string, { title: string; body: string }> = {
  callback_failed: {
    title: "We couldn't sign you in",
    body: 'The sign-in link may have expired or already been used. Please request a new one.',
  },
  profile_creation_failed: {
    title: "We're having trouble setting up your workspace",
    body: "Your account exists but we couldn't finish setting it up. Please try again.",
  },
  default: {
    title: 'Something went wrong',
    body: 'We ran into an unexpected issue. Please try signing in again.',
  },
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const params = await searchParams
  const reason = params?.reason ?? 'default'
  const msg = REASON_MESSAGES[reason] ?? REASON_MESSAGES.default

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card rounded-xl border border-border p-8 shadow-sm text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-destructive/10 p-4 rounded-full">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>

        <h1 className="text-xl font-bold text-foreground mb-2">{msg.title}</h1>
        <p className="text-sm text-muted-foreground mb-8">{msg.body}</p>

        <div className="space-y-3">
          <Link href="/auth/login">
            <Button className="w-full">Back to Sign In</Button>
          </Link>

          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Sign-in%20Error&body=Hello%2C%0A%0AI%20encountered%20an%20error%20signing%20in.%20Reason%3A%20${reason}%0A%0APlease%20help.`}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-md border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
