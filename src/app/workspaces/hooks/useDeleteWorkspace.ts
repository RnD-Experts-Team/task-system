import { useWorkspaceStore } from "../store/workspaceStore"

/**
 * Hook for deleting a workspace.
 * Returns the delete function, deleting state, and error state.
 */
export function useDeleteWorkspace() {
  const deleteWorkspace = useWorkspaceStore((s) => s.deleteWorkspace)
  const deleting = useWorkspaceStore((s) => s.submitting)
  const deleteError = useWorkspaceStore((s) => s.submitError)
  const clearDeleteError = useWorkspaceStore((s) => s.clearSubmitError)

  return {
    deleteWorkspace,
    deleting,
    deleteError,
    clearDeleteError,
  }
}
