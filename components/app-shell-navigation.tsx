'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Wrench, 
  Bell, 
  Settings,
  LogOut,
  ShieldAlert,
  Home
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function AppShellNavigation({ role, profile }: { role: string, profile: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const getLinks = () => {
    switch (role) {
      case 'manager':
        return [
          { href: '/dashboard/manager', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/manager/properties', label: 'Properties', icon: Building2 },
          { href: '/manager/units', label: 'Units', icon: Home },
          { href: '/manager/tenants', label: 'Tenants', icon: Users },
          { href: '/manager/technicians', label: 'Technicians', icon: Wrench },
          { href: '/manager/requests', label: 'Requests', icon: Wrench },
        ]
      case 'tenant':
        return [
          { href: '/dashboard/tenant', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/tenant/requests', label: 'My Requests', icon: Wrench },
        ]
      case 'technician':
        return [
          { href: '/dashboard/technician', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/technician/work-orders', label: 'Work Orders', icon: Wrench },
        ]
      case 'admin':
        return [
          { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/admin/users', label: 'Users', icon: Users },
          { href: '/admin/reports', label: 'Reports', icon: ShieldAlert },
        ]
      default:
        return []
    }
  }

  const links = getLinks()
  const commonLinks = [
    { href: '/notifications', label: 'Alerts', icon: Bell },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === `/dashboard/${role}`) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-card z-50 flex items-center justify-between px-4">
        <span className="font-bold text-lg text-foreground tracking-tight">SMARTMAINTAIN</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button 
            onClick={handleLogout} 
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card shrink-0 min-h-screen">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="font-bold text-xl text-foreground tracking-tight">SMARTMAINTAIN</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
          <nav aria-label="Main Navigation" className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          <nav aria-label="Account Settings" className="space-y-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
              Account
            </div>
            {commonLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <ThemeToggle />
            </div>
            <button 
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-card z-50 flex items-center justify-around px-1 pb-safe">
        {[...links.slice(0, 3), commonLinks[0], commonLinks[1]].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center w-full h-full py-1 min-h-[44px] space-y-0.5 ${
              isActive(link.href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <link.icon className="h-5 w-5 shrink-0" />
            <span className="text-[10px] font-medium truncate w-full text-center px-1">{link.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
