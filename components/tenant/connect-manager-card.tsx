'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Link2, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { connectToManager } from '@/app/actions/tenant'

export function ConnectManagerCard({ status }: { status?: 'pending' | 'approved' | 'rejected' | null }) {
  const [loading, setLoading] = useState(false)
  const [managerCode, setManagerCode] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!managerCode || managerCode.length < 8) {
      toast.error('Please enter a valid manager code.')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('managerCode', managerCode.toUpperCase())

    const result = await connectToManager({}, formData)
    
    if (result.error) {
      toast.error(result.error)
    } else if (result.success) {
      toast.success('Connection request sent! Awaiting manager approval.')
      // In a real app, we might use router.refresh() here, but we let the user know for now.
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }
    
    setLoading(false)
  }

  if (status === 'pending') {
    return (
      <Card className="border-warning/50 bg-warning/5">
        <CardHeader>
          <CardTitle className="text-warning flex items-center gap-2 text-lg">
            <ShieldAlert className="h-5 w-5" /> Connection Pending
          </CardTitle>
          <CardDescription>
            Your request has been sent. Please wait for your property manager to approve your connection and assign you to a unit.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (status === 'approved') {
    return (
      <Card className="border-success/50 bg-success/5">
        <CardHeader>
          <CardTitle className="text-success flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-5 w-5" /> Connected to Manager
          </CardTitle>
          <CardDescription>
            You are successfully connected. Your manager can now assign you to specific units.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" /> Connect to Property Manager
        </CardTitle>
        <CardDescription>
          Enter the unique code provided by your property manager to connect your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <Input 
            value={managerCode}
            onChange={(e) => setManagerCode(e.target.value.toUpperCase())}
            placeholder="e.g. PROP-123" 
            aria-label="Property Manager Code"
            className="font-mono uppercase h-10 flex-1"
            maxLength={10}
            disabled={loading}
          />
          <Button type="submit" disabled={loading} className="h-10 min-w-[100px]">
            {loading ? 'Connecting...' : 'Connect'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
