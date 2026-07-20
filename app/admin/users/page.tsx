'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
  const [error, setError] = useState('')
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
          setError(fetchError.message)
        } else {
          setUsers(data || [])
        }
      } catch (err) {
        setError('Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [router])

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      case 'tenant':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_banned: false, ban_reason: null } : u))
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
      setUsers((prev) => prev.map((u) => u.id === banningUser ? { ...u, is_banned: true, ban_reason: banReason } : u))
    }
    
    setShowBanModal(false)
    setBanningUser(null)
    setBanReason('')
    setUpdating(null)
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
        <h1 className="text-2xl font-bold text-foreground mb-6">User Management</h1>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading users...</div>
        ) : (
          <div className="overflow-x-auto border border-border rounded-lg">
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
                      <span className={`text-xs px-2 py-1 rounded font-medium ${getRoleColor(user.role)}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.is_banned ? (
                        <span className="text-xs px-2 py-1 rounded font-medium bg-red-100 text-red-800">
                          BANNED
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded font-medium bg-green-100 text-green-800">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleBan(user)}
                        disabled={updating === user.id}
                        className={`text-xs px-3 py-1 rounded border ${
                          user.is_banned 
                            ? 'border-green-600 text-green-600 hover:bg-green-50' 
                            : 'border-red-600 text-red-600 hover:bg-red-50'
                        }`}
                      >
                        {user.is_banned ? 'Unban' : 'Ban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showBanModal && (
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border p-6 rounded-lg w-full max-w-sm">
              <h3 className="font-semibold text-lg mb-2">Ban User</h3>
              <p className="text-sm text-muted-foreground mb-4">Please provide a reason for banning this user.</p>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full border border-border rounded p-2 text-sm mb-4 bg-background"
                placeholder="Reason for ban..."
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowBanModal(false)}
                  className="px-3 py-1.5 text-sm border border-border rounded hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBan}
                  disabled={!banReason}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm Ban
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
