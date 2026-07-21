'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'
import { EmptyState } from '@/components/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Home } from 'lucide-react'

interface Unit {
  id: string
  property_id: string
  unit_number: string
  floor: string
  status: string
  rent: number
  properties?: { name: string } | { name: string }[] | null
}
interface Property { id: string, name: string }

export default function ManagerUnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [propertyId, setPropertyId] = useState('')
  const [unitNumber, setUnitNumber] = useState('')
  const [floor, setFloor] = useState('')
  const [rent, setRent] = useState('')
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      const [uData, pData] = await Promise.all([
        supabase.from('units').select('*, properties(name)').order('created_at', { ascending: false }),
        supabase.from('properties').select('id, name')
      ])
      if (uData.error) toast.error(uData.error.message)
      else setUnits(uData.data || [])
      if (pData.data) {
        setProperties(pData.data)
        if (pData.data.length > 0) setPropertyId(pData.data[0].id)
      }
      setLoading(false)
    }
    fetchData()
  }, [router])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('units').insert({ property_id: propertyId, unit_number: unitNumber, floor, rent: parseFloat(rent) || 0 }).select('*, properties(name)').single()
    if (error) {
      toast.error(error.message)
    } else if (data) {
      toast.success('Unit created successfully')
      setUnits([data, ...units])
      setUnitNumber('')
      setFloor('')
      setRent('')
    }
    setCreating(false)
  }

  return (
    <div className="min-h-screen bg-background">
      

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Manage Units</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <form onSubmit={handleCreate} className="space-y-4 border border-border p-4 rounded-lg bg-card">
              <h2 className="font-semibold text-foreground">Add New Unit</h2>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Property</label>
                <select required value={propertyId} onChange={e => setPropertyId(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary">
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Unit Number</label>
                <input required type="text" value={unitNumber} onChange={e => setUnitNumber(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Floor</label>
                <input type="text" value={floor} onChange={e => setFloor(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Rent</label>
                <input required type="number" step="0.01" value={rent} onChange={e => setRent(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary" />
              </div>
              <Button type="submit" disabled={creating} className="w-full">{creating ? 'Adding...' : 'Add Unit'}</Button>
            </form>
          </div>

          <div className="md:col-span-2">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-[80px] w-full rounded-lg" />
                <Skeleton className="h-[80px] w-full rounded-lg" />
                <Skeleton className="h-[80px] w-full rounded-lg" />
              </div>
            ) : units.length === 0 ? (
              <EmptyState
                icon={Home}
                title="No units found"
                description="Create your first unit to manage it."
              />
            ) : (
              <div className="space-y-3">
                {units.map(u => (
                  <div key={u.id} className="border border-border p-4 rounded-lg bg-card shadow-sm flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {Array.isArray(u.properties) ? u.properties[0]?.name : u.properties?.name} - Unit {u.unit_number}
                      </h3>
                      <p className="text-sm text-muted-foreground">Floor: {u.floor} | Rent: ${u.rent}</p>
                    </div>
                    <div>
                      {u.status === 'vacant' ? (
                        <Badge variant="success">VACANT</Badge>
                      ) : (
                        <Badge variant="info">OCCUPIED</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
