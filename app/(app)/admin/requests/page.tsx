'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import { Badge } from '@/components/ui/badge'
import { ClipboardList } from 'lucide-react'

interface MaintenanceRequest {
  id: string
  title: string
  status: string
  priority: string
  category: string
  created_at: string
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
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
          .order('created_at', { ascending: false })

        if (fetchError) {
          toast.error(fetchError.message)
        } else {
          setRequests(data || [])
        }
      } catch (err) {
        toast.error('Failed to load requests')
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [router])

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'bg-blue-100 text-blue-800',
      assigned: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return statusMap[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-background">
      

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">All Maintenance Requests</h1>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-[80px] w-full rounded-lg" />
            <Skeleton className="h-[80px] w-full rounded-lg" />
            <Skeleton className="h-[80px] w-full rounded-lg" />
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No requests found"
            description="There are currently no maintenance requests in the system."
          />
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="border border-border rounded-lg p-4 bg-card shadow-sm hover:border-primary transition-colors">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{request.title}</h3>
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
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(request.created_at).toLocaleDateString()}
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
