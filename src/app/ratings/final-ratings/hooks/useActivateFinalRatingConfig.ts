import { useFinalRatingConfigStore } from "../store/finalRatingConfigStore"

/**
 * useActivateFinalRatingConfig
 * ─────────────────────────────────────────────────────────────────
 * Exposes the activate action with activating/error state.
 * Wraps POST /final-ratings/configs/{id}/activate via the Zustand store.
 * Used by the edit configuration form sheet.
 */
export function useActivateFinalRatingConfig() {
  const activateConfig = useFinalRatingConfigStore((s) => s.activateConfig)
  const activating = useFinalRatingConfigStore((s) => s.activating)
  const activateError = useFinalRatingConfigStore((s) => s.activateError)
  const clearActivateError = useFinalRatingConfigStore((s) => s.clearActivateError)

  return { activateConfig, activating, activateError, clearActivateError }
}
