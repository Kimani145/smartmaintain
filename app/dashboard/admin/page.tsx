import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard/tenant')
  }

  const handleLogout = async () => {
    'use server'
    const supabaseServer = await createClient()
    await supabaseServer.auth.signOut()
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">SMARTMAINTAIN - Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {profile?.full_name}
            </span>
            <form action={handleLogout}>
              <Button type="submit" variant="outline">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-foreground mb-6">Admin Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/users">
            <div className="p-6 border border-border rounded-lg hover:border-primary cursor-pointer bg-card">
              <h3 className="font-semibold text-foreground">User Management</h3>
              <p className="text-sm text-muted-foreground">Manage system users</p>
            </div>
          </Link>

          <Link href="/admin/reports">
            <div className="p-6 border border-border rounded-lg hover:border-primary cursor-pointer bg-card">
              <h3 className="font-semibold text-foreground">Reports</h3>
              <p className="text-sm text-muted-foreground">View system reports</p>
            </div>
          </Link>

          <Link href="/admin/requests">
            <div className="p-6 border border-border rounded-lg hover:border-primary cursor-pointer bg-card">
              <h3 className="font-semibold text-foreground">All Requests</h3>
              <p className="text-sm text-muted-foreground">Monitor all maintenance requests</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
