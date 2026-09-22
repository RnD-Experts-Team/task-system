// src/app/work-sessions/store/workSessionStore.ts
// Employee-side zustand store for Daily Work Sessions. Holds today's session
// (kept in sync after every item mutation — no refetch), the history list and
// the currently selected past session.

import { create } from "zustand"
import { isCancel } from "axios"
import { workSessionService } from "../services/workSessionService"
import { extractErrorMessage } from "../utils/format"
import type {
  ConfirmSessionPayload,
  CreateItemPayload,
  ItemOutcome,
  Pagination,
  SessionListParams,
  StartSessionPayload,
  TodayPayload,
  UpdateItemPayload,
  WorkSession,
  WorkSessionItem,
  WorkSessionWithCounts,
} from "../types"

// ─── Helpers ──────────────────────────────────────────────────────

/** Returns a copy of the session with one item replaced (matched by id) */
function replaceItem(session: WorkSession, updated: WorkSessionItem): WorkSession {
  const items = session.items ?? []
  const exists = items.some((i) => i.id === updated.id)
  return {
    ...session,
    items: exists ? items.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)) : [...items, updated],
  }
}

/** Re-orders session.items to match the given id order (unknown ids keep relative order at the end) */
function orderItems(items: WorkSessionItem[], itemIds: number[]): WorkSessionItem[] {
  const byId = new Map(items.map((i) => [i.id, i]))
  const ordered = itemIds.map((id) => byId.get(id)).filter((i): i is WorkSessionItem => !!i)
  const rest = items.filter((i) => !itemIds.includes(i.id))
  return [...ordered, ...rest].map((item, index) => ({ ...item, sort_order: index }))
}

// ─── State ────────────────────────────────────────────────────────

interface WorkSessionState {
  // Today slice — GET /work-sessions/today
  today: TodayPayload | null
  todayLoading: boolean
  todayError: string | null
  /** today.session, mirrored at top level and kept in sync after every mutation */
  session: WorkSession | null

  // Mutation slice — shared by start / items / summary / confirm
  submitting: boolean
  submitError: string | null

  // History slice — GET /work-sessions
  history: WorkSessionWithCounts[]
  historyPagination: Pagination | null
  historyLoading: boolean
  historyError: string | null
  lastHistoryParams: SessionListParams | null

  // Selected past session — GET /work-sessions/{id}
  selectedSession: WorkSession | null
  selectedLoading: boolean
  selectedError: string | null
}

// ─── Actions ──────────────────────────────────────────────────────

interface WorkSessionActions {
  // Load today's payload (session + carry-over candidates + previous open sessions)
  fetchToday: () => Promise<void>
  // Start today's session — returns it on success, null on failure
  startSession: (payload?: StartSessionPayload) => Promise<WorkSession | null>
  // Item mutations on today's session — update session.items in place
  addItem: (payload: CreateItemPayload) => Promise<WorkSessionItem | null>
  updateItem: (itemId: number, payload: UpdateItemPayload) => Promise<WorkSessionItem | null>
  deleteItem: (itemId: number) => Promise<boolean>
  // Optimistic local reorder → API call → revert on error
  reorderItems: (itemIds: number[]) => Promise<boolean>
  setOutcome: (itemId: number, outcome: ItemOutcome, note?: string | null) => Promise<WorkSessionItem | null>
  // Debounced summary save (silent)
  updateSummary: (note: string | null) => Promise<boolean>
  // Lock today's session with every item's outcome
  confirmSession: (payload: ConfirmSessionPayload) => Promise<WorkSession | null>
  // History list (params-keyed)
  fetchHistory: (params?: SessionListParams) => Promise<void>
  // One past session with its items
  fetchSession: (id: number) => Promise<void>
  // Confirm a past open session from History (updates selectedSession + history row)
  confirmSessionById: (id: number, payload: ConfirmSessionPayload) => Promise<WorkSession | null>
  // Clear helpers
  clearTodayError: () => void
  clearSubmitError: () => void
  clearHistoryError: () => void
  clearSelectedSession: () => void
  clearSelectedError: () => void
}

type WorkSessionStore = WorkSessionState & WorkSessionActions

