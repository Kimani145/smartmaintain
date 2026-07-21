'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Wrench, CheckCircle2, Clock, Phone, Home, AlertCircle, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { EmptyState } from '@/components/empty-state'
import { cn } from '@/lib/utils'

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  status: string
  priority: string
  created_at: string
  image_url: string | null
  tenant_id: string
  unit_id: string
}

interface Unit {
  id: string
  unit_number: string
  property: {
    name: string
    location: string
  } | null
}

interface TenantProfile {
  id: string
  full_name: string
  phone: string | null
}

export default function TechnicianDashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [units, setUnits] = useState<Record<string, Unit>>({})
  const [tenants, setTenants] = useState<Record<string, TenantProfile>>({})
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setProfile(profileData)

        // Fetch assigned requests
        const { data: requestsData, error: requestsError } = await supabase
          .from('maintenance_requests')
          .select('*')
          .eq('assigned_to', user.id)
          .order('created_at', { ascending: false })

        if (requestsError) {
          toast.error(requestsError.message)
          return
        }

        setRequests(requestsData || [])

        // Batch fetch units and tenant profiles if any
        if (requestsData && requestsData.length > 0) {
          const unitIds = Array.from(new Set(requestsData.map(r => r.unit_id).filter(Boolean)))
          const tenantIds = Array.from(new Set(requestsData.map(r => r.tenant_id).filter(Boolean)))

          if (unitIds.length > 0) {
            const { data: unitsData } = await supabase
              .from('units')
              .select('id, unit_number, property:properties(name, location)')
              .in('id', unitIds)

            const unitMap: Record<string, Unit> = {}
            unitsData?.forEach((u: any) => {
              unitMap[u.id] = u
            })
            setUnits(unitMap)
          }

          if (tenantIds.length > 0) {
            const { data: tenantsData } = await supabase
              .from('profiles')
              .select('id, full_name, phone')
              .in('id', tenantIds)

            const tenantMap: Record<string, TenantProfile> = {}
            tenantsData?.forEach((t: any) => {
              tenantMap[t.id] = t
            })
            setTenants(tenantMap)
          }
        }
      } catch (err) {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router, supabase])

  const updateStatus = async (requestId: string, newStatus: string) => {
    setUpdatingId(requestId)
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ status: newStatus })
        .eq('id', requestId)

      if (error) {
        toast.error(error.message)
        return
      }

      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r))
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`)
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Loading Technician Portal...</p>
        </div>
      </div>
    )
  }

  const pending = requests.filter(r => r.status === 'pending' || r.status === 'assigned')
  const inProgress = requests.filter(r => r.status === 'in_progress')
  const completed = requests.filter(r => r.status === 'completed')

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return <Badge variant="urgent" className="capitalize animate-pulse">Emergency</Badge>
      case 'high':
        return <Badge variant="urgent" className="capitalize">High</Badge>
      case 'medium':
        return <Badge variant="info" className="capitalize">Medium</Badge>
      case 'low':
        return <Badge variant="neutral" className="capitalize">Low</Badge>
      default:
        return <Badge variant="neutral" className="capitalize">{priority}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" className="capitalize">Completed</Badge>
      case 'in_progress':
        return <Badge variant="inProgress" className="capitalize">In Progress</Badge>
      case 'assigned':
        return <Badge variant="info" className="capitalize">Assigned</Badge>
      case 'pending':
        return <Badge variant="warning" className="capitalize">Pending</Badge>
      default:
        return <Badge variant="neutral" className="capitalize">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-gradient-to-r from-card to-muted rounded-xl border border-border shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome Back, {profile?.full_name || 'Technician'}</h2>
            <p className="text-sm text-muted-foreground">Manage and resolve your assigned maintenance requests.</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/notifications"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              View Notifications
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Assigned Tasks</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pending.length}</div>
              <p className="text-xs text-muted-foreground">Needs review or schedule</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Work</CardTitle>
              <Wrench className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{inProgress.length}</div>
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Tasks</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completed.length}</div>
              <p className="text-xs text-muted-foreground">Successfully closed requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Work Queue */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>My Work Queue</CardTitle>
            <CardDescription>View, update, and resolve your active assignments.</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="You're all caught up!"
                description="No maintenance requests are currently assigned to you."
              />
            ) : (
              <div className="space-y-6">
                {requests.map((request) => {
                  const unit = units[request.unit_id]
                  const tenant = tenants[request.tenant_id]
                  const isUpdating = updatingId === request.id

                  return (
                    <div
                      key={request.id}
                      className="p-5 border border-border rounded-lg bg-card hover:border-primary/50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                    >
                      {/* Left: Info */}
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-lg font-bold text-foreground">{request.title}</h4>
                          {getPriorityBadge(request.priority)}
                          {getStatusBadge(request.status)}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl">{request.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-xs text-muted-foreground pt-1">
                          <div className="flex items-center gap-1.5">
                            <Home className="h-3.5 w-3.5" />
                            <span>
                              {unit?.property?.name || 'Loading Property...'} - Unit {unit?.unit_number || '...'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            <span>
                              {tenant?.full_name || 'Loading Tenant...'} {tenant?.phone ? `(${tenant.phone})` : ''}
                            </span>
                          </div>
                        </div>

                        {request.image_url && (
                          <div className="pt-2">
                            <a
                              href={request.image_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <FileText className="h-3.5 w-3.5" /> View Photo Attachment
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
                        {request.status !== 'completed' && request.status !== 'in_progress' && (
                          <Button
                            onClick={() => updateStatus(request.id, 'in_progress')}
                            disabled={isUpdating}
                            className="flex-1 md:w-40"
                            size="sm"
                          >
                            {isUpdating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                Start Work <ArrowRight className="ml-1 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        )}
                        {request.status === 'in_progress' && (
                          <Button
                            onClick={() => updateStatus(request.id, 'completed')}
                            disabled={isUpdating}
                            className="flex-1 md:w-40 bg-success hover:bg-success/90 text-white"
                            size="sm"
                          >
                            {isUpdating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                Mark Completed <CheckCircle2 className="ml-1 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        )}
                        {request.status === 'completed' && (
                          <div className="text-sm font-medium text-success flex items-center gap-1 justify-center h-9">
                            <CheckCircle2 className="h-4 w-4" /> Finished
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
