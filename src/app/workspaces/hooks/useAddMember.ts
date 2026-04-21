import { useWorkspaceStore } from "../store/workspaceStore"

/**
 * Hook for adding a new member to a workspace.
 * Returns the addMember action, submitting state, and error state.
 */
export function useAddMember() {
  const addMember = useWorkspaceStore((s) => s.addMember)
  const submitting = useWorkspaceStore((s) => s.memberSubmitting)
  const submitError = useWorkspaceStore((s) => s.memberSubmitError)
  const clearSubmitError = useWorkspaceStore((s) => s.clearMemberSubmitError)

  return {
    addMember,
    submitting,
    submitError,
    clearSubmitError,
  }
}
