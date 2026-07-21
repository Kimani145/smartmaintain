import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveUserRole } from '@/lib/supabase/proxy'
import { ensureProfile, isProfileComplete } from '@/lib/profile'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // ── Self-healing profile guarantee ─────────────────────────────────────────
  // ensureProfile() fetches the existing row or creates one if missing.
  // This is the application-layer fallback when the DB trigger has failed.
  const { profile, created, error: profileError } = await ensureProfile(supabase, user)

  if (created) {
    console.log('[dashboard] profile was auto-created during routing for', user.id)
  }

  if (!profile) {
    // DB genuinely failed to create the profile.
    redirect('/auth/setup-profile?reason=db_error')
  }

  // ── Onboarding gate ────────────────────────────────────────────────────────
  // If the profile exists but required fields are missing, send the user
  // through the wizard instead of a dead-end error page.
  if (!isProfileComplete(profile)) {
    redirect('/auth/onboarding')
  }

  // ── Role-based redirect ────────────────────────────────────────────────────
  const role = resolveUserRole(profile)

  if (role === 'admin') {
    redirect('/dashboard/admin')
  } else if (role === 'manager') {
    redirect('/dashboard/manager')
  } else if (role === 'technician') {
    redirect('/dashboard/technician')
  } else {
    redirect('/dashboard/tenant')
  }
}
