'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { User, Mail, Phone, Calendar, Shield, Save, KeyRound, Link as LinkIcon, Bell, Moon, Sun, Monitor } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'

export function SettingsForm({ profile, role }: { profile: any, role: string }) {
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [phone, setPhone] = useState(profile.phone || '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [password, setPassword] = useState('')
  
  // Theme
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Notifications
  const defaultPrefs = { email: true, sms: false, in_app: true }
  const [notifications, setNotifications] = useState(
    profile.notification_preferences || defaultPrefs
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          notification_preferences: notifications,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (profileError) throw profileError

      // Update password if provided
      if (password) {
        if (password.length < 8) {
          toast.error('Password must be at least 8 characters')
          setLoading(false)
          return
        }
        const { error: authError } = await supabase.auth.updateUser({ password })
        if (authError) throw authError
        setPassword('') // Clear password field on success
      }

      toast.success('Settings updated successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  const getRoleVariant = (r: string) => {
    switch (r) {
      case 'admin': return 'urgent'
      case 'manager': return 'info'
      case 'technician': return 'inProgress'
      case 'tenant': return 'warning'
      default: return 'neutral'
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile" className="h-16 w-16 rounded-full border border-border object-cover" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <User className="h-8 w-8" />
          </div>
        )}
        <div>
          <h3 className="text-xl font-medium text-foreground">{fullName || profile.full_name || 'Not provided'}</h3>
          <p className="text-sm text-muted-foreground">Manage your personal information and preferences</p>
        </div>
      </div>
      
      <form onSubmit={handleSave} className="p-6 space-y-8">
        {/* Editable Fields */}
        <div>
          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-2 flex items-center gap-2">
            <User className="h-4 w-4" /> Profile Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm min-h-[44px]"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-foreground">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm min-h-[44px]"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="avatarUrl" className="text-sm font-medium text-foreground">Avatar URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="avatarUrl"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full pl-9 pr-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm min-h-[44px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div>
          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" /> Security
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-foreground">New Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="newPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full pl-9 pr-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm min-h-[44px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-2 flex items-center gap-2">
            <Bell className="h-4 w-4" /> Preferences
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">Notification Settings</label>
              
              <label className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={notifications.email} 
                  onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm">Email Notifications</span>
              </label>

              <label className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={notifications.sms} 
                  onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm">SMS Notifications</span>
              </label>

              <label className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={notifications.in_app} 
                  onChange={(e) => setNotifications({...notifications, in_app: e.target.checked})}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm">In-App Alerts</span>
              </label>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">App Theme</label>
              {mounted && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('light')}
                    className="flex-1"
                  >
                    <Sun className="h-4 w-4 mr-2" /> Light
                  </Button>
                  <Button
                    type="button"
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                    className="flex-1"
                  >
                    <Moon className="h-4 w-4 mr-2" /> Dark
                  </Button>
                  <Button
                    type="button"
                    variant={theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('system')}
                    className="flex-1"
                  >
                    <Monitor className="h-4 w-4 mr-2" /> System
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Read-only Metadata */}
        <div>
          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Account Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
                <Mail className="h-3 w-3" /> Email Address
              </label>
              <div className="text-sm text-foreground font-medium truncate" title={profile.email}>
                {profile.email || 'Not provided'}
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
                <Shield className="h-3 w-3" /> Account Role
              </label>
              <div>
                <Badge variant={getRoleVariant(role) as any} className="capitalize">
                  {role || 'Not provided'}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
                <Calendar className="h-3 w-3" /> Member Since
              </label>
              <div className="text-sm text-foreground font-medium">
                {new Date(profile.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>

            {profile.manager_code && (
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
                  <Shield className="h-3 w-3" /> Manager Code
                </label>
                <div className="text-sm text-foreground font-mono font-bold bg-muted px-2 py-1 rounded inline-block">
                  {profile.manager_code}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end sticky bottom-0 bg-card py-4 border-t border-border md:static md:bg-transparent md:border-0 md:py-0">
          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            {loading ? 'Saving...' : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
