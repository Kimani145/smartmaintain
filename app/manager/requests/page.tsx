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
interface Technician {
  id: string
  full_name: string
}

export default function ManagerRequestsPage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [assigningId, setAssigningId] = useState<string | null>(null)
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

        // Fetch technicians
        const { data: technicianData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'technician')

        setTechnicians(technicianData || [])
      } catch (err) {
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleAssignTechnician = async (requestId: string, technicianId: string) => {
    try {
      setAssigningId(requestId)
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('maintenance_requests')
        .update({ assigned_to: technicianId, status: 'assigned' })
        .eq('id', requestId)

      if (updateError) {
        setError(updateError.message)
      } else {
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, assigned_to: technicianId, status: 'assigned' } : req
          )
        )

        // Notify technician of assignment
        const assignedRequest = requests.find((r) => r.id === requestId)
        if (assignedRequest) {
          await createNotification({
            user_id: technicianId,
            request_id: requestId,
            type: 'request_assigned',
            message: `You have been assigned: ${assignedRequest.title}`,
          })
        }
      }
    } catch (err) {
      setError('Failed to assign technician')
    } finally {
      setAssigningId(null)
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
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignTechnician(request.id, e.target.value)
                            e.target.value = ''
                          }
                        }}
                        disabled={assigningId === request.id}
                        className="w-full px-2 py-1 border border-border rounded text-sm bg-background text-foreground"
                      >
                        <option value="">Assign Technician...</option>
                        {technicians.map((tech) => (
                          <option key={tech.id} value={tech.id}>
                            {tech.full_name}
                          </option>
                        ))}
                      </select>
                    )}
                    {request.assigned_to && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Assigned</span>
                      </div>
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