// ─── Store ────────────────────────────────────────────────────────

export const useWorkSessionStore = create<WorkSessionStore>()((set, get) => ({
  // Initial state
  today: null,
  todayLoading: false,
  todayError: null,
  session: null,

  submitting: false,
  submitError: null,

  history: [],
  historyPagination: null,
  historyLoading: false,
  historyError: null,
  lastHistoryParams: null,

  selectedSession: null,
  selectedLoading: false,
  selectedError: null,

  // ─── Today ─────────────────────────────────────────────────────
  fetchToday: async () => {
    set({ todayLoading: true, todayError: null })
    try {
      const today = await workSessionService.getToday()
      set({ today, session: today.session })
    } catch (err) {
      // Skip cancelled requests (e.g. component unmount)
      if (!isCancel(err)) {
        set({ todayError: extractErrorMessage(err, "Failed to load today's session.") })
      }
    } finally {
      set({ todayLoading: false })
    }
  },

  // ─── Start ─────────────────────────────────────────────────────
  startSession: async (payload = {}) => {
    set({ submitting: true, submitError: null })
    try {
      const session = await workSessionService.start(payload)
      set((state) => ({
        session,
        // Carry-over candidates are consumed once the day starts
        today: state.today ? { ...state.today, session, carry_over_candidates: [] } : state.today,
      }))
      return session
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to start your day.") })
      }
      return null
    } finally {
      set({ submitting: false })
    }
  },

  // ─── Items — Add ───────────────────────────────────────────────
  addItem: async (payload) => {
    const session = get().session
    if (!session) return null
    set({ submitting: true, submitError: null })
    try {
      const item = await workSessionService.addItem(session.id, payload)
      set((state) => ({ session: state.session ? replaceItem(state.session, item) : state.session }))
      return item
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to add item.") })
      }
      return null
    } finally {
      set({ submitting: false })
    }
  },

  // ─── Items — Update ────────────────────────────────────────────
  updateItem: async (itemId, payload) => {
    const session = get().session
    if (!session) return null
    set({ submitting: true, submitError: null })
    try {
      const item = await workSessionService.updateItem(session.id, itemId, payload)
      set((state) => ({ session: state.session ? replaceItem(state.session, item) : state.session }))
      return item
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to update item.") })
      }
      return null
    } finally {
      set({ submitting: false })
    }
  },

  // ─── Items — Delete ────────────────────────────────────────────
  deleteItem: async (itemId) => {
    const session = get().session
    if (!session) return false
    set({ submitting: true, submitError: null })
    try {
      await workSessionService.deleteItem(session.id, itemId)
      set((state) => ({
        session: state.session
          ? { ...state.session, items: (state.session.items ?? []).filter((i) => i.id !== itemId) }
          : state.session,
      }))
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to remove item.") })
      }
      return false
    } finally {
      set({ submitting: false })
    }
  },

  // ─── Items — Reorder (optimistic) ──────────────────────────────
  reorderItems: async (itemIds) => {
    const session = get().session
    if (!session) return false
    const previousItems = session.items ?? []
    // Apply the new order locally first so the list doesn't snap back
    set({ session: { ...session, items: orderItems(previousItems, itemIds) }, submitError: null })
    try {
      const items = await workSessionService.reorderItems(session.id, itemIds)
      // Trust the server's canonical order/sort_order when it returns the list
      if (Array.isArray(items) && items.length > 0) {
        set((state) => (state.session ? { session: { ...state.session, items } } : {}))
      }
      return true
    } catch (err) {
      if (!isCancel(err)) {
        // Revert to the previous order
        set((state) => ({
          session: state.session ? { ...state.session, items: previousItems } : state.session,
          submitError: extractErrorMessage(err, "Failed to reorder items."),
        }))
      }
      return false
    }
  },

  // ─── Items — Quick outcome ─────────────────────────────────────
  setOutcome: async (itemId, outcome, note) => {
    const session = get().session
    if (!session) return null
    set({ submitError: null })
    try {
      const item = await workSessionService.setOutcome(session.id, itemId, {
        outcome,
        ...(note !== undefined ? { outcome_note: note } : {}),
      })
      set((state) => ({ session: state.session ? replaceItem(state.session, item) : state.session }))
      return item
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to update outcome.") })
      }
      return null
    }
  },

  // ─── Summary (silent, debounced by the caller) ─────────────────
  updateSummary: async (note) => {
    const session = get().session
    if (!session) return false
    try {
      const updated = await workSessionService.updateSummary(session.id, note)
      set((state) => ({
        session: state.session
          ? { ...state.session, summary_note: updated.summary_note ?? note, updated_at: updated.updated_at }
          : state.session,
      }))
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to save summary.") })
      }
      return false
    }
  },

  // ─── Confirm today ─────────────────────────────────────────────
  confirmSession: async (payload) => {
    const session = get().session
    if (!session) return null
    set({ submitting: true, submitError: null })
    try {
      const confirmed = await workSessionService.confirm(session.id, payload)
      set((state) => ({
        session: confirmed,
        today: state.today ? { ...state.today, session: confirmed } : state.today,
      }))
      return confirmed
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to confirm your day.") })
      }
      return null
    } finally {
      set({ submitting: false })
    }
  },

  // ─── History ───────────────────────────────────────────────────
  fetchHistory: async (params = {}) => {
    set({ historyLoading: true, historyError: null, lastHistoryParams: params })
    try {
      const response = await workSessionService.listMine(params)
      set({ history: response.data, historyPagination: response.pagination })
    } catch (err) {
      if (!isCancel(err)) {
        set({ historyError: extractErrorMessage(err, "Failed to load your sessions.") })
      }
    } finally {
      set({ historyLoading: false })
    }
  },

  // ─── Selected session ──────────────────────────────────────────
  fetchSession: async (id) => {
    set({ selectedLoading: true, selectedError: null, selectedSession: null })
    try {
      const session = await workSessionService.getMine(id)
      set({ selectedSession: session })
    } catch (err) {
      if (!isCancel(err)) {
        set({ selectedError: extractErrorMessage(err, "Failed to load session details.") })
      }
    } finally {
      set({ selectedLoading: false })
    }
  },

  // ─── Confirm a past open session (from History) ────────────────
  confirmSessionById: async (id, payload) => {
    set({ submitting: true, submitError: null })
    try {
      const confirmed = await workSessionService.confirm(id, payload)
      set((state) => {
        const items = confirmed.items ?? state.selectedSession?.items ?? []
        const done = items.filter((i) => i.outcome === "done").length
        const partial = items.filter((i) => i.outcome === "partial").length
        const notDone = items.filter((i) => i.outcome === "not_done").length
        const pending = items.filter((i) => i.outcome === "pending").length
        const completion = items.length > 0 ? ((done + 0.5 * partial) / items.length) * 100 : null
        return {
          selectedSession: state.selectedSession?.id === id ? confirmed : state.selectedSession,
          // Patch the matching history row so the table reflects the new status without a refetch
          history: state.history.map((row) =>
            row.id === id
              ? {
                  ...row,
                  ...confirmed,
                  items_count: items.length,
                  done_count: done,
                  partial_count: partial,
                  not_done_count: notDone,
                  pending_count: pending,
                  completion_pct: completion,
                }
              : row
          ),
          // If the confirmed session happens to be today's, keep that slice in sync too
          session: state.session?.id === id ? confirmed : state.session,
          today:
            state.today && state.today.session?.id === id
              ? { ...state.today, session: confirmed }
              : state.today
                ? {
                    ...state.today,
                    previous_open_sessions: state.today.previous_open_sessions.filter((s) => s.id !== id),
                  }
                : state.today,
        }
      })
      return confirmed
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to confirm session.") })
      }
      return null
    } finally {
      set({ submitting: false })
    }
  },

  // ─── Clear helpers ─────────────────────────────────────────────
  clearTodayError: () => set({ todayError: null }),
  clearSubmitError: () => set({ submitError: null }),
  clearHistoryError: () => set({ historyError: null }),
  clearSelectedSession: () => set({ selectedSession: null, selectedError: null }),
  clearSelectedError: () => set({ selectedError: null }),
}))
