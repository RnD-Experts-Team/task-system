// src/app/clocking/components/edit-break-dialog.tsx
// Dialog for managers to directly edit a break record's start / end times.
// Calls PUT /clocking/manager/break/{id}/edit on submit.

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
import { Loader2, Coffee, Clock } from "lucide-react"
import { isCancel } from "axios"
import { toast } from "sonner"
import type { BreakRecord } from "../data"
import { managerClockingService } from "@/services/managerClockingService"

interface EditBreakDialogProps {
  /** Break record to edit — null means the dialog is hidden */
  breakRecord: BreakRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with the updated break record after a successful save */
  onSaved: (updated: BreakRecord) => void
}

// Convert UTC ISO string → datetime-local input value (local timezone)
function toLocalInput(utc: string | null): string {
  if (!utc) return ""
  const d = new Date(utc)
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  )
}

// Convert datetime-local input value → UTC ISO string
function toUtcIso(localValue: string): string {
  if (!localValue) return ""
  const d = new Date(localValue)
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:00Z`
  )
}

export function EditBreakDialog({
  breakRecord,
  open,
  onOpenChange,
  onSaved,
}: EditBreakDialogProps) {
  const [breakStart, setBreakStart] = useState("")
  const [breakEnd, setBreakEnd] = useState("")
  const [saving, setSaving] = useState(false)

  // Pre-fill the form whenever a new break record is loaded
  useEffect(() => {
    if (breakRecord) {
      setBreakStart(toLocalInput(breakRecord.break_start_utc))
      setBreakEnd(toLocalInput(breakRecord.break_end_utc))
    }
  }, [breakRecord])

  if (!breakRecord) return null

  function handleClose() {
    onOpenChange(false)
  }

  async function handleSave() {
    if (!breakRecord) return

    if (!breakStart && !breakEnd) {
      toast.error("Please fill in at least one time field.")
      return
    }

    setSaving(true)
    try {
      const updated = await managerClockingService.editBreak(breakRecord.id, {
        break_start_utc: breakStart ? toUtcIso(breakStart) : null,
        break_end_utc:   breakEnd   ? toUtcIso(breakEnd)   : null,
      })
      onSaved(updated)
      handleClose()
    } catch (err) {
      // Ignore cancellations — interceptor handles toast for real errors
      if (!isCancel(err)) {
        // no-op
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
            <div className="mb-1 inline-flex w-fit items-center gap-1.5 rounded-full border border-orange-400/20 bg-orange-400/10 px-2.5 py-0.5">
              <Coffee className="size-3 text-orange-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-400">
                Edit Break
              </span>
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">
              Edit Break Record
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Update the start or end time for break #{breakRecord.id}.
              Times are entered in your local timezone and saved as UTC.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid gap-4">
            {/* Break Start */}
            <div className="space-y-2">
              <Label htmlFor="edit-break-start" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                <Clock className="size-3.5 text-orange-400" />
                Break Start
              </Label>
              <DateInput
                id="edit-break-start"
                type="datetime-local"
                value={breakStart}
                onChange={(e) => setBreakStart(e.target.value)}
                className="w-full shadow-sm"
              />
            </div>

            {/* Break End */}
            <div className="space-y-2">
              <Label htmlFor="edit-break-end" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                <Clock className="size-3.5 text-muted-foreground" />
                Break End
              </Label>
              <DateInput
                id="edit-break-end"
                type="datetime-local"
                value={breakEnd}
                onChange={(e) => setBreakEnd(e.target.value)}
                className="w-full shadow-sm"
              />
              <p className="text-[11px] text-muted-foreground pl-1">
                Leave empty if the break is still active.
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
