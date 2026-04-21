import { useRatingConfigStore } from "../store/ratingConfigStore"

/**
 * useUpdateRatingConfig
 * ─────────────────────────────────────────────────────────────────
 * Exposes the update action with updating/error state.
 * Wraps PUT /rating-configs/{id} via the Zustand store.
 * Used by the edit configuration page.
 */
export function useUpdateRatingConfig() {
  const updateConfig = useRatingConfigStore((s) => s.updateConfig)
  const updating = useRatingConfigStore((s) => s.updating)
  const updateError = useRatingConfigStore((s) => s.updateError)
  const clearUpdateError = useRatingConfigStore((s) => s.clearUpdateError)

  return { updateConfig, updating, updateError, clearUpdateError }
}
