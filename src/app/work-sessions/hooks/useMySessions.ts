import { useCallback, useEffect, useRef } from "react"
import { useWorkSessionStore } from "../store/workSessionStore"
import type { SessionListParams } from "../types"

/**
 * useMySessions — fetches GET /work-sessions whenever the serialized params
 * change (same pattern as useTasks). The caller owns filter/pagination state.
 *
 * Returns: sessions, pagination, loading, error, refetch, clearError
 */
export function useMySessions(params: SessionListParams = {}) {
  const sessions = useWorkSessionStore((s) => s.history)
  const pagination = useWorkSessionStore((s) => s.historyPagination)
  const loading = useWorkSessionStore((s) => s.historyLoading)
  const error = useWorkSessionStore((s) => s.historyError)
  const fetchHistory = useWorkSessionStore((s) => s.fetchHistory)
  const clearHistoryError = useWorkSessionStore((s) => s.clearHistoryError)

  // Stringify params so we can compare cheaply without deep-equal
  const paramsKey = JSON.stringify(params)
  const lastKey = useRef<string>("")

  const refetch = useCallback(() => fetchHistory(params), [fetchHistory, params])
  const clearError = useCallback(() => clearHistoryError(), [clearHistoryError])

  useEffect(() => {
    if (paramsKey !== lastKey.current) {
      lastKey.current = paramsKey
      fetchHistory(params)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey])

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
