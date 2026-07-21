import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, AlertCircle, Building2, ShieldAlert, FileText, CheckCircle2, LayoutDashboard } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { resolveUserRole } from '@/lib/supabase/proxy'

export default async function AdminDashboard() {
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

  if (resolveUserRole(profile) !== 'admin') {
    redirect(`/dashboard/${resolveUserRole(profile)}`)
  }

  const handleLogout = async () => {
    'use server'
    const supabaseServer = await createClient()
    await supabaseServer.auth.signOut()
    redirect('/auth/login')
  }

  // Fetch KPIs
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    
  const { count: activeBans } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('is_banned', true)

  const { count: totalProperties } = await supabase
    .from('properties')
    .select('id', { count: 'exact', head: true })

  const { count: pendingReports } = await supabase
    .from('user_reports')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Fetch Recent Reports
  const { data: recentReports } = await supabase
    .from('user_reports')
    .select(`
      id, status, created_at,
      reporter:profiles!user_reports_reporter_id_fkey(full_name),
      reported:profiles!user_reports_reported_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-background">
      

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">System Administration</h2>
          <p className="text-muted-foreground text-sm">Global overview of platform health, users, and moderation.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers || 0}</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Bans</CardTitle>
              <ShieldAlert className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBans || 0}</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Properties</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProperties || 0}</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reports</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReports || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight">Recent User Reports</h3>
              <Link href="/admin/reports">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            
            <Card>
              {recentReports && recentReports.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentReports.map((report: any) => (
                    <div key={report.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {report.reporter?.full_name} reported {report.reported?.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {report.status === 'pending' && <Badge variant="warning">Pending</Badge>}
                        {report.status === 'investigating' && <Badge variant="inProgress">Investigating</Badge>}
                        {report.status === 'resolved' && <Badge variant="success">Resolved</Badge>}
                        {report.status === 'dismissed' && <Badge variant="neutral">Dismissed</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No recent reports</p>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">Quick Actions</h3>
            <div className="grid gap-2">
              <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded-md border border-border bg-card hover:bg-muted/50 transition-colors">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Manage Users</span>
              </Link>
              <Link href="/admin/reports" className="flex items-center gap-3 p-3 rounded-md border border-border bg-card hover:bg-muted/50 transition-colors">
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Review Reports</span>
              </Link>
              <Link href="/admin/requests" className="flex items-center gap-3 p-3 rounded-md border border-border bg-card hover:bg-muted/50 transition-colors">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">System Requests</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
