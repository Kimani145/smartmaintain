'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import { Badge } from '@/components/ui/badge'
import { Flag } from 'lucide-react'

interface Report {
  id: string
  reporter_id: string
  reported_id: string
  reason: string
  images: string[]
  status: string
  created_at: string
  reporter?: { full_name: string }
  reported?: { full_name: string }
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchReports = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // We use multiple queries or a join to get names.
      // Since supabase JS auto-joins on foreign keys, we can do:
      const { data, error } = await supabase
        .from('user_reports')
        .select(`
          *,
          reporter:profiles!reporter_id (full_name),
          reported:profiles!reported_id (full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error(error.message)
      } else {
        // @ts-ignore
        setReports(data || [])
      }
      setLoading(false)
    }

    fetchReports()
  }, [router, supabase])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdating(id)
    const { error } = await supabase
      .from('user_reports')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      toast.success('Report status updated')
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      )
    } else {
      toast.error(error.message)
    }
    setUpdating(null)
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'investigating': return 'info'
      case 'resolved': return 'success'
      case 'dismissed': return 'neutral'
      default: return 'neutral'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">User Reports (Moderation)</h1>
          <Link href="/admin/users">
            <Button variant="outline">Manage Users</Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon={Flag}
            title="No reports"
            description="There are currently no user reports requiring moderation."
          />
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Report against: {report.reported?.full_name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Reported by: {report.reporter?.full_name || 'Unknown User'} on {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusVariant(report.status) as any}>
                      {report.status.toUpperCase()}
                    </Badge>
                    <select
                      value={report.status}
                      onChange={(e) => handleUpdateStatus(report.id, e.target.value)}
                      disabled={updating === report.id}
                      className="text-sm border border-border rounded px-2 py-1 bg-background"
                    >
                      <option value="pending">Pending</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-md mb-4 text-sm text-foreground">
                  {report.reason}
                </div>

                {report.images && report.images.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Evidence Images:</p>
                    <div className="flex flex-wrap gap-2">
                      {report.images.map((img, idx) => (
                        <a key={idx} href={img} target="_blank" rel="noreferrer">
                          <img src={img} alt="Evidence" className="h-24 w-24 object-cover rounded border border-border" />
                        </a>
                      ))}
                    </div>
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
