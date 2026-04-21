import { useEffect } from "react"
import { useFinalRatingConfigStore } from "../store/finalRatingConfigStore"

/**
 * useFinalRatingConfigs
 * ─────────────────────────────────────────────────────────────────
 * Fetches all final rating configs on mount (GET /final-ratings/configs).
 * Returns the list, loading state, error, and a refetch callback.
 */
export function useFinalRatingConfigs() {
  const configs = useFinalRatingConfigStore((s) => s.configs)
  const loading = useFinalRatingConfigStore((s) => s.configsLoading)
  const error = useFinalRatingConfigStore((s) => s.configsError)
  const fetchConfigs = useFinalRatingConfigStore((s) => s.fetchConfigs)
  const clearError = useFinalRatingConfigStore((s) => s.clearConfigsError)

  // Auto-fetch when the hook mounts
  useEffect(() => {
    fetchConfigs()
  }, [fetchConfigs])

  return { configs, loading, error, refetch: fetchConfigs, clearError }
}
