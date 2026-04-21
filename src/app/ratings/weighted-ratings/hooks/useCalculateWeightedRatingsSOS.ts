import { useState } from "react"
import { isCancel, AxiosError } from "axios"
import {
  weightedRatingsService,
  type WeightedRatingsSOSPayload,
  type WeightedRatingsSOSUserResult,
} from "../services/weightedRatingsService"
import type { ApiValidationError } from "@/types"

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Extracts a readable error message from an Axios error.
 * Checks for Laravel validation errors (errors object) first,
 * then falls back to the top-level message, then the provided fallback string.
 */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiValidationError | undefined
    // Laravel 422: join all field-level error messages
    if (data?.errors) return Object.values(data.errors).flat().join(". ")
    // Other HTTP errors with a message field
    if (data?.message) return data.message
  }
  return fallback
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useCalculateWeightedRatingsSOS
 *
 * Thin async wrapper around the SOS weighted-ratings API call.
 * Manages local loading, result, and error state so the page stays clean.
 *
 * Usage:
 *   const { calculate, calculating, error, clearError } = useCalculateWeightedRatingsSOS()
 *   const data = await calculate({ user_ids, start_date, end_date })
 */
export function useCalculateWeightedRatingsSOS() {
  // true while the HTTP request is in flight
  const [calculating, setCalculating] = useState(false)

  // Holds the last successful API response array
  const [apiResults, setApiResults] = useState<WeightedRatingsSOSUserResult[] | null>(null)

  // Human-readable error string; null when no error
  const [error, setError] = useState<string | null>(null)

  /**
   * Fire the API call with the given payload.
   * Returns the result array on success, or null on failure.
   */
  async function calculate(
    payload: WeightedRatingsSOSPayload,
  ): Promise<WeightedRatingsSOSUserResult[] | null> {
    setCalculating(true)
    setError(null)

    try {
      const data = await weightedRatingsService.calculateSOS(payload)
      setApiResults(data)
      return data
    } catch (err) {
      // Ignore request-cancellation errors (e.g. component unmounts mid-flight)
      if (!isCancel(err)) {
        setError(extractErrorMessage(err, "Failed to calculate weighted ratings."))
      }
      return null
    } finally {
      setCalculating(false)
    }
  }

  /** Dismiss the error banner without clearing the last result */
  function clearError() {
    setError(null)
  }

  return { calculate, calculating, apiResults, error, clearError }
}
