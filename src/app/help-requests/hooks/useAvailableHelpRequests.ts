// ─── useAvailableHelpRequests hook ───────────────────────────────────────────
// Fetches help requests that are still unclaimed and not completed from
// GET /help-requests/available.
// Re-fetches automatically whenever the serialised params change.

import { useEffect, useRef } from "react"
import { useHelpRequestsStore } from "../store/helpRequestStore"
import type { HelpRequestListParams } from "../types"

export function useAvailableHelpRequests(params: HelpRequestListParams = {}) {
  const availableRequests          = useHelpRequestsStore((s) => s.availableRequests)
  const availablePagination        = useHelpRequestsStore((s) => s.availablePagination)
  const availableLoading           = useHelpRequestsStore((s) => s.availableLoading)
  const availableError             = useHelpRequestsStore((s) => s.availableError)
  const fetchAvailableHelpRequests = useHelpRequestsStore((s) => s.fetchAvailableHelpRequests)
  const clearAvailableError        = useHelpRequestsStore((s) => s.clearAvailableError)

  // Stringify params for cheap comparison — avoids deep-equal on every render
  const paramsKey = JSON.stringify(params)
  const lastKey   = useRef<string>("")

  useEffect(() => {
    if (paramsKey !== lastKey.current) {
      lastKey.current = paramsKey
      fetchAvailableHelpRequests(params)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey])

  return {
    availableRequests,
    availablePagination,
    availableLoading,
    availableError,
    /** Re-fetch with the same params */
    refetch: () => fetchAvailableHelpRequests(params),
    clearAvailableError,
  }
}
