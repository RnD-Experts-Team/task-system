// ─── Tickets Zustand Store ────────────────────────────────────────────────────
// Manages ticket state across three slices:
//   1. list      — GET /tickets (or filtered via status/type endpoints)
//   2. available — GET /tickets/available
//   3. detail    — GET /tickets/{id}
//   4. write     — create / update / claim / assign / unassign / status / complete
//
// Cancel errors (axios isCancel) are silently ignored so rapid page/filter
// changes that abort in-flight requests don't flash error banners in the UI.
// After each successful write, the affected ticket is patched in-place across
// all relevant state slices so the UI stays consistent without a full re-fetch.

import { create } from "zustand"
import { isCancel, AxiosError } from "axios"
import { ticketsService } from "../services/ticketsService"
import type {
  ApiTicket,
  ApiTicketPagination,
  ApiTicketStatus,
  ApiTicketType,
  TicketFormValues,
  TicketListParams,
} from "../types"

// ── Error helper ─────────────────────────────────────────────────────────────
// Extracts the most useful message from an Axios error response body.
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as
      | { errors?: Record<string, string[]>; message?: string }
      | undefined
    if (data?.errors) return Object.values(data.errors).flat().join(". ")
    if (data?.message) return data.message
  }
  return fallback
}

// ── State interface ───────────────────────────────────────────────────────────

interface TicketsState {
  // — List slice (all / filtered by status or type) ——
  tickets: ApiTicket[]
  pagination: ApiTicketPagination | null
  loading: boolean
  error: string | null

  // — Available slice (GET /tickets/available) ——
  availableTickets: ApiTicket[]
  availablePagination: ApiTicketPagination | null
  availableLoading: boolean
  availableError: string | null

  // — Detail slice (GET /tickets/{id}) ——
  selectedTicket: ApiTicket | null
  selectedLoading: boolean
  selectedError: string | null

  // — Write slice (create / update / claim / assign etc.) ——
  // `submitting` is used for the full create/update form
  submitting: boolean
  submitError: string | null
  // `actionSubmitting` is for quick actions: claim, unassign, status, complete
  actionSubmitting: boolean
  actionError: string | null
}

// ── Actions interface ─────────────────────────────────────────────────────────

interface TicketsActions {
  /** Fetch all tickets — GET /tickets */
  fetchTickets: (params?: TicketListParams) => Promise<void>
  /** Fetch tickets filtered by status — GET /tickets/status/{status} */
  fetchTicketsByStatus: (status: ApiTicketStatus, params?: TicketListParams) => Promise<void>
  /** Fetch tickets filtered by type — GET /tickets/type/{type} */
  fetchTicketsByType: (type: ApiTicketType, params?: TicketListParams) => Promise<void>
  /** Fetch available (open, unassigned) tickets — GET /tickets/available */
  fetchAvailableTickets: (params?: TicketListParams) => Promise<void>
  /** Fetch a single ticket with full relations — GET /tickets/{id} */
  fetchTicket: (id: number) => Promise<void>

  // ── Write actions — each returns true on success, false on failure ──────────
  /** POST /tickets — create a new ticket. Returns true on success. */
  createTicket: (values: TicketFormValues) => Promise<boolean>
  /** POST /tickets/{id} — update an existing ticket. Returns true on success. */
  updateTicket: (id: number, values: TicketFormValues) => Promise<boolean>
  /** POST /tickets/{id}/claim — self-assign the current user. Returns true on success. */
  claimTicket: (id: number) => Promise<boolean>
  /** POST /tickets/{id}/assign/{userId} — assign to a specific user. Returns true on success. */
  assignTicket: (id: number, userId: number) => Promise<boolean>
  /** POST /tickets/{id}/unassign — remove the assignee. Returns true on success. */
  unassignTicket: (id: number) => Promise<boolean>
  /** POST /tickets/{id}/status — change the status. Returns true on success. */
  updateTicketStatus: (id: number, status: ApiTicketStatus) => Promise<boolean>
  /** POST /tickets/{id}/complete — mark the ticket complete. Returns true on success. */
  completeTicket: (id: number) => Promise<boolean>
  /** DELETE /tickets/{id} — permanently delete a ticket. Returns true on success. */
  deleteTicket: (id: number) => Promise<boolean>

  // Clear helpers — reset error/state without triggering a re-fetch
  clearError: () => void
  clearAvailableError: () => void
  clearSelectedError: () => void
  clearSelectedTicket: () => void
  clearSubmitError: () => void
  clearActionError: () => void
}

type TicketsStore = TicketsState & TicketsActions

// ── Store ─────────────────────────────────────────────────────────────────────

