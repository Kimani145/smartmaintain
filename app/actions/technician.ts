'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createTechnicianSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type CreateTechnicianState = {
  error?: string
  success?: boolean
  technician?: any
}

export async function createTechnician(
  prevState: CreateTechnicianState,
  formData: FormData
): Promise<CreateTechnicianState> {
  try {
    const validatedFields = createTechnicianSchema.safeParse({
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      phone: formData.get('phone') || undefined,
      password: formData.get('password'),
    })

    if (!validatedFields.success) {
      return { error: 'Invalid form data' }
    }

    const { fullName, email, phone, password } = validatedFields.data

    // 1. Verify current user is a Manager or Admin
    const supabaseSession = await createServerClient()
    const { data: { user } } = await supabaseSession.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { data: managerProfile } = await supabaseSession
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!managerProfile || !['manager', 'admin'].includes(managerProfile.role)) {
      return { error: 'Unauthorized. Only managers can create technicians.' }
    }

    // 2. Initialize Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL')
      return { error: 'Server configuration error. Contact administrator.' }
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 3. Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        role: 'technician',
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return { error: authError.message }
    }

    // 4. Create Profile
    // Note: Our handle_new_user trigger might fire and create a profile with role='tenant'.
    // We should explicitly update it or let the trigger do its job and then update.
    // The trigger sets role from raw_user_meta_data->>'role', which we just set! So it should be 'technician'.
    // We just need to update the manager_id.
    
    if (authData.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          phone: phone || null,
          manager_id: user.id, // Link to the manager
        })
        .eq('id', authData.user.id)

      if (profileError) {
        console.error('Error updating technician profile:', profileError)
        // Cleanup if profile fails? (Ideally yes, but left out for simplicity unless required)
        return { error: 'User created but failed to link profile.' }
      }
    }

    return { success: true }
  } catch (err) {
    console.error('Unexpected error creating technician:', err)
    return { error: 'An unexpected error occurred.' }
  }
}
