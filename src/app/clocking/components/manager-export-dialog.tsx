// src/app/clocking/components/manager-export-dialog.tsx
// Dialog for managers to export ALL employees' clocking records as a ZIP.
// Calls POST /clocking/manager/export-all on submit.

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { DateInput } from "@/components/ui/date-input"
import { Download, Loader2, FileArchive } from "lucide-react"
import { toast } from "sonner"
import { isCancel } from "axios"
import { managerClockingService } from "@/services/managerClockingService"

interface ManagerExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManagerExportDialog({ open, onOpenChange }: ManagerExportDialogProps) {
  // Optional date range — both null exports all records
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [exporting, setExporting] = useState(false)

  // Reset form fields when the dialog closes
  function handleOpenChange(value: boolean) {
    if (!value) {
      setStartDate("")
      setEndDate("")
    }
    onOpenChange(value)
  }

  async function handleExport() {
    setExporting(true)
    try {
      // POST /clocking/manager/export-all — triggers ZIP download in the browser
      await managerClockingService.exportAll({
        start_date: startDate || null,
        end_date:   endDate   || null,
      })
      handleOpenChange(false)
    } catch (err) {
      if (!isCancel(err)) {
        toast.error("Failed to export records. Please try again.")
      }
    } finally {
      setExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden p-0 border-0 shadow-2xl">
        <div className="px-6 pt-6 pb-4 bg-muted/30 border-b border-border/50">
          <DialogHeader className="gap-1">
            <div className="mb-1 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5">
              <FileArchive className="size-3 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                Export All Records
              </span>
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">
              Export All Employees
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Generates a ZIP containing individual PDF clocking reports for every
              employee, plus a summary overview. Optionally filter by date range.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid gap-4">
            {/* Start date */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                From Date
              </label>
              <DateInput
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="YYYY-MM-DD"
                className="w-full"
              />
            </div>

            {/* End date */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                To Date
              </label>
              <DateInput
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="YYYY-MM-DD"
                className="w-full"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={exporting}
              className="sm:w-auto w-full"
            >
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={exporting} className="gap-2 sm:w-auto w-full shadow-md">
              {exporting
                ? <Loader2 className="size-4 animate-spin" />
                : <Download className="size-4" />}
              {exporting ? "Exporting…" : "Export ZIP"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
