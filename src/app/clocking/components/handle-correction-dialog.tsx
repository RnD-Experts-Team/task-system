// src/app/clocking/components/handle-correction-dialog.tsx
// Dialog for managers to approve or reject a pending correction request.
// Calls POST /clocking/manager/correction/{id}/handle on submit.

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Clock, Shield } from "lucide-react"
import { isCancel } from "axios"
import type { PendingCorrectionApiItem } from "../data"
import { managerClockingService } from "@/services/managerClockingService"

// Human-readable label for API correction_type values
const correctionTypeLabels: Record<string, string> = {
  clock_in:  "Clock In",
  clock_out: "Clock Out",
  break_in:  "Break Start",
  break_out: "Break End",
}

// Format a UTC ISO string to a locale date+time
function formatUtc(utc: string): string {
  return new Date(utc).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

interface HandleCorrectionDialogProps {
  correction: PendingCorrectionApiItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with the updated correction after approve/reject */
  onHandled: (updated: PendingCorrectionApiItem) => void
}

const MAX_NOTES = 500

export function HandleCorrectionDialog({
  correction,
  open,
  onOpenChange,
  onHandled,
}: HandleCorrectionDialogProps) {
  const [adminNotes, setAdminNotes] = useState("")
  const [saving, setSaving] = useState(false)
  // Track which button triggered the submit so we can show the right spinner
  const [pendingAction, setPendingAction] = useState<"approve" | "reject" | null>(null)

  if (!correction) return null

  function handleClose() {
    setAdminNotes("")
    setPendingAction(null)
    onOpenChange(false)
  }

  async function handleAction(action: "approve" | "reject") {
    if (!correction) return
    setSaving(true)
    setPendingAction(action)
    try {
      const updated = await managerClockingService.handleCorrection(correction.id, {
        action,
        admin_notes: adminNotes.trim() || null,
      })
      onHandled(updated)
      handleClose()
    } catch (err) {
      // Ignore cancellations — interceptor handles toast for real errors
      if (!isCancel(err)) {
        // no-op
      }
    } finally {
      setSaving(false)
      setPendingAction(null)
    }
  }

  const typeLabel = correctionTypeLabels[correction.correction_type] ?? correction.correction_type
  const refId = `CRR-${String(correction.id).padStart(4, "0")}`
  // Get user initials from the nested session's user if available
  const userName = correction.clock_session?.user?.name ?? `User #${correction.user_id}`
  const userEmail = correction.clock_session?.user?.email ?? ""
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg overflow-hidden p-0 border-0 shadow-2xl">
        <div className="px-6 pt-6 pb-4 bg-muted/30 border-b border-border/50">
          <DialogHeader className="gap-1">
            <div className="mb-1 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5">
              <Shield className="size-3 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                Review Correction
              </span>
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">
              Handle Correction Request
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Approve or reject the correction request. Admin notes are optional.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Employee info */}
          <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-background p-4 shadow-sm">
            <Avatar className="size-11 rounded-lg border border-border/50 shadow-sm">
              <AvatarFallback className="rounded-lg bg-primary/10 text-sm font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
            </div>
            <Badge variant="secondary" className="ml-auto shrink-0 gap-1.5 px-2 py-1 bg-muted">
              <Clock className="size-3" />
              {typeLabel}
            </Badge>
          </div>

          {/* Time comparison */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/50 bg-background p-4 shadow-sm flex flex-col justify-center items-center text-center">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Original Time
              </p>
              <p className="font-mono text-sm font-medium">
                {formatUtc(correction.original_time_utc)}
              </p>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 pointer-events-none" />
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary relative z-10">
                Requested Time
              </p>
              <p className="font-mono text-sm font-medium relative z-10">
                {formatUtc(correction.requested_time_utc)}
              </p>
            </div>
          </div>

          {/* Employee's reason */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reason
            </p>
            <p className="rounded-xl border border-border/50 bg-background p-4 text-sm leading-relaxed text-foreground shadow-sm">
              {correction.reason}
            </p>
          </div>

          {/* Admin notes textarea */}
          <div className="space-y-2">
            <Label htmlFor="admin-notes" className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Admin Notes
              <span className="ml-1.5 font-normal text-muted-foreground lowercase tracking-normal">(optional)</span>
            </Label>
            <Textarea
              id="admin-notes"
              placeholder="Add notes visible to the employee…"
              value={adminNotes}
              maxLength={MAX_NOTES}
              rows={3}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="resize-none shadow-sm focus-visible:ring-primary/20"
            />
            <div className="flex justify-between items-center px-1">
               <div className="flex items-center gap-1.5 text-muted-foreground">
                 <Shield className="size-3.5" />
                 <span className="text-[10px] font-semibold uppercase tracking-wider">
                   Ref: {refId}
                 </span>
               </div>
               <p className="text-[11px] text-muted-foreground">
                 {MAX_NOTES - adminNotes.length} chars remaining
               </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={handleClose} disabled={saving} className="sm:w-auto w-full">
              Cancel
            </Button>
            <div className="flex gap-2 sm:ml-auto w-full sm:w-auto">
              <Button
                variant="outline"
                className="gap-1.5 flex-1 sm:flex-none text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive/10 hover:text-destructive"
                disabled={saving}
                onClick={() => handleAction("reject")}
              >
                {saving && pendingAction === "reject"
                  ? <Loader2 className="size-4 animate-spin" />
                  : <XCircle className="size-4" />}
                Reject
              </Button>
              <Button
                className="gap-1.5 flex-1 sm:flex-none shadow-md"
                disabled={saving}
                onClick={() => handleAction("approve")}
              >
                {saving && pendingAction === "approve"
                  ? <Loader2 className="size-4 animate-spin" />
                  : <CheckCircle className="size-4" />}
                Approve
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
