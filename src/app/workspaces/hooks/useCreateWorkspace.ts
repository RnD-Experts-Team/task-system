import { useWorkspaceStore } from "../store/workspaceStore"

/**
 * Hook for creating a new workspace.
 * Returns the create function, submitting state, and error state.
 */
export function useCreateWorkspace() {
  const createWorkspace = useWorkspaceStore((s) => s.createWorkspace)
  const submitting = useWorkspaceStore((s) => s.submitting)
  const submitError = useWorkspaceStore((s) => s.submitError)
  const clearSubmitError = useWorkspaceStore((s) => s.clearSubmitError)

  return {
    createWorkspace,
    submitting,
    submitError,
    clearSubmitError,
  }
}