export const useTicketsStore = create<TicketsStore>()((set) => ({
  // Initial list state
  tickets: [],
  pagination: null,
  loading: false,
  error: null,

  // Initial available state
  availableTickets: [],
  availablePagination: null,
  availableLoading: false,
  availableError: null,

  // Initial detail state
  selectedTicket: null,
  selectedLoading: false,
  selectedError: null,

  // Initial write state
  submitting: false,
  submitError: null,
  actionSubmitting: false,
  actionError: null,

  // ── fetchTickets ────────────────────────────────────────────────────────────
  // Called when no status/type filter is active (shows all tickets)
  fetchTickets: async (params: TicketListParams = {}) => {
    // Only show loading if we don't have data, to prevent skeletons on silent refresh
    set((s) => ({ loading: s.tickets.length === 0, error: null }))
    try {
      const response = await ticketsService.getAll(params)
      set({ tickets: response.data, pagination: response.pagination })
    } catch (err) {
      // Skip cancel errors — they happen when the user changes filters quickly
      if (!isCancel(err)) {
        set({ error: extractErrorMessage(err, "Failed to load tickets.") })
      }
    } finally {
      set({ loading: false })
    }
  },

  // ── fetchTicketsByStatus ────────────────────────────────────────────────────
  // Called when a status filter is active — uses a dedicated status endpoint
  fetchTicketsByStatus: async (status: ApiTicketStatus, params: TicketListParams = {}) => {
    set((s) => ({ loading: s.tickets.length === 0, error: null }))
    try {
      const response = await ticketsService.getByStatus(status, params)
      set({ tickets: response.data, pagination: response.pagination })
    } catch (err) {
      if (!isCancel(err)) {
        set({ error: extractErrorMessage(err, "Failed to load tickets by status.") })
      }
    } finally {
      set({ loading: false })
    }
  },

  // ── fetchTicketsByType ──────────────────────────────────────────────────────
  // Called when a type filter is active — uses a dedicated type endpoint
  fetchTicketsByType: async (type: ApiTicketType, params: TicketListParams = {}) => {
    set((s) => ({ loading: s.tickets.length === 0, error: null }))
    try {
      const response = await ticketsService.getByType(type, params)
      set({ tickets: response.data, pagination: response.pagination })
    } catch (err) {
      if (!isCancel(err)) {
        set({ error: extractErrorMessage(err, "Failed to load tickets by type.") })
      }
    } finally {
      set({ loading: false })
    }
  },

  // ── fetchAvailableTickets ───────────────────────────────────────────────────
  // Fetches only open, unassigned tickets for the Available tab
  fetchAvailableTickets: async (params: TicketListParams = {}) => {
    set((s) => ({ availableLoading: s.availableTickets.length === 0, availableError: null }))
    try {
      const response = await ticketsService.getAvailable(params)
      set({ availableTickets: response.data, availablePagination: response.pagination })
    } catch (err) {
      if (!isCancel(err)) {
        set({ availableError: extractErrorMessage(err, "Failed to load available tickets.") })
      }
    } finally {
      set({ availableLoading: false })
    }
  },

  // ── fetchTicket ─────────────────────────────────────────────────────────────
  // Fetches a single ticket with all relations for the detail sheet
  fetchTicket: async (id: number) => {
    set({ selectedLoading: true, selectedError: null, selectedTicket: null })
    try {
      const ticket = await ticketsService.getById(id)
      set({ selectedTicket: ticket })
    } catch (err) {
      if (!isCancel(err)) {
        set({ selectedError: extractErrorMessage(err, "Failed to load ticket details.") })
      }
    } finally {
      set({ selectedLoading: false })
    }
  },

  // ── createTicket ─────────────────────────────────────────────────────────────
  // POST /tickets — submits a new ticket and prepends it to the list.
  createTicket: async (values: TicketFormValues): Promise<boolean> => {
    set({ submitting: true, submitError: null })
    try {
      const ticket = await ticketsService.create(values)
      // Prepend to the current list so it appears immediately without a re-fetch
      set((s) => ({
        tickets: [ticket, ...s.tickets],
      }))
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to create ticket.") })
      }
      return false
    } finally {
      set({ submitting: false })
    }
  },

  // ── updateTicket ─────────────────────────────────────────────────────────────
  // POST /tickets/{id} — updates a ticket and syncs the new data into all slices.
  updateTicket: async (id: number, values: TicketFormValues): Promise<boolean> => {
    set({ submitting: true, submitError: null })
    try {
      const updated = await ticketsService.update(id, values)
      // Replace the ticket in-place across list, available list, and detail slices
      set((s) => ({
        tickets:          s.tickets.map((t) => (t.id === id ? updated : t)),
        availableTickets: s.availableTickets.map((t) => (t.id === id ? updated : t)),
        selectedTicket:   s.selectedTicket?.id === id ? updated : s.selectedTicket,
      }))
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to update ticket.") })
      }
      return false
    } finally {
      set({ submitting: false })
    }
  },

  // ── claimTicket ──────────────────────────────────────────────────────────────
  // POST /tickets/{id}/claim — self-assigns the current user as the assignee.
  claimTicket: async (id: number): Promise<boolean> => {
    set({ actionSubmitting: true, actionError: null })
    try {
      const updated = await ticketsService.claim(id)
      set((s) => {
        const wasAvailable = s.availableTickets.some((t) => t.id === id)
        return {
          tickets: s.tickets.map((t) => (t.id === id ? updated : t)),
          // Claimed ticket is no longer "available" (it now has an assignee)
          availableTickets: s.availableTickets.filter((t) => t.id !== id),
          availablePagination:
            s.availablePagination && wasAvailable
              ? { ...s.availablePagination, total: s.availablePagination.total - 1 }
              : s.availablePagination,
          selectedTicket: s.selectedTicket?.id === id ? updated : s.selectedTicket,
        }
      })
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ actionError: extractErrorMessage(err, "Failed to claim ticket.") })
      }
      return false
    } finally {
      set({ actionSubmitting: false })
    }
  },

  // ── assignTicket ─────────────────────────────────────────────────────────────
  // POST /tickets/{id}/assign/{userId} — assigns a specific user.
  assignTicket: async (id: number, userId: number): Promise<boolean> => {
    set({ actionSubmitting: true, actionError: null })
    try {
      const updated = await ticketsService.assign(id, userId)
      set((s) => {
        const wasAvailable = s.availableTickets.some((t) => t.id === id)
        return {
          tickets: s.tickets.map((t) => (t.id === id ? updated : t)),
          availableTickets: s.availableTickets.filter((t) => t.id !== id),
          availablePagination:
            s.availablePagination && wasAvailable
              ? { ...s.availablePagination, total: s.availablePagination.total - 1 }
              : s.availablePagination,
          selectedTicket: s.selectedTicket?.id === id ? updated : s.selectedTicket,
        }
      })
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ actionError: extractErrorMessage(err, "Failed to assign ticket.") })
      }
      return false
    } finally {
      set({ actionSubmitting: false })
    }
  },

  // ── unassignTicket ───────────────────────────────────────────────────────────
  // POST /tickets/{id}/unassign — removes the current assignee.
  unassignTicket: async (id: number): Promise<boolean> => {
    set({ actionSubmitting: true, actionError: null })
    try {
      const updated = await ticketsService.unassign(id)
      set((s) => ({
        tickets:          s.tickets.map((t) => (t.id === id ? updated : t)),
        selectedTicket:   s.selectedTicket?.id === id ? updated : s.selectedTicket,
      }))
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ actionError: extractErrorMessage(err, "Failed to unassign ticket.") })
      }
      return false
    } finally {
      set({ actionSubmitting: false })
    }
  },

  // ── updateTicketStatus ───────────────────────────────────────────────────────
  // POST /tickets/{id}/status — changes the status field.
  updateTicketStatus: async (id: number, status: ApiTicketStatus): Promise<boolean> => {
    set({ actionSubmitting: true, actionError: null })
    try {
      const updated = await ticketsService.updateStatus(id, status)
      set((s) => ({
        tickets:          s.tickets.map((t) => (t.id === id ? updated : t)),
        availableTickets: s.availableTickets.map((t) => (t.id === id ? updated : t)),
        selectedTicket:   s.selectedTicket?.id === id ? updated : s.selectedTicket,
      }))
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ actionError: extractErrorMessage(err, "Failed to update ticket status.") })
      }
      return false
    } finally {
      set({ actionSubmitting: false })
    }
  },

  // ── completeTicket ───────────────────────────────────────────────────────────
  // POST /tickets/{id}/complete — marks the ticket as completed.
  completeTicket: async (id: number): Promise<boolean> => {
    set({ actionSubmitting: true, actionError: null })
    try {
      const updated = await ticketsService.complete(id)
      set((s) => ({
        tickets:          s.tickets.map((t) => (t.id === id ? updated : t)),
        availableTickets: s.availableTickets.filter((t) => t.id !== id),
        selectedTicket:   s.selectedTicket?.id === id ? updated : s.selectedTicket,
      }))
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ actionError: extractErrorMessage(err, "Failed to complete ticket.") })
      }
      return false
    } finally {
      set({ actionSubmitting: false })
    }
  },

  // ── deleteTicket ────────────────────────────────────────────────────────────
  // DELETE /tickets/{id} — permanently removes the ticket from all slices.
  deleteTicket: async (id: number): Promise<boolean> => {
    set({ actionSubmitting: true, actionError: null })
    try {
      await ticketsService.delete(id)
      // Remove from all slices so UI updates instantly without a refetch
      set((s) => ({
        tickets:          s.tickets.filter((t) => t.id !== id),
        availableTickets: s.availableTickets.filter((t) => t.id !== id),
        selectedTicket:   s.selectedTicket?.id === id ? null : s.selectedTicket,
      }))
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ actionError: extractErrorMessage(err, "Failed to delete ticket.") })
      }
      return false
    } finally {
      set({ actionSubmitting: false })
    }
  },

  // ── Clear helpers ────────────────────────────────────────────────────────────
  clearError:          () => set({ error: null }),
  clearAvailableError: () => set({ availableError: null }),
  clearSelectedError:  () => set({ selectedError: null }),
  clearSelectedTicket: () => set({ selectedTicket: null }),
  clearSubmitError:    () => set({ submitError: null }),
  clearActionError:    () => set({ actionError: null }),
}))
