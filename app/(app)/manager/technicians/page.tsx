'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { EmptyState } from '@/components/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Wrench, Phone, Mail, Clock } from 'lucide-react'
import { AddTechnicianDialog } from './add-technician-dialog'
import { Badge } from '@/components/ui/badge'

interface Technician {
  id: string
  full_name: string
  email: string
  phone: string
  is_banned: boolean
}

export default function ManagerTechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, is_banned')
        .eq('role', 'technician')
        .eq('manager_id', user.id)
      
      if (error) {
        toast.error('Failed to load technicians')
      } else {
        setTechnicians(data || [])
      }
      
      setLoading(false)
    }
    fetchData()
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-foreground">Manage Technicians</h1>
          <AddTechnicianDialog />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-[180px] w-full rounded-lg" />
            <Skeleton className="h-[180px] w-full rounded-lg" />
            <Skeleton className="h-[180px] w-full rounded-lg" />
          </div>
        ) : technicians.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No technicians found"
            description="You haven't provisioned any technicians yet. Add a technician to start assigning maintenance requests."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicians.map(tech => (
              <div key={tech.id} className="border border-border p-6 rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{tech.full_name}</h3>
                      <Badge variant={tech.is_banned ? 'destructive' : 'success'} className="mt-1">
                        {tech.is_banned ? 'Disabled' : 'Active'}
                      </Badge>
                    </div>
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <Wrench className="h-5 w-5" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      {tech.email}
                    </div>
                    {tech.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 mr-2" />
                        {tech.phone}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t flex justify-end">
                  <Badge variant="outline" className="text-xs flex items-center bg-background">
                    <Clock className="h-3 w-3 mr-1" />
                    Assigned to you
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
