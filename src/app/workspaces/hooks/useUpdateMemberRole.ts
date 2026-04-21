import { useWorkspaceStore } from "../store/workspaceStore"

/**
 * Hook for updating a workspace member's role.
 * Returns the updateMemberRole action, submitting state, and error state.
 */
export function useUpdateMemberRole() {
  const updateMemberRole = useWorkspaceStore((s) => s.updateMemberRole)
  const submitting = useWorkspaceStore((s) => s.memberSubmitting)
  const submitError = useWorkspaceStore((s) => s.memberSubmitError)
  const clearSubmitError = useWorkspaceStore((s) => s.clearMemberSubmitError)

  return {
    updateMemberRole,
    submitting,
    submitError,
    clearSubmitError,
  }
}
