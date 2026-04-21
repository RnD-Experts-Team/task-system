import { useRatingConfigStore } from "../store/ratingConfigStore"

/**
 * useCreateRatingConfig
 * ─────────────────────────────────────────────────────────────────
 * Exposes the create action with creating/error state.
 * Wraps POST /rating-configs via the Zustand store.
 * Used by the create configuration page.
 */
export function useCreateRatingConfig() {
  const createConfig = useRatingConfigStore((s) => s.createConfig)
  const creating = useRatingConfigStore((s) => s.creating)
  const createError = useRatingConfigStore((s) => s.createError)
  const clearCreateError = useRatingConfigStore((s) => s.clearCreateError)

  return { createConfig, creating, createError, clearCreateError }
}
