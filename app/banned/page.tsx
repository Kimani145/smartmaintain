'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function BannedPage() {
  const [reason, setReason] = useState('')
  const [appealMessage, setAppealMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [hasAppealed, setHasAppealed] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkBan = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_banned, ban_reason, appeal_message')
        .eq('id', user.id)
        .single()

      if (!profile?.is_banned) {
        router.push('/dashboard')
        return
      }

      setReason(profile.ban_reason || 'No specific reason provided.')
      if (profile.appeal_message) {
        setHasAppealed(true)
      }
      setLoading(false)
    }

    checkBan()
  }, [router, supabase])

  const handleAppeal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appealMessage) return
    setSubmitting(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ appeal_message: appealMessage })
        .eq('id', user.id)

      if (updateError) throw updateError
      
      setSuccess(true)
      setHasAppealed(true)
    } catch (err: any) {
      setError(err.message || 'Failed to submit appeal.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-destructive p-8 rounded-lg shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">Account Suspended</h1>
        <p className="text-muted-foreground text-center mb-6">
          Your account has been suspended by an administrator.
        </p>

        <div className="bg-muted p-4 rounded-md mb-6">
          <p className="text-sm font-medium text-foreground mb-1">Reason for suspension:</p>
          <p className="text-sm text-muted-foreground">{reason}</p>
        </div>

        {hasAppealed ? (
          <div className="bg-green-100 text-green-800 p-4 rounded-md mb-6 text-sm text-center">
            Your appeal has been submitted and is under review.
          </div>
        ) : (
          <form onSubmit={handleAppeal} className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Submit an Appeal
              </label>
              <textarea
                value={appealMessage}
                onChange={(e) => setAppealMessage(e.target.value)}
                required
                rows={3}
                placeholder="Explain why your account should be reinstated..."
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Submitting...' : 'Submit Appeal'}
            </Button>
          </form>
        )}

        <Button variant="outline" onClick={handleLogout} className="w-full">
          Sign Out
        </Button>
      </div>
    </div>
  )
}
