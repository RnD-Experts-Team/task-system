import { useWorkspaceStore } from "../store/workspaceStore"

/**
 * Hook for updating a workspace (PUT — full update).
 * Returns the update function, submitting state, and error state.
 */
export function useUpdateWorkspace() {
  const updateWorkspace = useWorkspaceStore((s) => s.updateWorkspace)
  const submitting = useWorkspaceStore((s) => s.submitting)
  const submitError = useWorkspaceStore((s) => s.submitError)
  const clearSubmitError = useWorkspaceStore((s) => s.clearSubmitError)

  return {
    updateWorkspace,
    submitting,
    submitError,
    clearSubmitError,
  }
}
