import { useState } from "react"
import { isCancel, AxiosError } from "axios"
import { finalRatingConfigService } from "../services/finalRatingConfigService"
import type { CalculateFinalRatingsPayload, FinalRatingsCalculateResult } from "../types"
import type { ApiValidationError } from "@/types"

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Extract a user-friendly message from an Axios error (mirrors store pattern) */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiValidationError | undefined
    if (data?.errors) return Object.values(data.errors).flat().join(". ")
    if (data?.message) return data.message
  }
  return fallback
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * useCalculateFinalRatings
 * ───────────────────────────────────────────────────────────────────────────
 * Calls POST /final-ratings/calculate and keeps local state for loading,
 * result, and error.  No global store is needed — results are ephemeral and
 * only relevant during the current session.
 */
export function useCalculateFinalRatings() {
  const [calculating, setCalculating] = useState(false)
  const [result, setResult] = useState<FinalRatingsCalculateResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  /** Run the calculation; returns the result or null on failure */
  async function calculate(payload: CalculateFinalRatingsPayload): Promise<FinalRatingsCalculateResult | null> {
    setCalculating(true)
    setError(null)

    try {
      const data = await finalRatingConfigService.calculate(payload)
      setResult(data)
      return data
    } catch (err) {
      // Ignore aborted requests (e.g. component unmount mid-request)
      if (!isCancel(err)) {
        setError(extractErrorMessage(err, "Failed to calculate final ratings."))
      }
      return null
    } finally {
      setCalculating(false)
    }
  }

  /** Clear the previous result so the form can be reused */
  function clearResult() {
    setResult(null)
    setError(null)
  }

  /** Clear only the error banner without discarding the result */
  function clearError() {
    setError(null)
  }

  return { calculate, calculating, result, error, clearResult, clearError }
}
