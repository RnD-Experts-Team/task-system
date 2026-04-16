// ─── useTickets hook ──────────────────────────────────────────────────────────
// Fetches the main ticket list. Accepts optional status or type filter to switch
// between three different backend endpoints:
//   - no filter   → GET /tickets
//   - statusFilter → GET /tickets/status/{status}
//   - typeFilter   → GET /tickets/type/{type}
//
// Only one server filter can be active at a time. Selecting a status clears the
// type filter and vice-versa (enforced by the page component).
// Re-fetches automatically whenever the serialised params string changes.

import { useEffect, useRef } from "react"
import { useTicketsStore } from "../store/ticketStore"
import type { TicketListParams, ApiTicketStatus, ApiTicketType } from "../types"

type UseTicketsParams = TicketListParams & {
  /** When set to a status value, calls GET /tickets/status/{status} instead */
  statusFilter?: ApiTicketStatus | "all"
  /** When set to a type value, calls GET /tickets/type/{type} instead */
  typeFilter?: ApiTicketType | "all"
}

export function useTickets(params: UseTicketsParams = {}) {
  const tickets              = useTicketsStore((s) => s.tickets)
  const pagination           = useTicketsStore((s) => s.pagination)
  const loading              = useTicketsStore((s) => s.loading)
  const error                = useTicketsStore((s) => s.error)
  const fetchTickets         = useTicketsStore((s) => s.fetchTickets)
  const fetchTicketsByStatus = useTicketsStore((s) => s.fetchTicketsByStatus)
  const fetchTicketsByType   = useTicketsStore((s) => s.fetchTicketsByType)
  const clearError           = useTicketsStore((s) => s.clearError)

  // Pull out filter keys so the rest are pure list params
  const { statusFilter, typeFilter, ...listParams } = params

  // Serialise all params into a string for cheap equality check
  const paramsKey = JSON.stringify({ ...listParams, statusFilter, typeFilter })
  const lastKey   = useRef<string>("")

  useEffect(() => {
    if (paramsKey !== lastKey.current) {
      lastKey.current = paramsKey

      if (statusFilter && statusFilter !== "all") {
        // Active status filter → use the status-specific endpoint
        fetchTicketsByStatus(statusFilter, listParams)
      } else if (typeFilter && typeFilter !== "all") {
        // Active type filter → use the type-specific endpoint
        fetchTicketsByType(typeFilter, listParams)
      } else {
        // No active filter → fetch all tickets
        fetchTickets(listParams)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey])

  // Manual refetch with the current params (useful after write mutations)
  function refetch() {
    if (statusFilter && statusFilter !== "all") {
      fetchTicketsByStatus(statusFilter, listParams)
    } else if (typeFilter && typeFilter !== "all") {
      fetchTicketsByType(typeFilter, listParams)
    } else {
      fetchTickets(listParams)
    }
  }

  return { tickets, pagination, loading, error, refetch, clearError }
}
