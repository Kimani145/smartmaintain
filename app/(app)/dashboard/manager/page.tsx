import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Home, Users, Wrench, AlertTriangle, CheckCircle2, AlertCircle, LayoutDashboard } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { resolveUserRole } from '@/lib/supabase/proxy'

export default async function ManagerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (resolveUserRole(profile) !== 'manager') {
    redirect(`/dashboard/${resolveUserRole(profile)}`)
  }

  const handleLogout = async () => {
    'use server'
    const supabaseServer = await createClient()
    await supabaseServer.auth.signOut()
    redirect('/auth/login')
  }

  // Fetch KPIs
  const { data: properties } = await supabase
    .from('properties')
    .select('id')

  const propertyIds = properties?.map((p) => p.id) || []

  // Total properties
  const totalProperties = propertyIds.length

  // Total units
  let totalUnitsQuery = supabase
    .from('units')
    .select('id', { count: 'exact', head: true })
  if (propertyIds.length > 0) {
    totalUnitsQuery = totalUnitsQuery.in('property_id', propertyIds)
  }
  const { count: totalUnits } = await totalUnitsQuery

  // Active tenants
  let activeTenantsQuery = supabase
    .from('units')
    .select('id', { count: 'exact', head: true })
    .not('tenant_id', 'is', null)
  if (propertyIds.length > 0) {
    activeTenantsQuery = activeTenantsQuery.in('property_id', propertyIds)
  }
  const { count: activeTenants } = await activeTenantsQuery

  // Pending requests
  let pendingRequestsQuery = supabase
    .from('maintenance_requests')
    .select('id', { count: 'exact', head: true })
    .in('status', ['submitted', 'manager_reviewed', 'pending'])
  if (propertyIds.length > 0) {
    pendingRequestsQuery = pendingRequestsQuery.in('property_id', propertyIds)
  }
  const { count: pendingRequests } = await pendingRequestsQuery

  // Recent requests
  let recentRequestsQuery = supabase
    .from('maintenance_requests')
    .select(`
      id, title, status, priority, created_at,
      unit:units!unit_id(unit_number, property:properties!property_id(name)),
      tenant:profiles!tenant_id(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  if (propertyIds.length > 0) {
    recentRequestsQuery = recentRequestsQuery.in('property_id', propertyIds)
  }

  const { data: recentRequests, error: recentRequestsError } = await recentRequestsQuery

  if (recentRequestsError) {
    console.error('Error fetching recent requests for manager dashboard:', recentRequestsError)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Manager Dashboard</h2>
          <p className="text-muted-foreground text-sm">Overview of your properties, units, and maintenance tasks.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            href="/manager/properties" 
            className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Total Properties metric card. Click to view properties."
          >
            <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Properties</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProperties}</div>
              </CardContent>
            </Card>
          </Link>

          <Link 
            href="/manager/units" 
            className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Total Units metric card. Click to view units."
          >
            <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Units</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUnits || 0}</div>
              </CardContent>
            </Card>
          </Link>

          <Link 
            href="/manager/tenants" 
            className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Active Tenants metric card. Click to view tenants."
          >
            <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Tenants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeTenants || 0}</div>
              </CardContent>
            </Card>
          </Link>

          <Link 
            href="/manager/requests?status=submitted" 
            className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Pending Requests metric card. Click to view pending requests."
          >
            <Card className="hover:shadow-md hover:border-amber-500/50 transition-all cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingRequests || 0}</div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight">Recent Maintenance Requests</h3>
              <Link href="/manager/requests">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            
            <Card>
              {recentRequests && recentRequests.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentRequests.map((req: any) => (
                    <div key={req.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{req.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {req.unit?.property?.name} - Unit {req.unit?.unit_number} • {req.tenant?.full_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {req.priority === 'high' && <Badge variant="urgent">High</Badge>}
                        {(req.status === 'pending' || req.status === 'submitted') && <Badge variant="warning">Submitted</Badge>}
                        {req.status === 'in_progress' && <Badge variant="inProgress">In Progress</Badge>}
                        {req.status === 'completed' && <Badge variant="success">Completed</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No recent requests</p>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">Quick Actions</h3>
            <div className="grid gap-2">
              <Link href="/manager/properties" className="flex items-center gap-3 p-3 rounded-md border border-border bg-card hover:bg-muted/50 transition-colors">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Add Property</span>
              </Link>
              <Link href="/manager/units" className="flex items-center gap-3 p-3 rounded-md border border-border bg-card hover:bg-muted/50 transition-colors">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Add Unit</span>
              </Link>
              <Link href="/manager/tenants" className="flex items-center gap-3 p-3 rounded-md border border-border bg-card hover:bg-muted/50 transition-colors">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Add Tenant</span>
              </Link>
              <Link href="/manager/technicians" className="flex items-center gap-3 p-3 rounded-md border border-border bg-card hover:bg-muted/50 transition-colors">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Add Technician</span>
              </Link>
              <Link href="/manager/requests" className="flex items-center gap-3 p-3 rounded-md border border-border bg-card hover:bg-muted/50 transition-colors">
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">View Requests</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
