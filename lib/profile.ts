import type { SupabaseClient, User } from '@supabase/supabase-js'

export type ProfileRow = {
  id: string
  email: string
  full_name: string
  role: string
  phone: string | null
  avatar_url: string | null
  is_banned: boolean
  ban_reason: string | null
  created_at: string
  updated_at: string
}

export type EnsureProfileResult =
  | { profile: ProfileRow; created: boolean; error: null }
  | { profile: null; created: false; error: string }

/**
 * Guarantees a profile row exists for the given authenticated user.
 *
 * Behaviour:
 *  1. Fetches the existing profile row.
 *  2. If it exists → returns it (created: false).
 *  3. If it is missing → inserts a minimal row derived from auth metadata.
 *  4. On insertion failure → returns { profile: null, error: 'sanitized_code' }.
 *
 * This function is the application-layer backstop for when the
 * `handle_new_user` DB trigger silently fails.  It is intentionally
 * idempotent — calling it multiple times is safe.
 */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<EnsureProfileResult> {
  // ── 1. Check if the profile already exists ───────────────────────────────
  const { data: existing, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    // PGRST116 = "not found" — anything else is a real DB error
    console.error('[ensureProfile] fetch error:', fetchError.code, fetchError.message)
    return { profile: null, created: false, error: fetchError.code }
  }

  if (existing) {
    return { profile: existing as ProfileRow, created: false, error: null }
  }

  // ── 2. Profile is missing — attempt to create it ─────────────────────────
  const metadata = user.user_metadata ?? {}
  const rawRole = metadata.role as string | undefined

  // Map the metadata role to a valid enum value; default to 'tenant'.
  let safeRole: 'admin' | 'manager' | 'tenant' = 'tenant'
  if (rawRole === 'admin') safeRole = 'admin'
  else if (rawRole === 'manager') safeRole = 'manager'

  const now = new Date().toISOString()

  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email ?? '',
      full_name: (metadata.full_name as string | undefined) ?? 'New User',
      role: safeRole,
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single()

  if (insertError) {
    // If the row exists already (race condition / duplicate), try fetching it.
    if (insertError.code === '23505') {
      const { data: retried } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (retried) {
        console.log('[ensureProfile] profile recovered via race-condition retry for', user.id)
        return { profile: retried as ProfileRow, created: false, error: null }
      }
    }

    console.error('[ensureProfile] insert error:', insertError.code, insertError.message)
    return { profile: null, created: false, error: insertError.code }
  }

  console.log('[ensureProfile] profile auto-created for', user.id, '(role:', safeRole, ')')
  return { profile: created as ProfileRow, created: true, error: null }
}

/**
 * Returns true if the profile has all required fields to reach a dashboard.
 * A profile is considered "complete" if it has a non-null full_name and role.
 */
export function isProfileComplete(profile: ProfileRow): boolean {
  return Boolean(profile.full_name?.trim()) && Boolean(profile.role)
}
