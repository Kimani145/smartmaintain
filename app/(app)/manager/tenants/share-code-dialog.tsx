'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Share2, Copy, Check } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export function ShareCodeDialog({ managerCode }: { managerCode: string }) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(managerCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="h-4 w-4 mr-2" /> Share Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Share Manager Code</DialogTitle>
          <DialogDescription>
            Give this code to your tenants so they can connect with you.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center space-y-6 py-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <QRCodeSVG 
              value={managerCode} 
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full max-w-[250px]">
            <div className="flex-1 bg-muted px-4 py-2 rounded-md font-mono text-center tracking-widest font-bold text-lg">
              {managerCode}
            </div>
            <Button 
              size="icon" 
              variant="outline" 
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
