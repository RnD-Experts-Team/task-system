import { useRatingConfigStore } from "../store/ratingConfigStore"

/**
 * useDeleteRatingConfig
 * ─────────────────────────────────────────────────────────────────
 * Exposes the delete action with deleting/error state.
 * Used by the delete confirmation dialog.
 */
export function useDeleteRatingConfig() {
  const deleteConfig = useRatingConfigStore((s) => s.deleteConfig)
  const deleting = useRatingConfigStore((s) => s.deleting)
  const deleteError = useRatingConfigStore((s) => s.deleteError)
  const clearDeleteError = useRatingConfigStore((s) => s.clearDeleteError)

  return { deleteConfig, deleting, deleteError, clearDeleteError }
}
