'use server'

import { createClient } from '@/lib/supabase/server'
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

    // 1. Find the manager by code
    const { data: managerProfile, error: managerError } = await supabase
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

    return { success: true }
  } catch (err) {
    console.error('Connection error:', err)
    return { error: 'An unexpected error occurred.' }
  }
}
