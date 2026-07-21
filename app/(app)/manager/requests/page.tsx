'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'
import { EmptyState } from '@/components/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { ClipboardList, ChevronDown, ChevronUp } from 'lucide-react'
import { RequestTimeline, RequestStatus } from '@/components/timeline'
import { createNotification } from '@/lib/notifications'
import { Badge } from '@/components/ui/badge'

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
  const [technicians, setTechnicians] = useState<{ id: string; full_name: string; email: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
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
          toast.error(requestsError.message)
        } else {
          setRequests(requestsData || [])
        }

        // Fetch profiles matching virtual technicians
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email')

        const techs = (profilesData || []).filter(
          (p: any) =>
            p.email?.toLowerCase().includes('tech') ||
            p.full_name?.toLowerCase().includes('tech')
        )
        setTechnicians(techs)

      } catch (err) {
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleUpdateStatus = async (requestId: string, newStatus: string, tenantId: string) => {
    try {
      setUpdatingId(requestId)
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('maintenance_requests')
        .update({ status: newStatus })
        .eq('id', requestId)

      if (updateError) {
        toast.error(updateError.message)
      } else {
        toast.success('Request status updated')
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, status: newStatus } : req
          )
        )
        
        await createNotification({
          user_id: tenantId,
          type: 'request_updated',
          message: `Your request status has been updated to ${newStatus.replace('_', ' ')}`
        })
      }
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleAssign = async (requestId: string, technicianId: string, requestTitle: string) => {
    try {
      setUpdatingId(requestId)
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('maintenance_requests')
        .update({
          assigned_to: technicianId || null,
          status: technicianId ? 'assigned' : 'pending'
        })
        .eq('id', requestId)

      if (updateError) {
        toast.error(updateError.message)
      } else {
        toast.success(technicianId ? 'Technician assigned successfully' : 'Assignment cleared')
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  assigned_to: technicianId || null,
                  status: technicianId ? 'assigned' : 'pending'
                }
              : req
          )
        )

        if (technicianId) {
          await createNotification({
            user_id: technicianId,
            type: 'request_assigned',
            message: `You have been assigned to a new request: ${requestTitle}`
          })
        }
      }
    } catch (err) {
      toast.error('Failed to assign technician')
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
      

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Manage Requests</h1>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[120px] w-full rounded-lg" />
            <Skeleton className="h-[120px] w-full rounded-lg" />
            <Skeleton className="h-[120px] w-full rounded-lg" />
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No requests found"
            description="There are currently no maintenance requests in the system."
            primaryAction={{
              label: "Back to Dashboard",
              href: "/dashboard/manager"
            }}
          />
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="border border-border rounded-lg bg-card shadow-sm"
              >
                <div 
                  className="p-4 flex flex-col sm:flex-row justify-between items-start gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                >
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-foreground">{request.title}</h3>
                      <div className="sm:hidden">
                        {expandedId === request.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{request.description}</p>
                    <div className="flex gap-2 mt-3 flex-wrap items-center">
                      <Badge variant="outline">{request.category}</Badge>
                      {request.status === 'pending' && <Badge variant="warning">Pending</Badge>}
                      {request.status === 'assigned' && <Badge variant="info">Assigned</Badge>}
                      {request.status === 'in_progress' && <Badge variant="inProgress">In Progress</Badge>}
                      {request.status === 'completed' && <Badge variant="success">Completed</Badge>}
                      {request.status === 'cancelled' && <Badge variant="neutral">Cancelled</Badge>}
                      
                      {request.priority === 'high' || request.priority === 'emergency' ? (
                        <Badge variant="urgent" className="capitalize">{request.priority}</Badge>
                      ) : (
                        <Badge variant="neutral" className="capitalize">{request.priority}</Badge>
                      )}
                    </div>
                  </div>
                  <div 
                    className="w-full sm:w-64 shrink-0 flex flex-col gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex gap-2">
                      {request.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(request.id, 'in_progress', request.tenant_id)}
                          disabled={updatingId === request.id}
                          className="flex-1"
                        >
                          Start Work
                        </Button>
                      )}
                      {request.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(request.id, 'completed', request.tenant_id)}
                          disabled={updatingId === request.id}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          Complete Request
                        </Button>
                      )}
                    </div>
                    {request.status !== 'completed' && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Assign Technician:</label>
                        <select
                          className="w-full text-xs rounded border border-input bg-card px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          value={request.assigned_to || ''}
                          disabled={updatingId === request.id}
                          onChange={(e) => handleAssign(request.id, e.target.value, request.title)}
                        >
                          <option value="">-- Unassigned --</option>
                          {technicians.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.full_name || t.email}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {request.status === 'completed' && request.assigned_to && (
                      <div className="text-xs text-muted-foreground text-center mt-1">
                        Resolved by: {technicians.find((t) => t.id === request.assigned_to)?.full_name || 'Assigned Tech'}
                      </div>
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                    {expandedId === request.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>

                {expandedId === request.id && (
                  <div className="p-4 border-t border-border">
                    <h4 className="text-sm font-medium mb-2">Request Timeline</h4>
                    <RequestTimeline status={request.status as RequestStatus} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
