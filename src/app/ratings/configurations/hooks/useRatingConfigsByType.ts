import { useCallback } from "react"
import { useRatingConfigStore } from "../store/ratingConfigStore"
import type { ApiRatingConfigType } from "../types"

/**
 * useRatingConfigsByType
 * ─────────────────────────────────────────────────────────────────
 * Lazy hook for GET /rating-configs/type/{type}.
 * Does NOT auto-fetch on mount — the caller triggers `fetchByType(type)`
 * (e.g. when the user clicks the TASK or STAKEHOLDER tab).
 */
export function useRatingConfigsByType() {
  const configsByType = useRatingConfigStore((s) => s.configsByType)
  const loading = useRatingConfigStore((s) => s.configsByTypeLoading)
  const error = useRatingConfigStore((s) => s.configsByTypeError)
  const activeTypeFilter = useRatingConfigStore((s) => s.activeTypeFilter)
  const fetchConfigsByType = useRatingConfigStore((s) => s.fetchConfigsByType)
  const clearError = useRatingConfigStore((s) => s.clearConfigsByTypeError)

  // Stable callback so callers can use it in event handlers
  const fetchByType = useCallback(
    (type: ApiRatingConfigType) => fetchConfigsByType(type),
    [fetchConfigsByType],
  )

  return { configsByType, loading, error, activeTypeFilter, fetchByType, clearError }
}
