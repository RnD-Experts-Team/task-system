import { useState } from "react"
import { isCancel, AxiosError } from "axios"
import { finalRatingConfigService } from "../services/finalRatingConfigService"
import type { CalculateFinalRatingsPayload, FinalRatingsExportFormat } from "../types"
import type { ApiValidationError } from "@/types"

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Extract a user-friendly message from an Axios error */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiValidationError | undefined
    if (data?.errors) return Object.values(data.errors).flat().join(". ")
    if (data?.message) return data.message
  }
  return fallback
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useExportFinalRatingsPdf
 * ───────────────────────────────────────────────────────────────────────────
 * Calls POST /final-ratings/export-pdf supplying the same payload as
 * calculate.  The response is a binary ZIP blob that is automatically
 * saved to the user's downloads via apiClient.downloadFilePost().
 */
export function useExportFinalRatingsPdf() {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Trigger the PDF/ZIP export — returns true on success */
  async function exportPdf(
    payload: CalculateFinalRatingsPayload,
    format: FinalRatingsExportFormat = "zip",
  ): Promise<boolean> {
    setExporting(true)
    setError(null)

    try {
      await finalRatingConfigService.exportPdf(payload, format)
      return true
    } catch (err) {
      // Ignore user-cancelled requests
      if (!isCancel(err)) {
        setError(extractErrorMessage(err, "Failed to export final ratings."))
      }
      return false
    } finally {
      setExporting(false)
    }
  }

  function clearError() {
    setError(null)
  }

  return { exportPdf, exporting, error, clearError }
}
