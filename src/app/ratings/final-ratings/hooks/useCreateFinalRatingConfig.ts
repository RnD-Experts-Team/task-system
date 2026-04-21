import { useFinalRatingConfigStore } from "../store/finalRatingConfigStore"

/**
 * useCreateFinalRatingConfig
 * ─────────────────────────────────────────────────────────────────
 * Exposes the create action with creating/error state.
 * Wraps POST /final-ratings/configs via the Zustand store.
 * Used by the create configuration form sheet.
 */
export function useCreateFinalRatingConfig() {
  const createConfig = useFinalRatingConfigStore((s) => s.createConfig)
  const creating = useFinalRatingConfigStore((s) => s.creating)
  const createError = useFinalRatingConfigStore((s) => s.createError)
  const clearCreateError = useFinalRatingConfigStore((s) => s.clearCreateError)

  return { createConfig, creating, createError, clearCreateError }
}
