import { useEffect } from "react"
import { useRatingConfigStore } from "../store/ratingConfigStore"

/**
 * useRatingConfig
 * ─────────────────────────────────────────────────────────────────
 * Fetches a single rating config by ID (GET /rating-configs/{id}).
 * Triggers the fetch when `id` changes and cleans up on unmount.
 * Used by the detail sheet to load fresh data from the API.
 */
export function useRatingConfig(id: number | null) {
  const selectedConfig = useRatingConfigStore((s) => s.selectedConfig)
  const loading = useRatingConfigStore((s) => s.selectedLoading)
  const error = useRatingConfigStore((s) => s.selectedError)
  const fetchConfigById = useRatingConfigStore((s) => s.fetchConfigById)
  const clearSelectedConfig = useRatingConfigStore((s) => s.clearSelectedConfig)

  // Fetch when an ID is provided; skip when null (sheet is closed)
  useEffect(() => {
    if (id !== null) {
      fetchConfigById(id)
    }
    // Clear selected config when the sheet closes (id becomes null)
    return () => {
      clearSelectedConfig()
    }
  }, [id, fetchConfigById, clearSelectedConfig])

  return { config: selectedConfig, loading, error }
}
