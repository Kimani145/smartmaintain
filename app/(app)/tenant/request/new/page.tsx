'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createNotification } from '@/lib/notifications'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const CATEGORIES = ['Plumbing', 'Electrical', 'HVAC', 'Appliances', 'Pest Control', 'General Maintenance', 'Other'] as const
const PRIORITIES = ['low', 'normal', 'high'] as const

const requestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Please provide more details in the description'),
  category: z.enum(CATEGORIES),
  priority: z.enum(PRIORITIES),
})

type RequestFormValues = z.infer<typeof requestSchema>

export default function NewRequestPage() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema as any),
    defaultValues: {
      title: '',
      description: '',
      category: 'General Maintenance',
      priority: 'normal',
    },
  })

  const onSubmit = async (data: RequestFormValues) => {
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Not authenticated')
        router.push('/auth/login')
        return
      }

      const { data: unitData, error: unitError } = await supabase
        .from('units')
        .select('id, property_id')
        .eq('tenant_id', user.id)
        .single()

      if (unitError || !unitData) {
        toast.error('You are not assigned to a unit. Cannot create request.')
        setLoading(false)
        return
      }

      const { data: requestData, error: insertError } = await supabase.from('maintenance_requests').insert({
        tenant_id: user.id,
        property_id: unitData.property_id,
        unit_id: unitData.id,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        status: 'submitted',
      }).select().single()

      if (insertError || !requestData) {
        toast.error(insertError?.message || 'Failed to create request')
        setLoading(false)
        return
      }

      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${requestData.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
          const { error: uploadError } = await supabase.storage
            .from('maintenance-images')
            .upload(fileName, file)

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('maintenance-images')
              .getPublicUrl(fileName)

            await supabase.from('attachments').insert({
              request_id: requestData.id,
              url: publicUrl
            })
          }
        }
      }

      // Notify the tenant's manager about new request
      const { data: connection } = await supabase
        .from('tenant_connections')
        .select('manager_id')
        .eq('tenant_id', user.id)
        .eq('status', 'approved')
        .single()

      if (connection?.manager_id) {
        await createNotification({
          user_id: connection.manager_id,
          type: 'request_created',
          message: `New maintenance request: ${data.title}`,
        })
      }

      toast.success('Maintenance request submitted successfully')
      router.push('/tenant/requests')
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground mb-6">Submit Maintenance Request</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Title <span className="text-destructive">*</span>
              </label>
              <input
                id="title"
                {...register('title')}
                type="text"
                placeholder="e.g., Leaky kitchen faucet"
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? "title-error" : undefined}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary aria-invalid:border-destructive transition-colors text-sm min-h-[44px]"
              />
              {errors.title && (
                <p id="title-error" role="alert" className="text-xs text-destructive mt-1 font-medium">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                id="description"
                {...register('description')}
                placeholder="Describe the issue in detail..."
                rows={4}
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? "description-error" : undefined}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary aria-invalid:border-destructive transition-colors text-sm"
              />
              {errors.description && (
                <p id="description-error" role="alert" className="text-xs text-destructive mt-1 font-medium">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                  Category <span className="text-destructive">*</span>
                </label>
                <select
                  id="category"
                  {...register('category')}
                  aria-invalid={!!errors.category}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm min-h-[44px]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p role="alert" className="text-xs text-destructive mt-1 font-medium">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  {...register('priority')}
                  aria-invalid={!!errors.priority}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm min-h-[44px]"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.priority && (
                  <p role="alert" className="text-xs text-destructive mt-1 font-medium">{errors.priority.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="images" className="block text-sm font-medium text-foreground mb-2">
                Images
              </label>
              <input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              <p className="text-xs text-muted-foreground mt-1">You can select multiple images.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1 min-h-[44px]">
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
              <Link href="/tenant/requests" className="flex-1">
                <Button type="button" variant="outline" className="w-full min-h-[44px]">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
