import { useEffect } from "react"
import { useWorkSessionStore } from "../store/workSessionStore"

/**
 * useTodaySession — loads GET /work-sessions/today on mount and exposes the
 * today slice plus every mutation the My Day page needs.
 */
export function useTodaySession() {
  const today = useWorkSessionStore((s) => s.today)
  const session = useWorkSessionStore((s) => s.session)
  const loading = useWorkSessionStore((s) => s.todayLoading)
  const error = useWorkSessionStore((s) => s.todayError)
  const submitting = useWorkSessionStore((s) => s.submitting)
  const submitError = useWorkSessionStore((s) => s.submitError)

  const fetchToday = useWorkSessionStore((s) => s.fetchToday)
  const startSession = useWorkSessionStore((s) => s.startSession)
  const addItem = useWorkSessionStore((s) => s.addItem)
  const updateItem = useWorkSessionStore((s) => s.updateItem)
  const deleteItem = useWorkSessionStore((s) => s.deleteItem)
  const reorderItems = useWorkSessionStore((s) => s.reorderItems)
  const setOutcome = useWorkSessionStore((s) => s.setOutcome)
  const updateSummary = useWorkSessionStore((s) => s.updateSummary)
  const confirmSession = useWorkSessionStore((s) => s.confirmSession)
  const clearSubmitError = useWorkSessionStore((s) => s.clearSubmitError)

  useEffect(() => {
    fetchToday()
  }, [fetchToday])

  return {
    today,
    session,
    loading,
    error,
    submitting,
    submitError,
    /** Re-load today's payload (e.g. after an error) */
    refetch: fetchToday,
    startSession,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
    setOutcome,
    updateSummary,
    confirmSession,
    clearSubmitError,
  }
}
