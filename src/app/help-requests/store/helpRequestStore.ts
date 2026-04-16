// ─── Help Request Zustand Store ───────────────────────────────────────────────
// Manages four slices of state:
//   1. List slice      — all help requests from GET /help-requests
//   2. Available slice — available (unclaimed) requests from GET /help-requests/available
//   3. Detail slice    — a single help request from GET /help-requests/{id}
//   4. Mutation slice  — create / update / claim / unclaim / delete
//
// Cancel errors (isCancel) are intentionally ignored so unmount races don't
// show error banners in the UI.

import { create } from "zustand"
import { isCancel, AxiosError } from "axios"
import { helpRequestService } from "../services/helpRequestService"
import type {
  HelpRequest,
  HelpRequestPagination,
  HelpRequestListParams,
  CreateHelpRequestPayload,
  UpdateHelpRequestPayload,
  CompleteHelpRequestPayload,
} from "../types"
import type { ApiValidationError } from "@/types"

// ── Error helper ─────────────────────────────────────────────────────────────
// Extracts a readable message from Axios errors; falls back to a generic string.
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiValidationError | undefined
    if (data?.errors) return Object.values(data.errors).flat().join(". ")
    if (data?.message) return data.message
  }
  return fallback
}

// ── State interface ───────────────────────────────────────────────────────────

interface HelpRequestsState {
  // — List slice (GET /help-requests) ——
  helpRequests: HelpRequest[]
  pagination: HelpRequestPagination | null
  loading: boolean
  error: string | null
  /** Params used for the last list fetch (used to re-fetch after mutations) */
  lastParams: HelpRequestListParams

  // — Available slice (GET /help-requests/available) ——
  availableRequests: HelpRequest[]
  availablePagination: HelpRequestPagination | null
  availableLoading: boolean
  availableError: string | null
  lastAvailableParams: HelpRequestListParams

  // — Detail slice (GET /help-requests/{id}) ——
  selectedRequest: HelpRequest | null
  selectedLoading: boolean
  selectedError: string | null

  // — Mutation slice (create / update / claim / unclaim / delete) ——
  /** True while any create / update / claim / unclaim / delete call is in-flight */
  submitting: boolean
  /** Last mutation error message; null when there is none */
  submitError: string | null
}

// ── Actions interface ─────────────────────────────────────────────────────────

interface HelpRequestsActions {
  /** Fetch the full list of help requests (GET /help-requests) */
  fetchHelpRequests: (params?: HelpRequestListParams) => Promise<void>
  /** Fetch only available (unclaimed) requests (GET /help-requests/available) */
  fetchAvailableHelpRequests: (params?: HelpRequestListParams) => Promise<void>
  /** Fetch a single help request by id (GET /help-requests/{id}) */
  fetchHelpRequest: (id: number) => Promise<void>
  /** POST /help-requests — returns true on success */
  createHelpRequest: (payload: CreateHelpRequestPayload) => Promise<boolean>
  /** PUT /help-requests/{id} — returns true on success */
  updateHelpRequest: (id: number, payload: UpdateHelpRequestPayload) => Promise<boolean>
  /** POST /help-requests/{id}/claim — returns updated request or null */
  claimHelpRequest: (id: number) => Promise<HelpRequest | null>
  /** POST /help-requests/{id}/unclaim — returns updated request or null */
  unclaimHelpRequest: (id: number) => Promise<HelpRequest | null>
  /** POST /help-requests/{id}/assign/{userId} — returns updated request or null */
  assignHelpRequest: (id: number, userId: number) => Promise<HelpRequest | null>
  /** POST /help-requests/{id}/complete — returns updated request or null */
  completeHelpRequest: (id: number, payload: CompleteHelpRequestPayload) => Promise<HelpRequest | null>
  /** DELETE /help-requests/{id} — returns true on success */
  deleteHelpRequest: (id: number) => Promise<boolean>
  clearError: () => void
  clearAvailableError: () => void
  clearSelectedError: () => void
  clearSelectedRequest: () => void
  clearSubmitError: () => void
}

type HelpRequestsStore = HelpRequestsState & HelpRequestsActions

// ── Store ─────────────────────────────────────────────────────────────────────

