// src/app/work-sessions/hooks/useByTaskReport.ts
// One-shot fetch of GET /work-sessions/admin/reports/by-task.

import { useCallback, useState } from "react"
import { isCancel } from "axios"
import { workSessionService } from "../services/workSessionService"
import { extractErrorMessage } from "../utils/format"
import type { ByTaskReport, ByTaskReportParams } from "../types"

export function useByTaskReport() {
  const [data, setData] = useState<ByTaskReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Run the report — returns the payload on success, null on failure */
  const run = useCallback(async (params: ByTaskReportParams): Promise<ByTaskReport | null> => {
    setLoading(true)
    setError(null)
    try {
      const report = await workSessionService.byTask(params)
      setData(report)
      return report
    } catch (err) {
      if (!isCancel(err)) {
        setError(extractErrorMessage(err, "Failed to load the by-task report."))
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { run, data, loading, error, clearError }
}
