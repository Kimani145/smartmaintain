'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Technician {
  id: string
  full_name: string
  email: string
  phone: string
  created_at: string
}

export default function ManagerTechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchTechnicians = async () => {
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
          .select('id, full_name, email, phone, created_at')
          .eq('role', 'technician')
          .order('created_at', { ascending: false })

        if (fetchError) {
          setError(fetchError.message)
        } else {
          setTechnicians(data || [])
        }
      } catch (err) {
        setError('Failed to load technicians')
      } finally {
        setLoading(false)
      }
    }

    fetchTechnicians()
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard/manager" className="text-xl font-bold text-foreground">
            SMARTMAINTAIN
          </Link>
          <Link href="/dashboard/manager" className="text-sm text-muted-foreground hover:text-foreground">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Technicians</h1>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading technicians...</div>
        ) : technicians.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No technicians registered yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicians.map((tech) => (
              <div
                key={tech.id}
                className="border border-border rounded-lg p-4 bg-card"
              >
                <h3 className="font-semibold text-foreground">
                  {tech.full_name}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">{tech.email}</p>
                {tech.phone && <p className="text-sm text-muted-foreground">{tech.phone}</p>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
