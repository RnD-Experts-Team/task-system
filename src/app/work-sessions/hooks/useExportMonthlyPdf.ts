// src/app/work-sessions/hooks/useExportMonthlyPdf.ts
// POST /work-sessions/admin/reports/export-pdf — the response is a binary ZIP
// of per-user PDFs that apiClient.downloadFilePost() saves to the browser.

import { useCallback, useState } from "react"
import { isCancel } from "axios"
import { workSessionService } from "../services/workSessionService"
import { extractErrorMessage } from "../utils/format"
import type { ExportMonthlyPdfPayload } from "../types"

export function useExportMonthlyPdf() {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Trigger the ZIP download — returns true on success */
  const exportPdf = useCallback(async (payload: ExportMonthlyPdfPayload): Promise<boolean> => {
    setExporting(true)
    setError(null)
    try {
      await workSessionService.exportMonthlyPdf(payload)
      return true
    } catch (err) {
      // Ignore user-cancelled requests
      if (!isCancel(err)) {
        setError(extractErrorMessage(err, "Failed to export the monthly report."))
      }
      return false
    } finally {
      setExporting(false)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { exportPdf, exporting, error, clearError }
}
