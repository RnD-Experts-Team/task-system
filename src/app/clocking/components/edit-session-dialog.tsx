// src/app/clocking/components/edit-session-dialog.tsx
// Dialog for managers to directly edit a clock session's clock-in / clock-out times.
// Calls PUT /clocking/manager/session/{id}/edit on submit.

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DateInput } from "@/components/ui/date-input"
import { Loader2, Pencil, Clock } from "lucide-react"
import { isCancel } from "axios"
import { toast } from "sonner"
import type { ClockRecordApiItem } from "../data"
import { managerClockingService } from "@/services/managerClockingService"

interface EditSessionDialogProps {
  /** Session to edit — null means the dialog is hidden */
  session: ClockRecordApiItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with the updated session after a successful save */
  onSaved: (updated: ClockRecordApiItem) => void
}

// Convert a UTC ISO string to a datetime-local value (YYYY-MM-DDTHH:mm)
function toLocalInput(utc: string | null): string {
  if (!utc) return ""
  // Date object interprets the UTC string and toISOString keeps it in UTC;
  // we need the local representation for the input element.
  const d = new Date(utc)
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  )
}

// Convert a datetime-local value back to a UTC ISO string (seconds = 00)
function toUtcIso(localValue: string): string {
  if (!localValue) return ""
  // localValue is "YYYY-MM-DDTHH:mm" in the user's local timezone
  const d = new Date(localValue)
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:00Z`
  )
}

export function EditSessionDialog({
  session,
  open,
  onOpenChange,
  onSaved,
}: EditSessionDialogProps) {
  // Controlled inputs for the two datetime-local fields
  const [clockIn, setClockIn] = useState("")
  const [clockOut, setClockOut] = useState("")
  const [saving, setSaving] = useState(false)

  // Populate fields whenever a new session is passed in
  useEffect(() => {
    if (session) {
      setClockIn(toLocalInput(session.clock_in_utc))
      setClockOut(toLocalInput(session.clock_out_utc))
    }
  }, [session])

  if (!session) return null

  function handleClose() {
    onOpenChange(false)
  }

  async function handleSave() {
    if (!session) return

    // At least one field must be filled
    if (!clockIn && !clockOut) {
      toast.error("Please fill in at least one time field.")
      return
    }

    setSaving(true)
    try {
      const updated = await managerClockingService.editSession(session.id, {
        clock_in_utc:  clockIn  ? toUtcIso(clockIn)  : null,
        clock_out_utc: clockOut ? toUtcIso(clockOut) : null,
      })
      onSaved(updated)
      handleClose()
    } catch (err) {
      // Ignore request cancellations — api interceptor already toasts the error
      if (!isCancel(err)) {
        // no-op: the interceptor already showed a toast
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0 border-0 shadow-2xl">
        <div className="px-6 pt-6 pb-4 bg-muted/30 border-b border-border/50">
          <DialogHeader className="gap-1">
            <div className="mb-1 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5">
              <Pencil className="size-3 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                Edit Session
              </span>
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">
              Edit Clock Session
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Update the clock-in or clock-out time for session #{session.id}.
              Times are entered in your local timezone and saved as UTC.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid gap-4">
            {/* Clock In */}
            <div className="space-y-2">
              <Label htmlFor="edit-clock-in" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                <Clock className="size-3.5 text-primary" />
                Clock In
              </Label>
              <DateInput
                id="edit-clock-in"
                type="datetime-local"
                value={clockIn}
                onChange={(e) => setClockIn(e.target.value)}
                className="w-full shadow-sm"
              />
            </div>

            {/* Clock Out */}
            <div className="space-y-2">
              <Label htmlFor="edit-clock-out" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                <Clock className="size-3.5 text-muted-foreground" />
                Clock Out
              </Label>
              <DateInput
                id="edit-clock-out"
                type="datetime-local"
                value={clockOut}
                onChange={(e) => setClockOut(e.target.value)}
                className="w-full shadow-sm"
              />
              <p className="text-[11px] text-muted-foreground pl-1">
                Leave empty for active (still clocked-in) sessions.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={handleClose} disabled={saving} className="sm:w-auto w-full">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="sm:w-auto w-full shadow-md">
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
