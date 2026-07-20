'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
  const [error, setError] = useState('')
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
        setError(error.message)
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
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      )
    }
    setUpdating(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'investigating': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'dismissed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard/admin" className="text-xl font-bold text-foreground">
            SMARTMAINTAIN
          </Link>
          <Link href="/dashboard/admin" className="text-sm text-muted-foreground hover:text-foreground">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">User Reports (Moderation)</h1>
          <Link href="/admin/users">
            <Button variant="outline">Manage Users</Button>
          </Link>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 bg-card rounded-lg border border-border">
            No reports found.
          </div>
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
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status.toUpperCase()}
                    </span>
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
