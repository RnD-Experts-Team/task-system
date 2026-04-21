import { useFinalRatingConfigStore } from "../store/finalRatingConfigStore"

/**
 * useUpdateFinalRatingConfig
 * ─────────────────────────────────────────────────────────────────
 * Exposes the update action with updating/error state.
 * Wraps PUT /final-ratings/configs/{id} via the Zustand store.
 * Used by the edit configuration form sheet.
 */
export function useUpdateFinalRatingConfig() {
  const updateConfig = useFinalRatingConfigStore((s) => s.updateConfig)
  const updating = useFinalRatingConfigStore((s) => s.updating)
  const updateError = useFinalRatingConfigStore((s) => s.updateError)
  const clearUpdateError = useFinalRatingConfigStore((s) => s.clearUpdateError)

  return { updateConfig, updating, updateError, clearUpdateError }
}
