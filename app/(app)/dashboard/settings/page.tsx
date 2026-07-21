import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { ArrowLeft } from 'lucide-react'
import { resolveUserRole } from '@/lib/supabase/proxy'
import { ensureProfile, isProfileComplete } from '@/lib/profile'
import { SettingsForm } from './settings-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { profile, error: profileError } = await ensureProfile(supabase, user)

  if (!profile || !isProfileComplete(profile)) {
    redirect('/auth/onboarding')
  }

  const role = resolveUserRole(profile)

  const handleLogout = async () => {
    'use server'
    const supabaseServer = await createClient()
    await supabaseServer.auth.signOut()
    redirect('/auth/login')
  }

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'urgent'
      case 'manager': return 'info'
      case 'technician': return 'inProgress'
      case 'tenant': return 'warning'
      default: return 'neutral'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Account Settings</h1>
        </div>
        <SettingsForm profile={profile} role={role} />
      </main>
    </div>
  )
}
