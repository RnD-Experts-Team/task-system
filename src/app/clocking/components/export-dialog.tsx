// src/app/clocking/components/export-dialog.tsx
// Dialog that lets the user choose a date range before downloading clocking records as ZIP.
// Opened from the "Export Records" button on the records page.

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
import { clockingService } from "@/services/clockingService"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  // Date range state — both are optional (null exports all records)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [exporting, setExporting] = useState(false)

  // Reset form state when dialog closes
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
      // POST /clocking/export — triggers ZIP file download in the browser
      await clockingService.exportRecords({
        start_date: startDate || null,
        end_date: endDate || null,
      })
      // Close dialog on success; the browser handles the file download
      handleOpenChange(false)
    } catch (err) {
      // Ignore request cancellations; show a toast for real errors
      if (!isCancel(err)) {
        toast.error("Failed to export records. Please try again.")
      }
    } finally {
      setExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 w-fit">
            <FileArchive className="size-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Export Records
            </span>
          </div>
          <DialogTitle className="text-2xl font-black tracking-tighter">
            Export Clocking Records
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Optionally filter by date range. Leave both fields empty to export all records.
            The file will download as a ZIP archive.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Start date */}
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Start Date (optional)
            </label>
            <div className="group relative overflow-hidden rounded-t-xl bg-muted/40 ring-1 ring-border/30 transition-all focus-within:ring-primary">
              <DateInput
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border-none bg-transparent px-4 py-3.5 text-sm text-foreground outline-none"
              />
              <div className="absolute bottom-0 left-0 h-0.5 w-full bg-border/40 transition-colors group-focus-within:bg-primary" />
            </div>
          </div>

          {/* End date */}
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              End Date (optional)
            </label>
            <div className="group relative overflow-hidden rounded-t-xl bg-muted/40 ring-1 ring-border/30 transition-all focus-within:ring-primary">
              <DateInput
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border-none bg-transparent px-4 py-3.5 text-sm text-foreground outline-none"
              />
              <div className="absolute bottom-0 left-0 h-0.5 w-full bg-border/40 transition-colors group-focus-within:bg-primary" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
              disabled={exporting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="lg"
              className="flex-[1.5] gap-2 font-bold"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Exporting…
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  Download ZIP
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
