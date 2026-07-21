import { createClient } from '@/lib/supabase/server'
import { ensureProfile } from '@/lib/profile'
import { NextResponse } from 'next/server'

/**
 * POST /api/profile/heal
 *
 * Called by the client-side setup-profile error page to attempt a server-side
 * profile re-creation.  Returns a sanitized JSON response — never SQL or
 * Supabase internals.
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'not_authenticated' },
        { status: 401 },
      )
    }

    const { profile, created, error: profileError } = await ensureProfile(supabase, user)

    if (profileError || !profile) {
      console.error('[/api/profile/heal] heal failed for', user.id, profileError)
      return NextResponse.json(
        { success: false, error: 'profile_creation_failed' },
        { status: 500 },
      )
    }

    if (created) {
      console.log('[/api/profile/heal] profile successfully healed for', user.id)
    } else {
      console.log('[/api/profile/heal] profile already exists for', user.id)
    }

    return NextResponse.json({
      success: true,
      created,
      role: profile.role,
    })
  } catch (err) {
    console.error('[/api/profile/heal] unexpected error:', err)
    return NextResponse.json(
      { success: false, error: 'internal_error' },
      { status: 500 },
    )
  }
}
