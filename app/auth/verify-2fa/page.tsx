'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function Verify2FAPage() {
  const [verifyCode, setVerifyCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [factorId, setFactorId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchFactors = async () => {
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) {
        setError('Failed to fetch 2FA factors')
        return
      }
      const totpFactor = data.totp.find((f) => f.status === 'verified')
      if (totpFactor) {
        setFactorId(totpFactor.id)
      } else {
        // Not enrolled, redirect to setup
        router.push('/admin/2fa-setup')
      }
    }
    fetchFactors()
  }, [router])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!factorId) return
    setError('')
    setLoading(true)

    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId })
      if (challenge.error) throw challenge.error

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      })

      if (verify.error) throw verify.error

      // Check role and redirect
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role === 'admin') {
          router.push('/dashboard/admin')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid code, please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-foreground mb-4">Two-Factor Authentication</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Please enter the 6-digit code from your authenticator app to continue.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Verification Code
            </label>
            <input
              type="text"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              placeholder="000000"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
              pattern="[0-9]{6}"
              maxLength={6}
              disabled={!factorId}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !factorId || verifyCode.length < 6}>
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </form>
      </div>
    </div>
  )
}
