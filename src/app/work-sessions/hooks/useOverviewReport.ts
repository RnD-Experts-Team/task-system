// src/app/work-sessions/hooks/useOverviewReport.ts
// One-shot fetch of GET /work-sessions/admin/reports/overview. Local state
// only — the report is a pure function of the filter form, not shared state.

import { useCallback, useState } from "react"
import { isCancel } from "axios"
import { workSessionService } from "../services/workSessionService"
import { extractErrorMessage } from "../utils/format"
import type { OverviewReport, ReportParams } from "../types"

export function useOverviewReport() {
  const [data, setData] = useState<OverviewReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Run the report — returns the payload on success, null on failure */
  const run = useCallback(async (params: ReportParams): Promise<OverviewReport | null> => {
    setLoading(true)
    setError(null)
    try {
      const report = await workSessionService.overview(params)
      setData(report)
      return report
    } catch (err) {
      // Ignore request-cancellation errors (e.g. component unmounts mid-flight)
      if (!isCancel(err)) {
        setError(extractErrorMessage(err, "Failed to load the overview report."))
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { run, data, loading, error, clearError }
}
