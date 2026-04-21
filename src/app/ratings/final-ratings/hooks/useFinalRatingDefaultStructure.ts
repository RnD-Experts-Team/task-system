import { useFinalRatingConfigStore } from "../store/finalRatingConfigStore"

/**
 * useFinalRatingDefaultStructure
 * ─────────────────────────────────────────────────────────────────
 * Exposes the action to fetch the default config structure
 * (GET /final-ratings/configs/default-structure).
 * Lazy — does NOT auto-fetch on mount. Call fetchDefaultStructure() manually.
 * Used by the form sheet to pre-fill the config when creating a new config.
 */
export function useFinalRatingDefaultStructure() {
  const defaultStructure = useFinalRatingConfigStore((s) => s.defaultStructure)
  const loading = useFinalRatingConfigStore((s) => s.defaultStructureLoading)
  const error = useFinalRatingConfigStore((s) => s.defaultStructureError)
  const fetchDefaultStructure = useFinalRatingConfigStore((s) => s.fetchDefaultStructure)
  const clearError = useFinalRatingConfigStore((s) => s.clearDefaultStructureError)

  return { defaultStructure, loading, error, fetchDefaultStructure, clearError }
}
