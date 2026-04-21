import { useFinalRatingConfigStore } from "../store/finalRatingConfigStore"

/**
 * useDeleteFinalRatingConfig
 * ─────────────────────────────────────────────────────────────────
 * Exposes the delete action with deleting/error state.
 * Wraps DELETE /final-ratings/configs/{id} via the Zustand store.
 * Used by the delete confirmation dialog.
 */
export function useDeleteFinalRatingConfig() {
  const deleteConfig = useFinalRatingConfigStore((s) => s.deleteConfig)
  const deleting = useFinalRatingConfigStore((s) => s.deleting)
  const deleteError = useFinalRatingConfigStore((s) => s.deleteError)
  const clearDeleteError = useFinalRatingConfigStore((s) => s.clearDeleteError)

  return { deleteConfig, deleting, deleteError, clearDeleteError }
}
