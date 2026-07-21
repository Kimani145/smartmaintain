'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchNotifications, markNotificationAsRead } from '@/lib/notifications'
import { EmptyState } from '@/components/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell } from 'lucide-react'

interface Notification {
  id: string
  type: string
  message: string
  read: boolean
  created_at: string
  request_id: string | null
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        const data = await fetchNotifications(user.id)
        setNotifications(data as Notification[])
      } catch (err) {
        setError('Failed to load notifications')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId)
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'request_created':
        return '📝'
      case 'request_assigned':
        return '👤'
      case 'request_updated':
        return '🔄'
      case 'request_completed':
        return '✅'
      default:
        return '📬'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Notifications</h1>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="You'll be notified here when there are updates on your maintenance requests or account."
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-lg p-4 transition-colors ${
                  notification.read
                    ? 'border-border bg-card'
                    : 'border-primary bg-primary/5'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 flex gap-3">
                    <span className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div>
                      <p className={notification.read ? 'text-muted-foreground' : 'text-foreground font-medium'}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:opacity-90 flex-shrink-0"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
