'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, User, Phone } from 'lucide-react'
import { toast } from 'sonner'

type Step = 'loading' | 'profile' | 'saving' | 'done'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('loading')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<{ fullName?: string }>({})

  useEffect(() => {
    // Pre-fill from auth metadata if available
    const prefill = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth/login')
        return
      }
      const meta = user.user_metadata ?? {}
      if (meta.full_name) setFullName(meta.full_name as string)
      setStep('profile')
    }
    prefill()
  }, [router])

  const validate = () => {
    const errs: { fullName?: string } = {}
    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = 'Please enter your full name (at least 2 characters)'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setStep('saving')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.replace('/auth/login')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      toast.error("We couldn't save your profile. Please try again.")
      setStep('profile')
      return
    }

    setStep('done')
    // Small delay so the success state is visible before redirect.
    setTimeout(() => router.replace('/dashboard'), 1200)
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-3">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
          <p className="text-lg font-semibold text-foreground">All set!</p>
          <p className="text-sm text-muted-foreground">Taking you to your dashboard…</p>
        </div>
      </div>
    )
  }

  // ── Profile form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card rounded-xl border border-border p-8 shadow-sm">
        {/* Header */}
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <User className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-foreground text-center mb-1">
          Complete your profile
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Just a few details and you'll be ready to go.
        </p>

        {/* Form */}
        <div className="space-y-5">
          {/* Full name */}
          <div>
            <label
              htmlFor="onboarding-full-name"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              id="onboarding-full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.fullName && (
              <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Phone (optional) */}
          <div>
            <label
              htmlFor="onboarding-phone"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Phone Number{' '}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="onboarding-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 0000"
                className="w-full pl-9 pr-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            id="onboarding-submit"
            className="w-full"
            onClick={handleSave}
            disabled={step === 'saving'}
          >
            {step === 'saving' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Continue to Dashboard'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
