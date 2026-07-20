'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Tenant {
  id: string
  full_name: string
  email: string
  phone: string
}
interface Unit {
  id: string
  unit_number: string
  property_id: string
  tenant_id: string | null
  properties?: { name: string } | { name: string }[] | null
}

export default function ManagerTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      const [tData, uData] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email, phone').eq('role', 'tenant'),
        supabase.from('units').select('id, unit_number, tenant_id, property_id, properties(name)')
      ])
      
      if (tData.error) setError(tData.error.message)
      else setTenants(tData.data || [])
      
      if (uData.data) setUnits(uData.data)
      
      setLoading(false)
    }
    fetchData()
  }, [router])

  const handleAssign = async (tenantId: string, unitId: string) => {
    setAssigningId(tenantId)
    setError('')
    const supabase = createClient()
    
    // First, unassign tenant from any previous unit
    await supabase.from('units').update({ tenant_id: null, status: 'vacant' }).eq('tenant_id', tenantId)
    
    if (unitId) {
      // Assign to new unit
      const { error } = await supabase.from('units').update({ tenant_id: tenantId, status: 'occupied' }).eq('id', unitId)
      if (error) setError(error.message)
    }
    
    // Refresh units
    const { data } = await supabase.from('units').select('id, unit_number, tenant_id, property_id, properties(name)')
    if (data) setUnits(data)
    
    setAssigningId(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard/manager" className="text-xl font-bold text-foreground">SMARTMAINTAIN</Link>
          <div className="flex gap-4">
            <Link href="/manager/units" className="text-sm text-muted-foreground hover:text-foreground">Units</Link>
            <Link href="/dashboard/manager" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Manage Tenants</h1>

        {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded mb-4">{error}</div>}

        {loading ? <p>Loading...</p> : (
          <div className="space-y-4">
            {tenants.map(tenant => {
              const assignedUnit = units.find(u => u.tenant_id === tenant.id)
              return (
                <div key={tenant.id} className="border border-border p-4 rounded-lg bg-card flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-foreground">{tenant.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{tenant.email}</p>
                  </div>
                  <div className="w-64">
                    <label className="text-xs text-muted-foreground mb-1 block">Assigned Unit</label>
                    <select
                      value={assignedUnit?.id || ''}
                      onChange={(e) => handleAssign(tenant.id, e.target.value)}
                      disabled={assigningId === tenant.id}
                      className="w-full px-2 py-1 border border-border rounded text-sm bg-background text-foreground"
                    >
                      <option value="">Unassigned</option>
                      {units.filter(u => u.tenant_id === null || u.tenant_id === tenant.id).map(u => (
                        <option key={u.id} value={u.id}>
                          {Array.isArray(u.properties) ? u.properties[0]?.name : u.properties?.name} - Unit {u.unit_number}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
