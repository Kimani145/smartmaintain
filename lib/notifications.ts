import { createClient } from '@/lib/supabase/client'

interface NotificationData {
  user_id: string
  request_id?: string
  type: 'request_created' | 'request_assigned' | 'request_updated' | 'request_completed'
  message: string
}

export async function createNotification(data: NotificationData) {
  try {
    const supabase = createClient()
    const title = data.type
      ? data.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : 'Notification'

    const { error } = await supabase.from('notifications').insert({
      user_id: data.user_id,
      title: title,
      message: data.message,
      read: false
    })

    if (error) {
      console.error('Failed to create notification:', error)
      return false
    }
    return true
  } catch (error) {
    console.error('Notification error:', error)
    return false
  }
}

export async function fetchNotifications(userId: string, unreadOnly = false) {
  try {
    const supabase = createClient()
    let query = supabase.from('notifications').select('*').eq('user_id', userId)

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch notifications:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Notification fetch error:', error)
    return []
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const supabase = createClient()
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', notificationId)

    if (error) {
      console.error('Failed to mark notification as read:', error)
      return false
    }
    return true
  } catch (error) {
    console.error('Notification update error:', error)
    return false
  }
}
