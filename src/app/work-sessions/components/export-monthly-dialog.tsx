// src/app/work-sessions/components/export-monthly-dialog.tsx
// Dialog that exports a ZIP of per-user monthly PDF reports
// (POST /work-sessions/admin/reports/export-pdf). Shared by the Reports and
// Ratings pages — the caller passes the current user selection and a
// starting month; empty selection means "every user".

import { useState } from "react"
import { AlertCircle, Download, FileArchive, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useExportMonthlyPdf } from "../hooks/useExportMonthlyPdf"
import type { SessionUser, YearMonth } from "../types"
import { monthLabel } from "../utils/format"
import { MonthPicker } from "./month-picker"

type ExportMonthlyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Every user available to export */
  users: SessionUser[]
  /** Currently selected user ids — empty exports all users */
  selectedUserIds: number[]
  /** Month pre-selected when the dialog opens */
  initialMonth: YearMonth
}

export function ExportMonthlyDialog({
  open,
  onOpenChange,
  users,
  selectedUserIds,
  initialMonth,
}: ExportMonthlyDialogProps) {
  const [month, setMonth] = useState<YearMonth>(initialMonth)
  const { exportPdf, exporting, error, clearError } = useExportMonthlyPdf()

  // Resync the picker with the caller's month each time the dialog opens
  const [syncedFor, setSyncedFor] = useState<string | null>(null)
  const openKey = open ? `${initialMonth.year}-${initialMonth.month}` : null
  if (openKey !== syncedFor) {
    setSyncedFor(openKey)
    if (openKey) setMonth(initialMonth)
  }

  const targetIds = selectedUserIds.length > 0 ? selectedUserIds : users.map((u) => u.id)
  const scopeLabel =
    selectedUserIds.length > 0
      ? `${selectedUserIds.length} selected ${selectedUserIds.length === 1 ? "user" : "users"}`
      : `all ${users.length} ${users.length === 1 ? "user" : "users"}`

  function handleOpenChange(value: boolean) {
    if (exporting) return
    if (!value) clearError()
    onOpenChange(value)
  }

  async function handleExport() {
    if (targetIds.length === 0) return
    const ok = await exportPdf({ user_ids: targetIds, year: month.year, month: month.month })
    if (ok) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileArchive className="size-4 text-primary" />
            </div>
            <DialogTitle>Export monthly report</DialogTitle>
          </div>
          <DialogDescription>
            Generates a ZIP with one PDF per user summarising their work sessions for the
            selected month. Applies to {scopeLabel}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <MonthPicker label="Month" value={month} onChange={setMonth} disabled={exporting} />

          <p className="text-xs text-muted-foreground">
            You are about to export <span className="font-medium text-foreground">{monthLabel(month.year, month.month)}</span>{" "}
            for <span className="font-medium text-foreground">{scopeLabel}</span>.
          </p>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={exporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting || targetIds.length === 0} className="gap-2">
            {exporting ? <Loader2 className="animate-spin" /> : <Download />}
            {exporting ? "Exporting…" : "Export ZIP"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
