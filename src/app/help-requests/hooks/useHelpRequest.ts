// ─── useHelpRequest hook ──────────────────────────────────────────────────────
// Fetches a single help request by id from GET /help-requests/{id}.
// Runs on mount and whenever the id changes.

import { useEffect } from "react"
import { useHelpRequestsStore } from "../store/helpRequestStore"

export function useHelpRequest(id: number | null) {
  const selectedRequest      = useHelpRequestsStore((s) => s.selectedRequest)
  const selectedLoading      = useHelpRequestsStore((s) => s.selectedLoading)
  const selectedError        = useHelpRequestsStore((s) => s.selectedError)
  const fetchHelpRequest     = useHelpRequestsStore((s) => s.fetchHelpRequest)
  const clearSelectedRequest = useHelpRequestsStore((s) => s.clearSelectedRequest)
  const clearSelectedError   = useHelpRequestsStore((s) => s.clearSelectedError)

  useEffect(() => {
    if (id !== null) {
      fetchHelpRequest(id)
    }
    // Clear the detail when the component unmounts or the id changes
    return () => {
      clearSelectedRequest()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return {
    request: selectedRequest,
    loading: selectedLoading,
    error: selectedError,
    clearError: clearSelectedError,
  }
}
