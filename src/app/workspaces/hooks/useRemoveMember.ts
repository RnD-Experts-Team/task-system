import { useWorkspaceStore } from "../store/workspaceStore"

/**
 * Hook for removing a member from a workspace.
 * Returns the removeMember action, submitting state, and error state.
 */
export function useRemoveMember() {
  const removeMember = useWorkspaceStore((s) => s.removeMember)
  const submitting = useWorkspaceStore((s) => s.memberSubmitting)
  const submitError = useWorkspaceStore((s) => s.memberSubmitError)
  const clearSubmitError = useWorkspaceStore((s) => s.clearMemberSubmitError)

  return {
    removeMember,
    submitting,
    submitError,
    clearSubmitError,
  }
}
