import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Home, Wrench, CheckCircle2, Settings, Plus, AlertCircle, LayoutDashboard, PackageCheck } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { ConnectManagerCard } from '@/components/tenant/connect-manager-card'

export default async function TenantDashboard() {
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

  const handleLogout = async () => {
    'use server'
    const supabaseServer = await createClient()
    await supabaseServer.auth.signOut()
    redirect('/auth/login')
  }

  // Fetch Unit/Property Context
  const { data: unitData } = await supabase
    .from('units')
    .select(`
      unit_number,
      property:properties(name, location)
    `)
    .eq('tenant_id', user.id)
    .single()

  // Fetch connection status
  const { data: connection } = await supabase
    .from('tenant_connections')
    .select('status')
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Fetch active requests
  const { count: activeRequests } = await supabase
    .from('maintenance_requests')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', user.id)
    .in('status', ['submitted', 'manager_reviewed', 'assigned', 'accepted', 'in_progress'])

  // Fetch completed requests
  const { count: completedRequests } = await supabase
    .from('maintenance_requests')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', user.id)
    .eq('status', 'completed')

  // Fetch total requests
  const { count: totalRequests } = await supabase
    .from('maintenance_requests')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', user.id)

  // Fetch recent requests
  const { data: recentRequests } = await supabase
    .from('maintenance_requests')
    .select('id, title, status, priority, created_at')
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-background">
      

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back, {profile?.full_name}</h2>
          <p className="text-muted-foreground text-sm">Manage your home and maintenance requests.</p>
        </div>

        {(!unitData && (!connection || connection.status !== 'approved')) && (
          <ConnectManagerCard status={connection?.status as any} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">My Home</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {unitData ? (
                <div>
                  <div className="text-2xl font-bold line-clamp-1 text-ellipsis">
                    {Array.isArray(unitData.property)
                      ? unitData.property[0]?.name
                      : (unitData.property as any)?.name}
                  </div>
                  <p className="text-sm text-muted-foreground">Unit {unitData.unit_number}</p>
                </div>
              ) : (
                <div>
                  <div className="text-lg font-medium text-muted-foreground">Not Assigned</div>
                  <p className="text-sm text-muted-foreground">Contact your manager to be assigned to a unit.</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRequests || 0}</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Requests</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeRequests || 0}</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <PackageCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedRequests || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight">Recent Requests</h3>
              <Link href="/tenant/requests">
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
                          {new Date(req.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {req.priority === 'high' && <Badge variant="urgent">High</Badge>}
                        {req.status === 'pending' && <Badge variant="warning">Pending</Badge>}
                        {req.status === 'in_progress' && <Badge variant="inProgress">In Progress</Badge>}
                        {req.status === 'completed' && <Badge variant="success">Completed</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No recent maintenance requests.</p>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">Quick Actions</h3>
            <div className="grid gap-2">
              <Link href="/tenant/request/new" className="flex items-center gap-3 p-3 rounded-md border border-border bg-card hover:bg-muted/50 transition-colors">
                <Plus className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">New Request</span>
              </Link>
              <Link href="/tenant/requests" className="flex items-center gap-3 p-3 rounded-md border border-border bg-card hover:bg-muted/50 transition-colors">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">My Requests</span>
              </Link>
              <Link href="/dashboard/settings" className="flex items-center gap-3 p-3 rounded-md border border-border bg-card hover:bg-muted/50 transition-colors">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Account Settings</span>
              </Link>
              <Link href="/report" className="flex items-center gap-3 p-3 rounded-md border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Report Issue</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
