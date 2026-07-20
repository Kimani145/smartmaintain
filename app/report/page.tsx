'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function ReportUserPage() {
  const [users, setUsers] = useState<{ id: string, full_name: string, role: string }[]>([])
  const [reportedId, setReportedId] = useState('')
  const [reason, setReason] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportedId || !reason) return

    setLoading(true)
    setError('')

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
          reported_id: reportedId,
          reason,
          images: uploadedImages,
        })

      if (reportError) throw reportError

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Report a User</h1>
        <p className="text-muted-foreground mb-6">
          Use this form to report inappropriate behavior, maintenance violations, or other issues.
        </p>

        {success ? (
          <div className="bg-green-100 text-green-800 p-4 rounded-md">
            Report submitted successfully. We will investigate this shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Select User
              </label>
              <select
                value={reportedId}
                onChange={(e) => setReportedId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="" disabled>Select a user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Reason for Report
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Please describe the issue in detail..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Attach Evidence (Screenshots/Images)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              <p className="text-xs text-muted-foreground mt-1">Optional, maximum 5MB per image.</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
