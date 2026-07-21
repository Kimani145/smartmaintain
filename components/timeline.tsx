import { CheckCircle2, Circle, Clock, ClipboardCheck, Wrench, PackageCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export type RequestStatus = 'submitted' | 'manager_reviewed' | 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'archived' | 'pending' | 'rejected' | 'cancelled'

const statusOrder: { id: string; label: string; icon: any }[] = [
  { id: 'submitted', label: 'Submitted', icon: Clock },
  { id: 'manager_reviewed', label: 'Reviewed', icon: ClipboardCheck },
  { id: 'assigned', label: 'Assigned', icon: Wrench },
  { id: 'in_progress', label: 'In Progress', icon: Wrench },
  { id: 'completed', label: 'Completed', icon: PackageCheck },
]

export function RequestTimeline({ status }: { status: RequestStatus }) {
  // Map old statuses to new workflow for UI rendering
  const normalizedStatus = 
    status === 'pending' ? 'submitted' : 
    (status === 'rejected' || status === 'cancelled') ? 'archived' : 
    status === 'accepted' ? 'assigned' :
    status

  if (normalizedStatus === 'archived') {
    return (
      <div className="flex items-center gap-2 text-muted-foreground p-4 bg-muted rounded-lg">
        <Circle className="h-5 w-5" />
        <span className="font-medium text-sm">Request Archived</span>
      </div>
    )
  }

  const currentIndex = statusOrder.findIndex(s => s.id === normalizedStatus)
  const activeIndex = currentIndex === -1 ? 0 : currentIndex

  return (
    <div className="py-4">
      {/* Mobile Vertical View (< sm) */}
      <div className="sm:hidden space-y-4 relative pl-4 border-l-2 border-border ml-3 my-2">
        {statusOrder.map((step, index) => {
          const isCompleted = index < activeIndex
          const isCurrent = index === activeIndex
          const isPending = index > activeIndex
          const Icon = step.icon

          return (
            <div key={step.id} className="relative flex items-center gap-3">
              <div 
                className={cn(
                  "absolute -left-[25px] h-8 w-8 rounded-full border-2 flex items-center justify-center bg-card transition-colors duration-300 shrink-0",
                  isCompleted ? "border-primary bg-primary text-primary-foreground" : 
                  isCurrent ? "border-primary text-primary ring-4 ring-primary/20" : 
                  "border-border text-muted-foreground"
                )}
              >
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <div className="pl-4">
                <p className={cn(
                  "text-sm font-semibold",
                  (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isCompleted ? 'Completed' : isCurrent ? 'Current Status' : 'Pending'}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop Horizontal View (>= sm) */}
      <div className="hidden sm:block pt-4 pb-8">
        <div className="flex items-center justify-between relative px-6">
          <div className="absolute left-10 right-10 top-5 -translate-y-1/2 h-1 bg-border rounded-full z-0" />
          <div 
            className="absolute left-10 top-5 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500 ease-in-out" 
            style={{ 
              width: activeIndex === 0 ? '0%' : `calc(${(activeIndex / (statusOrder.length - 1)) * 100}% - 40px)` 
            }}
          />
          
          {statusOrder.map((step, index) => {
            const isCompleted = index < activeIndex
            const isCurrent = index === activeIndex
            const isPending = index > activeIndex
            const Icon = step.icon

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                <div 
                  className={cn(
                    "h-10 w-10 rounded-full border-2 flex items-center justify-center bg-card transition-colors duration-300",
                    isCompleted ? "border-primary bg-primary text-primary-foreground" : 
                    isCurrent ? "border-primary text-primary ring-4 ring-primary/20" : 
                    "border-border text-muted-foreground"
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={cn(
                  "text-xs font-medium text-center whitespace-nowrap",
                  (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
