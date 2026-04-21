import { useEffect } from "react"
import { useRatingConfigStore } from "../store/ratingConfigStore"

/**
 * useRatingConfigs
 * ─────────────────────────────────────────────────────────────────
 * Fetches all rating configs on mount (GET /rating-configs).
 * Returns the config list, loading state, error, and a refetch callback.
 * Used by the page for the "ALL" tab and for computing stats.
 */
export function useRatingConfigs() {
  const configs = useRatingConfigStore((s) => s.configs)
  const loading = useRatingConfigStore((s) => s.configsLoading)
  const error = useRatingConfigStore((s) => s.configsError)
  const fetchConfigs = useRatingConfigStore((s) => s.fetchConfigs)
  const clearError = useRatingConfigStore((s) => s.clearConfigsError)

  // Auto-fetch when the hook mounts (i.e. when the page loads)
  useEffect(() => {
    fetchConfigs()
  }, [fetchConfigs])

  return { configs, loading, error, refetch: fetchConfigs, clearError }
}