export const useHelpRequestsStore = create<HelpRequestsStore>()((set, get) => ({
  // Initial list state
  helpRequests: [],
  pagination: null,
  loading: false,
  error: null,
  lastParams: {},

  // Initial available slice state
  availableRequests: [],
  availablePagination: null,
  availableLoading: false,
  availableError: null,
  lastAvailableParams: {},

  // Initial detail state
  selectedRequest: null,
  selectedLoading: false,
  selectedError: null,

  // Initial mutation state
  submitting: false,
  submitError: null,

  // ── fetchHelpRequests ────────────────────────────────────────────────────────
  fetchHelpRequests: async (params: HelpRequestListParams = {}) => {
    set({ loading: true, error: null, lastParams: params })
    try {
      const response = await helpRequestService.getAll(params)
      set({ helpRequests: response.data, pagination: response.pagination })
    } catch (err) {
      // Ignore axios cancel errors (caused by component unmount races)
      if (!isCancel(err)) {
        set({ error: extractErrorMessage(err, "Failed to load help requests.") })
      }
    } finally {
      set({ loading: false })
    }
  },

  // ── fetchAvailableHelpRequests ───────────────────────────────────────────────
  fetchAvailableHelpRequests: async (params: HelpRequestListParams = {}) => {
    set({ availableLoading: true, availableError: null, lastAvailableParams: params })
    try {
      const response = await helpRequestService.getAvailable(params)
      set({
        availableRequests: response.data,
        availablePagination: response.pagination,
      })
    } catch (err) {
      if (!isCancel(err)) {
        set({
          availableError: extractErrorMessage(err, "Failed to load available help requests."),
        })
      }
    } finally {
      set({ availableLoading: false })
    }
  },

  // ── fetchHelpRequest ─────────────────────────────────────────────────────────
  fetchHelpRequest: async (id: number) => {
    set({ selectedLoading: true, selectedError: null, selectedRequest: null })
    try {
      const request = await helpRequestService.getById(id)
      set({ selectedRequest: request })
    } catch (err) {
      if (!isCancel(err)) {
        set({
          selectedError: extractErrorMessage(err, "Failed to load help request details."),
        })
      }
    } finally {
      set({ selectedLoading: false })
    }
  },

  // ── Clear helpers ────────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),
  clearAvailableError: () => set({ availableError: null }),
  clearSelectedError: () => set({ selectedError: null }),
  clearSelectedRequest: () => set({ selectedRequest: null }),
  clearSubmitError: () => set({ submitError: null }),

  // ── createHelpRequest ────────────────────────────────────────────────────────
  // POST /help-requests — calls service.create() and re-fetches both lists on success
  createHelpRequest: async (payload: CreateHelpRequestPayload) => {
    set({ submitting: true, submitError: null })
    try {
      await helpRequestService.create(payload)
      // Re-fetch both lists so the new item appears immediately
      const { lastParams, lastAvailableParams } = get()
      await Promise.all([
        get().fetchHelpRequests(lastParams),
        get().fetchAvailableHelpRequests(lastAvailableParams),
      ])
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to create help request.") })
      }
      return false
    } finally {
      set({ submitting: false })
    }
  },

  // ── updateHelpRequest ────────────────────────────────────────────────────────
  // PUT /help-requests/{id} — calls service.update() and re-fetches both lists
  updateHelpRequest: async (id: number, payload: UpdateHelpRequestPayload) => {
    set({ submitting: true, submitError: null })
    try {
      await helpRequestService.update(id, payload)
      const { lastParams, lastAvailableParams } = get()
      await Promise.all([
        get().fetchHelpRequests(lastParams),
        get().fetchAvailableHelpRequests(lastAvailableParams),
      ])
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to update help request.") })
      }
      return false
    } finally {
      set({ submitting: false })
    }
  },

  // ── claimHelpRequest ─────────────────────────────────────────────────────────
  // POST /help-requests/{id}/claim — optimistically updates the list item
  claimHelpRequest: async (id: number) => {
    set({ submitting: true, submitError: null })
    try {
      const updated = await helpRequestService.claim(id)
      // Replace the item inline so the list updates without a full refetch
      set((state) => {
        const wasInAvailable = state.availableRequests.some((r) => r.id === id)
        return {
          helpRequests: state.helpRequests.map((r) => (r.id === id ? updated : r)),
          availableRequests: state.availableRequests.filter((r) => r.id !== id),
          availablePagination: wasInAvailable && state.availablePagination 
            ? { ...state.availablePagination, total: state.availablePagination.total - 1 }
            : state.availablePagination,
        }
      })
      return updated
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to claim help request.") })
      }
      return null
    } finally {
      set({ submitting: false })
    }
  },

  // ── unclaimHelpRequest ────────────────────────────────────────────────────────
  // POST /help-requests/{id}/unclaim — updates the list item inline
  unclaimHelpRequest: async (id: number) => {
    set({ submitting: true, submitError: null })
    try {
      const updated = await helpRequestService.unclaim(id)
      // Replace the item inline in the main list
      set((state) => ({
        helpRequests: state.helpRequests.map((r) => (r.id === id ? updated : r)),
      }))
      // Re-fetch available so the item may re-appear there
      get().fetchAvailableHelpRequests(get().lastAvailableParams)
      return updated
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to unclaim help request.") })
      }
      return null
    } finally {
      set({ submitting: false })
    }
  },

  // ── assignHelpRequest ─────────────────────────────────────────────────────────
  // POST /help-requests/{id}/assign/{userId} — assigns a user as helper
  assignHelpRequest: async (id: number, userId: number) => {
    set({ submitting: true, submitError: null })
    try {
      const updated = await helpRequestService.assign(id, userId)
      // Replace the item inline so the table reflects the new helper immediately
      set((state) => {
        const wasInAvailable = state.availableRequests.some((r) => r.id === id)
        return {
          helpRequests: state.helpRequests.map((r) => (r.id === id ? updated : r)),
          availableRequests: state.availableRequests.filter((r) => r.id !== id),
          availablePagination: wasInAvailable && state.availablePagination 
            ? { ...state.availablePagination, total: state.availablePagination.total - 1 }
            : state.availablePagination,
        }
      })
      return updated
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to assign help request.") })
      }
      return null
    } finally {
      set({ submitting: false })
    }
  },

  // ── completeHelpRequest ───────────────────────────────────────────────────────
  // POST /help-requests/{id}/complete — marks as completed with a rating
  completeHelpRequest: async (id: number, payload: CompleteHelpRequestPayload) => {
    set({ submitting: true, submitError: null })
    try {
      const updated = await helpRequestService.complete(id, payload)
      // Replace the item inline so the table shows the completed state immediately
      set((state) => {
        const wasInAvailable = state.availableRequests.some((r) => r.id === id)
        return {
          helpRequests: state.helpRequests.map((r) => (r.id === id ? updated : r)),
          availableRequests: state.availableRequests.filter((r) => r.id !== id),
          availablePagination: wasInAvailable && state.availablePagination 
            ? { ...state.availablePagination, total: state.availablePagination.total - 1 }
            : state.availablePagination,
        }
      })
      return updated
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to complete help request.") })
      }
      return null
    } finally {
      set({ submitting: false })
    }
  },

  // ── deleteHelpRequest ─────────────────────────────────────────────────────────
  // DELETE /help-requests/{id} — removes the item from both lists
  deleteHelpRequest: async (id: number) => {
    set({ submitting: true, submitError: null })
    try {
      await helpRequestService.delete(id)
      // Remove the deleted item from both in-memory lists immediately
      set((state) => {
        const wasInAvailable = state.availableRequests.some((r) => r.id === id)
        return {
          helpRequests: state.helpRequests.filter((r) => r.id !== id),
          availableRequests: state.availableRequests.filter((r) => r.id !== id),
          availablePagination: wasInAvailable && state.availablePagination 
            ? { ...state.availablePagination, total: state.availablePagination.total - 1 }
            : state.availablePagination,
          pagination: state.pagination 
            ? { ...state.pagination, total: state.pagination.total - 1 }
            : state.pagination,
        }
      })
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to delete help request.") })
      }
      return false
    } finally {
      set({ submitting: false })
    }
  },
}))
