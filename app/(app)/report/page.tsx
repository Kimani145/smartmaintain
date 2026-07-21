'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'

const reportSchema = z.object({
  reportedId: z.string().min(1, 'Please select a user to report'),
  reason: z.string().min(10, 'Please provide more details (minimum 10 characters)'),
})

type ReportFormValues = z.infer<typeof reportSchema>

export default function ReportUserPage() {
  const [users, setUsers] = useState<{ id: string, full_name: string, role: string }[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema as any),
    defaultValues: {
      reportedId: '',
      reason: '',
    },
  })

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Fetch users to report. Exclude admins and the current user
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .neq('id', user.id)
        .neq('role', 'admin')
        
      if (!error && data) {
        setUsers(data)
      }
    }
    fetchUsers()
  }, [router, supabase])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const onSubmit = async (data: ReportFormValues) => {
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const uploadedImages: string[] = []

      // Upload images
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('report-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('report-images')
          .getPublicUrl(filePath)

        uploadedImages.push(publicUrlData.publicUrl)
      }

      // Submit report
      const { error: reportError } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: user.id,
          reported_id: data.reportedId,
          reason: data.reason,
          images: uploadedImages,
        })

      if (reportError) throw reportError

      toast.success('Report submitted successfully. We will investigate this shortly.')
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Report a User</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            Use this form to report inappropriate behavior, maintenance violations, or other issues.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="reportedId" className="block text-sm font-medium text-foreground mb-2">
                Select User <span className="text-destructive">*</span>
              </label>
              <select
                id="reportedId"
                {...register('reportedId')}
                aria-invalid={!!errors.reportedId}
                aria-describedby={errors.reportedId ? "reportedId-error" : undefined}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary aria-invalid:border-destructive transition-colors text-sm min-h-[44px]"
              >
                <option value="" disabled>Select a user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.role})
                  </option>
                ))}
              </select>
              {errors.reportedId && (
                <p id="reportedId-error" role="alert" className="text-xs text-destructive mt-1 font-medium">{errors.reportedId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-foreground mb-2">
                Reason for Report <span className="text-destructive">*</span>
              </label>
              <textarea
                id="reason"
                {...register('reason')}
                rows={5}
                aria-invalid={!!errors.reason}
                aria-describedby={errors.reason ? "reason-error" : undefined}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary aria-invalid:border-destructive transition-colors text-sm"
                placeholder="Please describe the issue in detail..."
              />
              {errors.reason && (
                <p id="reason-error" role="alert" className="text-xs text-destructive mt-1 font-medium">{errors.reason.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="evidence" className="block text-sm font-medium text-foreground mb-2">
                Attach Evidence (Screenshots/Images)
              </label>
              <input
                id="evidence"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              <p className="text-xs text-muted-foreground mt-1">Optional, maximum 5MB per image.</p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto min-h-[44px]">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto min-h-[44px]">
                {loading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
