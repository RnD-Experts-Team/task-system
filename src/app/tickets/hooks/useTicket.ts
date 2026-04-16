// ─── useTicket hook ───────────────────────────────────────────────────────────
// Fetches a single ticket by id from GET /tickets/{id}.
// Fires on mount and whenever the id changes.
// Clears the selected ticket from the store on unmount or id change to prevent
// stale data from flashing when a different ticket is subsequently opened.

import { useEffect } from "react"
import { useTicketsStore } from "../store/ticketStore"

export function useTicket(id: number | null) {
  const selectedTicket    = useTicketsStore((s) => s.selectedTicket)
  const selectedLoading   = useTicketsStore((s) => s.selectedLoading)
  const selectedError     = useTicketsStore((s) => s.selectedError)
  const fetchTicket       = useTicketsStore((s) => s.fetchTicket)
  const clearSelectedTicket = useTicketsStore((s) => s.clearSelectedTicket)
  const clearSelectedError  = useTicketsStore((s) => s.clearSelectedError)

  useEffect(() => {
    if (id !== null) {
      fetchTicket(id)
    }
    // Clear on unmount or when id changes to avoid showing stale data
    return () => {
      clearSelectedTicket()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return {
    ticket: selectedTicket,
    loading: selectedLoading,
    error: selectedError,
    clearError: clearSelectedError,
  }
}
