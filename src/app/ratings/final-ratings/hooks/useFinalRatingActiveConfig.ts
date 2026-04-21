import { useEffect } from "react"
import { useFinalRatingConfigStore } from "../store/finalRatingConfigStore"

/**
 * useFinalRatingActiveConfig
 * ─────────────────────────────────────────────────────────────────
 * Fetches the active final rating config on mount
 * (GET /final-ratings/configs/active).
 * A 404 response means no active config exists — handled as an error.
 */
export function useFinalRatingActiveConfig() {
  const activeConfig = useFinalRatingConfigStore((s) => s.activeConfig)
  const loading = useFinalRatingConfigStore((s) => s.activeLoading)
  const error = useFinalRatingConfigStore((s) => s.activeError)
  const fetchActiveConfig = useFinalRatingConfigStore((s) => s.fetchActiveConfig)
  const clearError = useFinalRatingConfigStore((s) => s.clearActiveError)

  // Auto-fetch when the hook mounts
  useEffect(() => {
    fetchActiveConfig()
  }, [fetchActiveConfig])

  return { activeConfig, loading, error, refetch: fetchActiveConfig, clearError }
}
