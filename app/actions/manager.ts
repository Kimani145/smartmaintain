'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function updateConnectionStatus(connectionId: string, status: 'approved' | 'rejected') {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated.' }

    // Ensure manager owns this connection
    const { data: connection, error: getError } = await supabase
      .from('tenant_connections')
      .select('manager_id, tenant_id')
      .eq('id', connectionId)
      .single()

    if (getError || !connection) {
      return { error: 'Connection request not found.' }
    }

    if (connection.manager_id !== user.id) {
      return { error: 'Unauthorized.' }
    }

    const { error } = await supabase
      .from('tenant_connections')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', connectionId)

    if (error) {
      console.error('Error updating connection:', error)
      return { error: 'Failed to update connection status.' }
    }

    if (connection.tenant_id) {
      await supabase.from('notifications').insert({
        user_id: connection.tenant_id,
        title: 'Connection Status Updated',
        message: `Your connection request has been ${status}.`,
        read: false,
      })
    }

    return { success: true }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { error: 'An unexpected error occurred.' }
  }
}
