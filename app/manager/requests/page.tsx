'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createNotification } from '@/lib/notifications'

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  status: string
  priority: string
  category: string
  tenant_id: string
  assigned_to: string | null
  created_at: string
}


export default function ManagerRequestsPage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
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

        // Fetch all open requests
        const { data: requestsData, error: requestsError } = await supabase
          .from('maintenance_requests')
          .select('*')
          .order('created_at', { ascending: false })

        if (requestsError) {
          setError(requestsError.message)
        } else {
          setRequests(requestsData || [])
        }

      } catch (err) {
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      setUpdatingId(requestId)
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('maintenance_requests')
        .update({ status: newStatus })
        .eq('id', requestId)

      if (updateError) {
        setError(updateError.message)
      } else {
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, status: newStatus } : req
          )
        )
      }
    } catch (err) {
      setError('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800'
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard/manager" className="text-xl font-bold text-foreground">
            SMARTMAINTAIN
          </Link>
          <Link href="/dashboard/manager" className="text-sm text-muted-foreground hover:text-foreground">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Manage Requests</h1>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading...</div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="border border-border rounded-lg p-4 bg-card"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{request.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                    <div className="flex gap-2 mt-3">
                      <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                        {request.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(request.status)}`}>
                        {request.status.toUpperCase()}
                      </span>
                      <span className="text-xs font-medium text-red-600">
                        {request.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="w-48">
                    {request.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(request.id, 'in_progress')}
                        disabled={updatingId === request.id}
                        className="w-full"
                      >
                        Start Work
                      </Button>
                    )}
                    {request.status === 'in_progress' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(request.id, 'completed')}
                        disabled={updatingId === request.id}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Complete Request
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
