'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function Setup2FAPage() {
  const [qr, setQr] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init2FA = async () => {
      try {
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
        })
        if (error) throw error

        setFactorId(data.id)
        setQr(data.totp.qr_code)
        setSecret(data.totp.secret)
      } catch (err: any) {
        setError(err.message || 'Failed to initialize 2FA setup')
      } finally {
        setLoading(false)
      }
    }

    init2FA()
  }, [])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!factorId) return
    setError('')
    setVerifying(true)

    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId })
      if (challenge.error) throw challenge.error

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      })

      if (verify.error) throw verify.error

      // Success! Setup is complete.
      router.push('/dashboard/admin')
    } catch (err: any) {
      setError(err.message || 'Invalid code, please try again')
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Initializing 2FA setup...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-foreground mb-4">Set up 2FA</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Administrator accounts require Two-Factor Authentication. Please scan the QR code below with an authenticator app (like Google Authenticator or Authy).
        </p>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded">
            {error}
          </div>
        )}

        {qr && (
          <div className="flex justify-center mb-6 bg-white p-4 rounded-lg inline-block mx-auto">
            <img src={qr} alt="2FA QR Code" className="w-48 h-48" />
          </div>
        )}

        {secret && (
          <div className="mb-6 text-center">
            <p className="text-xs text-muted-foreground mb-1">Manual entry code:</p>
            <code className="bg-muted px-2 py-1 rounded text-sm text-foreground select-all">
              {secret}
            </code>
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
            />
          </div>
          <Button type="submit" className="w-full" disabled={verifying || verifyCode.length < 6}>
            {verifying ? 'Verifying...' : 'Verify and Complete Setup'}
          </Button>
        </form>
      </div>
    </div>
  )
}
