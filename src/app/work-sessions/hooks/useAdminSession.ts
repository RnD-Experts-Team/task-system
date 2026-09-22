// src/app/work-sessions/hooks/useAdminSession.ts
// Loads one session (with items + user) for the admin detail sheet whenever
// the id changes. Pass null to skip fetching (sheet closed).

import { useCallback, useEffect } from "react"
import { useAdminWorkSessionStore } from "../store/adminWorkSessionStore"

export function useAdminSession(id: number | null) {
  const session = useAdminWorkSessionStore((s) => s.selectedSession)
  const loading = useAdminWorkSessionStore((s) => s.selectedLoading)
  const error = useAdminWorkSessionStore((s) => s.selectedError)
  const fetchSession = useAdminWorkSessionStore((s) => s.fetchSession)
  const clearSelectedSession = useAdminWorkSessionStore((s) => s.clearSelectedSession)
  const clearSelectedError = useAdminWorkSessionStore((s) => s.clearSelectedError)

  useEffect(() => {
    if (id === null) return
    fetchSession(id)
  }, [id, fetchSession])

  const refetch = useCallback(() => {
    if (id !== null) fetchSession(id)
  }, [id, fetchSession])

  return {
    session,
    loading,
    error,
    refetch,
    clear: clearSelectedSession,
    clearError: clearSelectedError,
  }
}
