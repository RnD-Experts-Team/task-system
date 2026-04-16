// ─── useHelpRequests hook ─────────────────────────────────────────────────────
// Fetches the full list of help requests from GET /help-requests.
// Re-fetches automatically whenever the serialised params change.

import { useEffect, useRef } from "react"
import { useHelpRequestsStore } from "../store/helpRequestStore"
import type { HelpRequestListParams } from "../types"

export function useHelpRequests(params: HelpRequestListParams = {}) {
  const helpRequests       = useHelpRequestsStore((s) => s.helpRequests)
  const pagination         = useHelpRequestsStore((s) => s.pagination)
  const loading            = useHelpRequestsStore((s) => s.loading)
  const error              = useHelpRequestsStore((s) => s.error)
  const fetchHelpRequests  = useHelpRequestsStore((s) => s.fetchHelpRequests)
  const clearError         = useHelpRequestsStore((s) => s.clearError)

  // Stringify params for cheap comparison — avoids deep-equal on every render
  const paramsKey = JSON.stringify(params)
  const lastKey   = useRef<string>("")

  useEffect(() => {
    if (paramsKey !== lastKey.current) {
      lastKey.current = paramsKey
      fetchHelpRequests(params)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey])

  return {
    helpRequests,
    pagination,
    loading,
    error,
    /** Re-fetch with the same params (e.g. after a mutation) */
    refetch: () => fetchHelpRequests(params),
    clearError,
  }
}
