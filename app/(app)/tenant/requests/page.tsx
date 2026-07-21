'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'
import { EmptyState } from '@/components/empty-state'
import { ClipboardList, ChevronDown, ChevronUp } from 'lucide-react'
import { RequestTimeline, RequestStatus } from '@/components/timeline'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  status: string
  priority: string
  category: string
  created_at: string
}

export default function TenantRequestsPage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
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
          .eq('tenant_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) {
          toast.error(fetchError.message)
          return
        }

        setRequests(data || [])
      } catch (err) {
        toast.error('Failed to load requests')
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600'
      case 'normal':
        return 'text-blue-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Maintenance Requests</h1>
          <Link href="/tenant/request/new">
            <Button>New Request</Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-[100px] w-full rounded-lg" />
            <Skeleton className="h-[100px] w-full rounded-lg" />
            <Skeleton className="h-[100px] w-full rounded-lg" />
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No maintenance requests"
            description="You haven't submitted any maintenance requests yet."
            primaryAction={{
              label: "Submit Your First Request",
              href: "/tenant/request/new"
            }}
          />
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="border border-border rounded-lg p-4 bg-card shadow-sm transition-colors"
              >
                <div 
                  className="flex flex-col sm:flex-row justify-between items-start gap-4 cursor-pointer hover:opacity-80"
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
                    <div className="flex flex-wrap gap-2 mt-3 items-center">
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
                  <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                    {expandedId === request.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>

                {expandedId === request.id && (
                  <div className="mt-4 pt-4 border-t border-border">
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
