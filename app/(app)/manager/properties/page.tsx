'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'
import { EmptyState } from '@/components/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Building } from 'lucide-react'

interface Property {
  id: string
  name: string
  location: string
  description: string
}

export default function ManagerPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
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
      if (error) toast.error(error.message)
      else setProperties(data || [])
      setLoading(false)
    }
    fetchProperties()
  }, [router])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('properties').insert({ name, location, description }).select().single()
    if (error) {
      toast.error(error.message)
    } else if (data) {
      toast.success('Property created successfully')
      setProperties([data, ...properties])
      setName('')
      setLocation('')
      setDescription('')
    }
    setCreating(false)
  }

  return (
    <div className="min-h-screen bg-background">
      

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Manage Properties</h1>

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
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-[100px] w-full rounded-lg" />
                <Skeleton className="h-[100px] w-full rounded-lg" />
              </div>
            ) : properties.length === 0 ? (
              <EmptyState
                icon={Building}
                title="No properties yet"
                description="Add your first property using the form."
              />
            ) : (
              <div className="space-y-3">
                {properties.map(p => (
                  <div key={p.id} className="border border-border p-4 rounded-lg bg-card shadow-sm">
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
