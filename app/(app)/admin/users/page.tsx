'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Users } from 'lucide-react'

interface UserProfile {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
  is_banned: boolean
  ban_reason: string | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [banningUser, setBanningUser] = useState<string | null>(null)
  const [banReason, setBanReason] = useState('')
  const [showBanModal, setShowBanModal] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUsers = async () => {
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
          .from('profiles')
          .select('id, full_name, email, role, created_at, is_banned, ban_reason')
          .order('created_at', { ascending: false })

        if (fetchError) {
          toast.error(fetchError.message)
        } else {
          setUsers(data || [])
        }
      } catch (err) {
        toast.error('Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [router])

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'urgent'
      case 'manager':
        return 'info'
      case 'tenant':
        return 'warning'
      default:
        return 'neutral'
    }
  }

  const handleToggleBan = async (user: UserProfile) => {
    if (!user.is_banned) {
      setBanningUser(user.id)
      setShowBanModal(true)
    } else {
      // Unban
      setUpdating(user.id)
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: false, ban_reason: null, appeal_message: null })
        .eq('id', user.id)

      if (!error) {
        toast.success('User unbanned successfully')
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_banned: false, ban_reason: null } : u))
      } else {
        toast.error(error.message)
      }
      setUpdating(null)
    }
  }

  const confirmBan = async () => {
    if (!banningUser || !banReason) return
    setUpdating(banningUser)
    
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: true, ban_reason: banReason })
      .eq('id', banningUser)

    if (!error) {
      toast.success('User banned successfully')
      setUsers((prev) => prev.map((u) => u.id === banningUser ? { ...u, is_banned: true, ban_reason: banReason } : u))
    } else {
      toast.error(error.message)
    }
    
    setShowBanModal(false)
    setBanningUser(null)
    setBanReason('')
    setUpdating(null)
  }

  return (
    <div className="min-h-screen bg-background">
      

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">User Management</h1>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[60px] w-full rounded-lg" />
            <Skeleton className="h-[60px] w-full rounded-lg" />
            <Skeleton className="h-[60px] w-full rounded-lg" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="There are currently no users in the system."
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-accent">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-accent-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-accent-foreground">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-accent-foreground">Role</th>
                    <th className="px-4 py-3 text-left font-medium text-accent-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-accent-foreground">Joined</th>
                    <th className="px-4 py-3 text-left font-medium text-accent-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-accent/50">
                      <td className="px-4 py-3 text-foreground">
                        {user.full_name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={getRoleVariant(user.role) as any}>
                          {user.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {user.is_banned ? (
                          <Badge variant="urgent">
                            BANNED
                          </Badge>
                        ) : (
                          <Badge variant="success">
                            ACTIVE
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant={user.is_banned ? 'outline' : 'destructive'}
                          onClick={() => handleToggleBan(user)}
                          disabled={updating === user.id}
                        >
                          {user.is_banned ? 'Unban' : 'Ban'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {users.map((user) => (
                <div key={user.id} className="border border-border p-4 rounded-lg bg-card shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-foreground">{user.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant={getRoleVariant(user.role) as any}>
                      {user.role.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    {user.is_banned ? (
                      <Badge variant="urgent">BANNED</Badge>
                    ) : (
                      <Badge variant="success">ACTIVE</Badge>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Joined:</span>
                    <span>{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <Button
                      className="w-full"
                      size="sm"
                      variant={user.is_banned ? 'outline' : 'destructive'}
                      onClick={() => handleToggleBan(user)}
                      disabled={updating === user.id}
                    >
                      {user.is_banned ? 'Unban User' : 'Ban User'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <Dialog open={showBanModal} onOpenChange={setShowBanModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ban User</DialogTitle>
              <DialogDescription>
                Please provide a clear reason for banning this user. The reason will be visible to the user.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full border border-border rounded-md p-3 text-sm bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Reason for ban..."
                rows={3}
                aria-label="Reason for ban"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowBanModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmBan}
                disabled={!banReason.trim()}
              >
                Confirm Ban
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
