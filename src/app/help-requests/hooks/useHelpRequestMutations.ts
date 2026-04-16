// ─── useHelpRequestMutations hook ─────────────────────────────────────────────
// Exposes all write actions from the help-requests store:
//   createHelpRequest     → POST /help-requests
//   updateHelpRequest     → PUT  /help-requests/{id}
//   claimHelpRequest      → POST /help-requests/{id}/claim
//   unclaimHelpRequest    → POST /help-requests/{id}/unclaim
//   assignHelpRequest     → POST /help-requests/{id}/assign/{userId}
//   completeHelpRequest   → POST /help-requests/{id}/complete
//   deleteHelpRequest     → DELETE /help-requests/{id}
//
// Usage:
//   const { assignHelpRequest, completeHelpRequest, submitting, submitError } = useHelpRequestMutations()

import { useHelpRequestsStore } from "../store/helpRequestStore"

export function useHelpRequestMutations() {
  // Pull only the mutation-related slices to avoid unnecessary re-renders
  const submitting           = useHelpRequestsStore((s) => s.submitting)
  const submitError          = useHelpRequestsStore((s) => s.submitError)
  const createHelpRequest    = useHelpRequestsStore((s) => s.createHelpRequest)
  const updateHelpRequest    = useHelpRequestsStore((s) => s.updateHelpRequest)
  const claimHelpRequest     = useHelpRequestsStore((s) => s.claimHelpRequest)
  const unclaimHelpRequest   = useHelpRequestsStore((s) => s.unclaimHelpRequest)
  const assignHelpRequest    = useHelpRequestsStore((s) => s.assignHelpRequest)
  const completeHelpRequest  = useHelpRequestsStore((s) => s.completeHelpRequest)
  const deleteHelpRequest    = useHelpRequestsStore((s) => s.deleteHelpRequest)
  const clearSubmitError     = useHelpRequestsStore((s) => s.clearSubmitError)

  return {
    submitting,
    submitError,
    createHelpRequest,
    updateHelpRequest,
    claimHelpRequest,
    unclaimHelpRequest,
    assignHelpRequest,
    completeHelpRequest,
    deleteHelpRequest,
    clearSubmitError,
  }
}
