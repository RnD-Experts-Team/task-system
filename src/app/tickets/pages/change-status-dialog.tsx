// ─── Change Status Dialog ─────────────────────────────────────────────────────
// Modal dialog for changing a ticket's status.
// Calls POST /tickets/{id}/status via the parent's onConfirm callback.
// Shows a dropdown with all available statuses and an error banner on failure.

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Circle, Clock, Loader2 } from "lucide-react"
import type { ApiTicket, ApiTicketStatus } from "@/app/tickets/types"
import { TICKET_STATUS_LABELS } from "@/app/tickets/types"
import { cn } from "@/lib/utils"

// All possible status values for the dropdown
const statusOptions: { value: ApiTicketStatus; label: string; icon: any; color: string }[] = [
  { 
    value: "open",        
    label: TICKET_STATUS_LABELS.open, 
    icon: Circle,
    color: "text-blue-500"
  },
  { 
    value: "in_progress", 
    label: TICKET_STATUS_LABELS.in_progress, 
    icon: Clock,
    color: "text-amber-500"
  },
  { 
    value: "resolved",    
    label: TICKET_STATUS_LABELS.resolved, 
    icon: CheckCircle2,
    color: "text-emerald-500"
  },
]

type ChangeStatusDialogProps = {
  /** The ticket whose status is being changed; null = dialog closed */
  ticket: ApiTicket | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with the ticket and chosen status when user confirms */
  onConfirm: (ticket: ApiTicket, status: ApiTicketStatus) => void
  /** True while the status-change request is in-flight */
  submitting?: boolean
  /** Error from a failed status-change attempt */
  error?: string | null
}

export function ChangeStatusDialog({
  ticket,
  open,
  onOpenChange,
  onConfirm,
  submitting = false,
  error,
}: ChangeStatusDialogProps) {
  // Pre-select the ticket's current status so user sees what it is now
  const [selectedStatus, setSelectedStatus] = useState<ApiTicketStatus>("open")

  useEffect(() => {
    if (open && ticket) {
      setSelectedStatus(ticket.status)
    }
  }, [open, ticket])

  function handleConfirm() {
    if (!ticket) return
    onConfirm(ticket, selectedStatus)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] gap-6 p-6">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-semibold tracking-tight">Update Status</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {ticket
              ? (
                  <span>
                    Moving ticket <span className="font-medium text-foreground">#{ticket.id}</span> to a new phase.
                  </span>
                )
              : "Select the current operational state for this ticket."}
          </DialogDescription>
        </DialogHeader>

        {/* Status select dropdown */}
        <div className="grid gap-4 py-1">
          <div className="space-y-2">
            <Label htmlFor="status-select" className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
              New Status
            </Label>
            <Select
              value={selectedStatus}
              onValueChange={(v) => setSelectedStatus(v as ApiTicketStatus)}
              disabled={submitting}
            >
              <SelectTrigger id="status-select" className="h-12 w-full transition-all hover:bg-muted/50 focus:ring-2 focus:ring-primary/20 bg-background/50 border-muted">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent align="center" className="min-w-[400px]">
                {statusOptions.map((opt) => (
                  <SelectItem 
                    key={opt.value} 
                    value={opt.value}
                    className="py-3 cursor-pointer focus:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <opt.icon className={cn("size-4 shrink-0", opt.color)} />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium leading-none">{opt.label}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error banner — shows API errors */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3.5 text-sm text-destructive animate-in fade-in zoom-in-95 duration-200">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <div className="space-y-1 leading-tight">
                <p className="font-medium">Update Failed</p>
                <p className="text-destructive/90">{error}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 sm:gap-0 border-t pt-4 -mx-6 px-6">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="px-6 h-11 transition-colors hover:bg-muted"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={submitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 h-11 shadow-sm transition-all active:scale-[0.98]"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Updating Status
              </>
            ) : (
              "Apply Change"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
