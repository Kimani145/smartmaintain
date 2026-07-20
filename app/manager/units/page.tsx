'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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
  const [error, setError] = useState('')
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
      if (uData.error) setError(uData.error.message)
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
    setError('')
    const supabase = createClient()
    const { data, error } = await supabase.from('units').insert({ property_id: propertyId, unit_number: unitNumber, floor, rent: parseFloat(rent) || 0 }).select('*, properties(name)').single()
    if (error) {
      setError(error.message)
    } else if (data) {
      setUnits([data, ...units])
      setUnitNumber('')
      setFloor('')
      setRent('')
    }
    setCreating(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard/manager" className="text-xl font-bold text-foreground">SMARTMAINTAIN</Link>
          <div className="flex gap-4">
            <Link href="/manager/properties" className="text-sm text-muted-foreground hover:text-foreground">Properties</Link>
            <Link href="/manager/tenants" className="text-sm text-muted-foreground hover:text-foreground">Tenants</Link>
            <Link href="/dashboard/manager" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Manage Units</h1>

        {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded mb-4">{error}</div>}

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
            {loading ? <p>Loading...</p> : (
              <div className="space-y-3">
                {units.map(u => (
                  <div key={u.id} className="border border-border p-4 rounded-lg bg-card flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {Array.isArray(u.properties) ? u.properties[0]?.name : u.properties?.name} - Unit {u.unit_number}
                      </h3>
                      <p className="text-sm text-muted-foreground">Floor: {u.floor} | Rent: ${u.rent}</p>
                    </div>
                    <div>
                      <span className={`text-xs px-2 py-1 rounded ${u.status === 'vacant' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{u.status.toUpperCase()}</span>
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
