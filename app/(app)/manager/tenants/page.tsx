'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'
import { EmptyState } from '@/components/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Link2, Check, X } from 'lucide-react'
import { updateConnectionStatus } from '@/app/actions/manager'

import { AddTenantDialog } from './add-tenant-dialog'
import { ShareCodeDialog } from './share-code-dialog'

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
interface ConnectionRequest {
  id: string
  status: string
  tenant: {
    id: string
    full_name: string
    email: string
  }
}

export default function ManagerTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [pendingConnections, setPendingConnections] = useState<ConnectionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [managerCode, setManagerCode] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      const [tData, uData, cData, pData] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email, phone').eq('role', 'tenant'),
        supabase.from('units').select('id, unit_number, tenant_id, property_id, properties(name)'),
        supabase.from('tenant_connections')
          .select('id, status, tenant:profiles!tenant_connections_tenant_id_fkey(id, full_name, email)')
          .eq('status', 'pending')
          .eq('manager_id', user.id),
        supabase.from('profiles').select('manager_code').eq('id', user.id).single()
      ])
      
      if (tData.error) toast.error(tData.error.message)
      else setTenants(tData.data || [])
      
      if (uData.data) setUnits(uData.data)

      if (cData.data) {
        // tenant_connections query returns tenant as array of objects or object depending on relationship.
        // Usually it's a single object since it's a many-to-one relationship.
        setPendingConnections(cData.data as any)
      }
      
      if (pData.data) {
        setManagerCode(pData.data.manager_code)
      }
      
      setLoading(false)
    }
    fetchData()
  }, [router])

  const handleAssign = async (tenantId: string, unitId: string) => {
    setAssigningId(tenantId)
    const supabase = createClient()
    
    // First, unassign tenant from any previous unit
    await supabase.from('units').update({ tenant_id: null, status: 'vacant' }).eq('tenant_id', tenantId)
    
    if (unitId) {
      // Assign to new unit
      const { error } = await supabase.from('units').update({ tenant_id: tenantId, status: 'occupied' }).eq('id', unitId)
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Tenant assigned successfully')
      }
    } else {
      toast.success('Tenant unassigned successfully')
    }
    
    // Refresh units
    const { data } = await supabase.from('units').select('id, unit_number, tenant_id, property_id, properties(name)')
    if (data) setUnits(data)
    
    setAssigningId(null)
  }

  const handleConnectionResponse = async (connectionId: string, status: 'approved' | 'rejected') => {
    const result = await updateConnectionStatus(connectionId, status)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Connection ${status}`)
      setPendingConnections(prev => prev.filter(c => c.id !== connectionId))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-foreground">Manage Tenants</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            {managerCode && <ShareCodeDialog managerCode={managerCode} />}
            <AddTenantDialog />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[80px] w-full rounded-lg" />
            <Skeleton className="h-[80px] w-full rounded-lg" />
            <Skeleton className="h-[80px] w-full rounded-lg" />
          </div>
        ) : (
          <>
            {pendingConnections.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary" /> Pending Connection Requests
                </h2>
                <div className="space-y-3">
                  {pendingConnections.map(conn => (
                    <div key={conn.id} className="border border-primary/20 bg-primary/5 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{conn.tenant.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{conn.tenant.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleConnectionResponse(conn.id, 'rejected')}
                        >
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleConnectionResponse(conn.id, 'approved')}
                        >
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Active Tenants</h2>
              {tenants.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No tenants found"
                  description="There are currently no registered tenants in the system."
                />
              ) : (
                <div className="space-y-4">
                  {tenants.map(tenant => {
                    const assignedUnit = units.find(u => u.tenant_id === tenant.id)
                    return (
                      <div key={tenant.id} className="border border-border p-4 rounded-lg bg-card shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-foreground">{tenant.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{tenant.email}</p>
                        </div>
                        <div className="w-full sm:w-64">
                          <label className="text-xs text-muted-foreground mb-1 block">Assigned Unit</label>
                          <select
                            value={assignedUnit?.id || ''}
                            onChange={(e) => handleAssign(tenant.id, e.target.value)}
                            disabled={assigningId === tenant.id}
                            className="w-full px-2 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:ring-2 focus:ring-primary"
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
            </div>
          </>
        )}
      </main>
    </div>
  )
}
