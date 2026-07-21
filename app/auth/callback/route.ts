import { createClient } from '@/lib/supabase/server'
import { ensureProfile } from '@/lib/profile'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (!sessionError && sessionData.user) {
      // ── Primary profile creation point ────────────────────────────────────
      // The DB trigger may not have fired or may have failed silently.
      // We guarantee the profile row exists before allowing the user forward.
      const { error: profileError } = await ensureProfile(supabase, sessionData.user)

      if (profileError) {
        // DB is genuinely broken — route to error page with retry capability.
        const url = new URL(`${origin}/auth/setup-profile`)
        url.searchParams.set('reason', 'db_error')
        url.searchParams.set('code', profileError)
        return NextResponse.redirect(url.toString())
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error?reason=callback_failed`)
}
