import { useEffect } from "react"
import { useFinalRatingConfigStore } from "../store/finalRatingConfigStore"

/**
 * useFinalRatingConfig
 * ─────────────────────────────────────────────────────────────────
 * Fetches a single final rating config by ID
 * (GET /final-ratings/configs/{id}).
 * Only fires when `id` is non-null (e.g. when a detail sheet is open).
 */
export function useFinalRatingConfig(id: number | null) {
  const config = useFinalRatingConfigStore((s) => s.selectedConfig)
  const loading = useFinalRatingConfigStore((s) => s.selectedLoading)
  const error = useFinalRatingConfigStore((s) => s.selectedError)
  const fetchConfigById = useFinalRatingConfigStore((s) => s.fetchConfigById)
  const clearSelected = useFinalRatingConfigStore((s) => s.clearSelectedConfig)

  // Fetch when ID changes and is non-null
  useEffect(() => {
    if (id !== null) {
      fetchConfigById(id)
    } else {
      clearSelected()
    }
  }, [id, fetchConfigById, clearSelected])

  return { config, loading, error }
}
