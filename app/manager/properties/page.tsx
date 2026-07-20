'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Property {
  id: string
  name: string
  location: string
  description: string
}

export default function ManagerPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchProperties = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false })
      if (error) setError(error.message)
      else setProperties(data || [])
      setLoading(false)
    }
    fetchProperties()
  }, [router])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    const supabase = createClient()
    const { data, error } = await supabase.from('properties').insert({ name, location, description }).select().single()
    if (error) {
      setError(error.message)
    } else if (data) {
      setProperties([data, ...properties])
      setName('')
      setLocation('')
      setDescription('')
    }
    setCreating(false)
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
        <h1 className="text-2xl font-bold text-foreground mb-6">Manage Properties</h1>

        {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded mb-4">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <form onSubmit={handleCreate} className="space-y-4 border border-border p-4 rounded-lg bg-card">
              <h2 className="font-semibold text-foreground">Add New Property</h2>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Location</label>
                <input required type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary" rows={3}></textarea>
              </div>
              <Button type="submit" disabled={creating} className="w-full">{creating ? 'Adding...' : 'Add Property'}</Button>
            </form>
          </div>

          <div className="md:col-span-2">
            {loading ? <p>Loading...</p> : (
              <div className="space-y-3">
                {properties.map(p => (
                  <div key={p.id} className="border border-border p-4 rounded-lg bg-card">
                    <h3 className="font-semibold text-foreground">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">{p.location}</p>
                    <p className="text-sm mt-2">{p.description}</p>
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
