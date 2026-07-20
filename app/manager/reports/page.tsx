'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ManagerStats {
  totalRequests: number
  completedRequests: number
  pendingRequests: number
  assignedRequests: number
  tenantsServed: number
}

interface RequestRow {
  id: string
  status: string
  tenant_id: string
}

export default function ManagerReportsPage() {
  const [stats, setStats] = useState<ManagerStats>({
    totalRequests: 0,
    completedRequests: 0,
    pendingRequests: 0,
    assignedRequests: 0,
    tenantsServed: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: requests, error: requestsError } = await supabase
          .from('maintenance_requests')
          .select('id, status, tenant_id')

        if (requestsError) {
          setError('Failed to load statistics')
          return
        }

        const requestsArray: RequestRow[] = requests || []
        const uniqueTenants = new Set(requestsArray.map((r) => r.tenant_id)).size

        setStats({
          totalRequests: requestsArray.length,
          completedRequests: requestsArray.filter((r) => r.status === 'completed').length,
          pendingRequests: requestsArray.filter((r) => r.status === 'pending').length,
          assignedRequests: requestsArray.filter((r) => r.status === 'assigned' || r.status === 'in_progress').length,
          tenantsServed: uniqueTenants,
        })
      } catch (err) {
        setError('Failed to load reports')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [router])

  const StatCard = ({ label, value }: { label: string; value: number }) => (
    <div className="border border-border rounded-lg p-6 bg-card">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </div>
  )

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
        <h1 className="text-2xl font-bold text-foreground mb-6">Performance Reports</h1>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading statistics...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard label="Total Requests" value={stats.totalRequests} />
            <StatCard label="Completed Requests" value={stats.completedRequests} />
            <StatCard label="Pending Requests" value={stats.pendingRequests} />
            <StatCard label="Assigned & In Progress" value={stats.assignedRequests} />
            <StatCard label="Tenants Served" value={stats.tenantsServed} />
          </div>
        )}
      </main>
    </div>
  )
}
