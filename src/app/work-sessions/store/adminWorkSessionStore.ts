// src/app/work-sessions/store/adminWorkSessionStore.ts
// Admin-side zustand store for the Daily Work Sessions module: the cross-user
// session list (paginated), the selected session for the detail sheet, the
// reopen mutation, the cached user picker list and the realtime patching
// logic used by the "work-sessions.admin" channel.

import { create } from "zustand"
import { isCancel } from "axios"
import { workSessionService } from "../services/workSessionService"
import { extractErrorMessage } from "../utils/format"
import type {
  Pagination,
  SessionListParams,
  SessionUser,
  WorkSession,
  WorkSessionUpdatedPayload,
  WorkSessionWithCounts,
} from "../types"

// ─── State ────────────────────────────────────────────────────────

interface AdminWorkSessionState {
  // List slice — GET /work-sessions/admin/sessions
  sessions: WorkSessionWithCounts[]
  pagination: Pagination | null
  loading: boolean
  error: string | null
  lastParams: SessionListParams | null

  // Detail slice — GET /work-sessions/admin/sessions/{id}
  selectedSession: WorkSession | null
  selectedLoading: boolean
  selectedError: string | null

  // Reopen mutation slice — POST /work-sessions/admin/sessions/{id}/reopen
  reopening: boolean
  reopenError: string | null

  // User picker slice — GET /work-sessions/admin/users (fetched once, cached)
  users: SessionUser[]
  usersLoading: boolean
  usersError: string | null
  usersLoaded: boolean

  // Bumped whenever a realtime event references a session that is not in the
  // current page, so the list hook can schedule a (debounced) refetch.
  liveVersion: number
}

// ─── Actions ──────────────────────────────────────────────────────

interface AdminWorkSessionActions {
  /** Fetch the paginated cross-user session list */
  fetchSessions: (params?: SessionListParams) => Promise<void>
  /** Fetch a single session (with items + user) for the detail sheet */
  fetchSession: (id: number) => Promise<void>
  /** Reopen a confirmed session — returns the updated session or null */
  reopenSession: (id: number) => Promise<WorkSession | null>
  /** Fetch the user picker list once; subsequent calls are no-ops */
  fetchUsers: () => Promise<void>
  /** Apply a WorkSessionUpdated broadcast: patch the row in place or bump liveVersion */
  applyRealtime: (payload: WorkSessionUpdatedPayload) => void
  clearError: () => void
  clearSelectedError: () => void
  clearSelectedSession: () => void
  clearReopenError: () => void
  clearUsersError: () => void
}

type AdminWorkSessionStore = AdminWorkSessionState & AdminWorkSessionActions

// ─── Store ────────────────────────────────────────────────────────

export const useAdminWorkSessionStore = create<AdminWorkSessionStore>()((set, get) => ({
  // Initial state
  sessions: [],
  pagination: null,
  loading: false,
  error: null,
  lastParams: null,

  selectedSession: null,
  selectedLoading: false,
  selectedError: null,

  reopening: false,
  reopenError: null,

  users: [],
  usersLoading: false,
  usersError: null,
  usersLoaded: false,

  liveVersion: 0,

  // ─── List ──────────────────────────────────────────────────────
  fetchSessions: async (params: SessionListParams = {}) => {
    set({ loading: true, error: null, lastParams: params })
    try {
      const response = await workSessionService.adminList(params)
      set({ sessions: response.data, pagination: response.pagination })
    } catch (err) {
      // Skip cancelled requests (e.g. component unmount / params change)
      if (!isCancel(err)) {
        set({ error: extractErrorMessage(err, "Failed to load work sessions.") })
      }
    } finally {
      set({ loading: false })
    }
  },

  // ─── Detail ────────────────────────────────────────────────────
  fetchSession: async (id: number) => {
    set({ selectedLoading: true, selectedError: null, selectedSession: null })
    try {
      const session = await workSessionService.adminGet(id)
      set({ selectedSession: session })
    } catch (err) {
      if (!isCancel(err)) {
        set({ selectedError: extractErrorMessage(err, "Failed to load session details.") })
      }
    } finally {
      set({ selectedLoading: false })
    }
  },

  // ─── Reopen ────────────────────────────────────────────────────
  // Unlocks a confirmed session; patches the list row and the selected
  // session in place so both the table and the sheet update immediately.
  reopenSession: async (id: number) => {
    set({ reopening: true, reopenError: null })
    try {
      const updated = await workSessionService.adminReopen(id)
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === id
            ? {
                ...s,
                status: updated.status,
                confirmed_at: updated.confirmed_at,
                reopened_at: updated.reopened_at,
                reopened_by: updated.reopened_by,
                reopened_by_user: updated.reopened_by_user ?? s.reopened_by_user,
              }
            : s
        ),
        selectedSession:
          state.selectedSession && state.selectedSession.id === id
            ? {
                ...state.selectedSession,
                ...updated,
                // Keep the already-loaded relations if the reopen response omits them
                items: updated.items ?? state.selectedSession.items,
                user: updated.user ?? state.selectedSession.user,
              }
            : state.selectedSession,
      }))
      return updated
    } catch (err) {
      if (!isCancel(err)) {
        set({ reopenError: extractErrorMessage(err, "Failed to reopen session.") })
      }
      return null
    } finally {
      set({ reopening: false })
    }
  },

  // ─── Users (cached) ────────────────────────────────────────────
  fetchUsers: async () => {
    const { usersLoaded, usersLoading } = get()
    if (usersLoaded || usersLoading) return
    set({ usersLoading: true, usersError: null })
    try {
      const users = await workSessionService.adminUsers()
      set({ users, usersLoaded: true })
    } catch (err) {
      if (!isCancel(err)) {
        set({ usersError: extractErrorMessage(err, "Failed to load users.") })
      }
    } finally {
      set({ usersLoading: false })
    }
  },

  // ─── Realtime ──────────────────────────────────────────────────
  // If the broadcast references a row on the current page, patch it in place
  // (status, confirmed_at, counts, completion). Otherwise bump liveVersion so
  // the list hook refetches — e.g. a freshly started session that is not yet
  // in the table.
  applyRealtime: (payload: WorkSessionUpdatedPayload) => {
    const { sessions, selectedSession } = get()
    const exists = sessions.some((s) => s.id === payload.session_id)

    if (!exists) {
      set((state) => ({ liveVersion: state.liveVersion + 1 }))
      return
    }

    set({
      sessions: sessions.map((s) =>
        s.id === payload.session_id
          ? {
              ...s,
              status: payload.status,
              confirmed_at: payload.confirmed_at,
              items_count: payload.counts.items,
              done_count: payload.counts.done,
              partial_count: payload.counts.partial,
              not_done_count: payload.counts.not_done,
              pending_count: payload.counts.pending,
              completion_pct: payload.completion_pct,
            }
          : s
      ),
      // Keep the open detail sheet's header in sync (items are refetched on demand)
      selectedSession:
        selectedSession && selectedSession.id === payload.session_id
          ? { ...selectedSession, status: payload.status, confirmed_at: payload.confirmed_at }
          : selectedSession,
    })
  },

  // ─── Clear helpers ─────────────────────────────────────────────
  clearError: () => set({ error: null }),
  clearSelectedError: () => set({ selectedError: null }),
  clearSelectedSession: () => set({ selectedSession: null, selectedError: null }),
  clearReopenError: () => set({ reopenError: null }),
  clearUsersError: () => set({ usersError: null }),
}))
