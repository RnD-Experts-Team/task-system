// ─── useAvailableTickets hook ─────────────────────────────────────────────────
// Fetches open, unassigned tickets from GET /tickets/available.
// Re-fetches automatically whenever the serialised params string changes.

import { useEffect, useRef } from "react"
import { useTicketsStore } from "../store/ticketStore"
import type { TicketListParams } from "../types"

export function useAvailableTickets(params: TicketListParams = {}) {
  const availableTickets      = useTicketsStore((s) => s.availableTickets)
  const availablePagination   = useTicketsStore((s) => s.availablePagination)
  const availableLoading      = useTicketsStore((s) => s.availableLoading)
  const availableError        = useTicketsStore((s) => s.availableError)
  const fetchAvailableTickets = useTicketsStore((s) => s.fetchAvailableTickets)
  const clearAvailableError   = useTicketsStore((s) => s.clearAvailableError)

  // Stringify params for a cheap equality check — avoids deep-equal on every render
  const paramsKey = JSON.stringify(params)
  const lastKey   = useRef<string>("")

  useEffect(() => {
    if (paramsKey !== lastKey.current) {
      lastKey.current = paramsKey
      fetchAvailableTickets(params)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey])

  return {
    availableTickets,
    availablePagination,
    availableLoading,
    availableError,
    refetch: () => fetchAvailableTickets(params),
    clearAvailableError,
  }
}
