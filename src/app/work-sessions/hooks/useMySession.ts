import { useEffect } from "react"
import { useWorkSessionStore } from "../store/workSessionStore"

/**
 * useMySession — loads GET /work-sessions/{id} whenever `id` changes and
 * clears the selection when `id` becomes null (e.g. the detail sheet closes).
 *
 * Returns: session, loading, error, submitting, submitError, confirmSessionById, clearSelectedSession
 */
export function useMySession(id: number | null) {
  const session = useWorkSessionStore((s) => s.selectedSession)
  const loading = useWorkSessionStore((s) => s.selectedLoading)
  const error = useWorkSessionStore((s) => s.selectedError)
  const submitting = useWorkSessionStore((s) => s.submitting)
  const submitError = useWorkSessionStore((s) => s.submitError)
  const fetchSession = useWorkSessionStore((s) => s.fetchSession)
  const confirmSessionById = useWorkSessionStore((s) => s.confirmSessionById)
  const clearSelectedSession = useWorkSessionStore((s) => s.clearSelectedSession)
  const clearSubmitError = useWorkSessionStore((s) => s.clearSubmitError)

  useEffect(() => {
    if (id === null) {
      clearSelectedSession()
      return
    }
    fetchSession(id)
  }, [id, fetchSession, clearSelectedSession])

  return {
    session,
    loading,
    error,
    submitting,
    submitError,
    /** Re-load the same session */
    refetch: () => (id !== null ? fetchSession(id) : Promise.resolve()),
    confirmSessionById,
    clearSelectedSession,
    clearSubmitError,
  }
}
