// src/app/work-sessions/hooks/useRatingAverage.ts
// One-shot POST /work-sessions/admin/ratings/average — per-user + overall
// average score over a month range for the selected users.

import { useCallback, useState } from "react"
import { isCancel } from "axios"
import { workSessionService } from "../services/workSessionService"
import { extractErrorMessage } from "../utils/format"
import type { RatingAveragePayload, RatingAverageResponse } from "../types"

export function useRatingAverage() {
  const [data, setData] = useState<RatingAverageResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Run the calculation — returns the payload on success, null on failure */
  const run = useCallback(
    async (payload: RatingAveragePayload): Promise<RatingAverageResponse | null> => {
      setLoading(true)
      setError(null)
      try {
        const result = await workSessionService.ratingAverage(payload)
        setData(result)
        return result
      } catch (err) {
        if (!isCancel(err)) {
          setError(extractErrorMessage(err, "Failed to calculate the rating average."))
        }
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const clearError = useCallback(() => setError(null), [])

  return { run, data, loading, error, clearError }
}
