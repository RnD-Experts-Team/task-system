// src/app/work-sessions/hooks/useAdminSessions.ts
// Params-keyed fetch of the cross-user session list. Also refetches
// (debounced 1s) whenever the store's liveVersion bumps, which happens when a
// realtime event references a session that is not on the current page.

import { useCallback, useEffect, useRef } from "react"
import { useAdminWorkSessionStore } from "../store/adminWorkSessionStore"
import type { SessionListParams } from "../types"

const LIVE_REFETCH_DEBOUNCE_MS = 1000

export function useAdminSessions(params: SessionListParams = {}) {
  const sessions = useAdminWorkSessionStore((s) => s.sessions)
  const pagination = useAdminWorkSessionStore((s) => s.pagination)
  const loading = useAdminWorkSessionStore((s) => s.loading)
  const error = useAdminWorkSessionStore((s) => s.error)
  const liveVersion = useAdminWorkSessionStore((s) => s.liveVersion)
  const fetchSessions = useAdminWorkSessionStore((s) => s.fetchSessions)
  const clearError = useAdminWorkSessionStore((s) => s.clearError)

  // Stringify params so we can compare cheaply without deep-equal
  const paramsKey = JSON.stringify(params)
  const lastKey = useRef<string>("")

  const refetch = useCallback(() => fetchSessions(params), [fetchSessions, params])

  // ── Refetch when the filters / page change ─────────────────────
  useEffect(() => {
    if (paramsKey !== lastKey.current) {
      lastKey.current = paramsKey
      fetchSessions(params)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey])

  // ── Debounced refetch on realtime "unknown row" events ─────────
  useEffect(() => {
    if (liveVersion === 0) return
    const timer = window.setTimeout(() => fetchSessions(params), LIVE_REFETCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveVersion])

  return {
    sessions,
    pagination,
    loading,
    error,
    /** Re-fetch with the same params (e.g. after a mutation) */
    refetch,
    clearError,
  }
}
