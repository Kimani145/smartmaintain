import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveUserRole } from '@/lib/supabase/proxy'
import { ensureProfile } from '@/lib/profile'
import { AppShellNavigation } from '@/components/app-shell-navigation'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { profile } = await ensureProfile(supabase, user)
  const role = resolveUserRole(profile)

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <AppShellNavigation role={role} profile={profile} />
      <div className="flex-1 flex flex-col min-w-0 pt-16 pb-20 md:pt-0 md:pb-0">
        {children}
      </div>
    </div>
  )
}
