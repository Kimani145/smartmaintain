'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  status: string
  priority: string
  category: string
  created_at: string
}

export default function TechnicianAssignedRequestsPage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data, error: fetchError } = await supabase
          .from('maintenance_requests')
          .select('*')
          .eq('assigned_to', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) {
          setError(fetchError.message)
        } else {
          setRequests(data || [])
        }
      } catch (err) {
        setError('Failed to load requests')
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [router])

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
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
          prev.map((req) => (req.id === requestId ? { ...req, status: newStatus } : req))
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
      case 'assigned':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
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
          <Link href="/dashboard/technician" className="text-xl font-bold text-foreground">
            SMARTMAINTAIN
          </Link>
          <Link href="/dashboard/technician" className="text-sm text-muted-foreground hover:text-foreground">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">My Assigned Work</h1>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No assigned requests at this time.
          </div>
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
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{request.description}</p>
                    <div className="flex gap-2 mt-3">
                      <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                        {request.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="w-40">
                    <select
                      value={request.status}
                      onChange={(e) => handleStatusUpdate(request.id, e.target.value)}
                      disabled={updatingId === request.id}
                      className="w-full px-2 py-1 border border-border rounded text-sm bg-background text-foreground"
                    >
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
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
