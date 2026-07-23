'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { z } from 'zod'

const connectSchema = z.object({
  managerCode: z.string().min(8, 'Invalid manager code format'),
})

export type ConnectManagerResult = {
  error?: string
  success?: boolean
}

export async function connectToManager(
  prevState: ConnectManagerResult,
  formData: FormData
): Promise<ConnectManagerResult> {
  try {
    const validatedFields = connectSchema.safeParse({
      managerCode: formData.get('managerCode'),
    })

    if (!validatedFields.success) {
      return { error: 'Invalid manager code format.' }
    }

    const { managerCode } = validatedFields.data
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated.' }

    // 1. Initialize Service Role Client for Manager Lookup (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL')
      return { error: 'Server configuration error. Contact administrator.' }
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Find the manager by code using service role client
    const { data: managerProfile, error: managerError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('manager_code', managerCode)
      .eq('role', 'manager')
      .single()

    if (managerError || !managerProfile) {
      return { error: 'Manager code not found. Please verify the code.' }
    }

    // 2. Create the connection
    const { error: connectionError } = await supabase
      .from('tenant_connections')
      .insert({
        tenant_id: user.id,
        manager_id: managerProfile.id,
        status: 'pending',
      })

    if (connectionError) {
      if (connectionError.code === '23505') { // Unique violation
        return { error: 'You already have a connection request with this manager.' }
      }
      return { error: 'Failed to submit connection request.' }
    }

    // 3. Create notification for manager
    await supabaseAdmin.from('notifications').insert({
      user_id: managerProfile.id,
      title: 'Tenant Connection Request',
      message: 'A tenant has submitted a connection request to your account.',
      read: false,
    })

    return { success: true }
  } catch (err) {
    console.error('Connection error:', err)
    return { error: 'An unexpected error occurred.' }
  }
}

