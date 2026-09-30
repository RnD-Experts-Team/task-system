// src/app/roadmap-admin/store/visitorsStore.ts
// Visitors list (params-keyed), the selected visitor detail, ban / unban / bulk-remove and the
// recent abuse events feed.

import { create } from "zustand"
import { isCancel } from "axios"
import { roadmapAdminService, type VisitorFilters } from "../services/roadmapAdminService"
import { extractErrorMessage } from "../utils/format"
import { attempt, type MutationResult } from "../utils/mutation"
import type {
  AbuseEvent,
  AdminVisitor,
  AdminVisitorDetail,
  BanPayload,
  BulkRemovePayload,
  BulkRemoveResult,
  Pagination,
} from "../types"

interface VisitorsState {
  visitors: AdminVisitor[]
  pagination: Pagination | null
  loading: boolean
  error: string | null
  lastParams: VisitorFilters | null

  selected: AdminVisitorDetail | null
  selectedLoading: boolean
  selectedError: string | null

  events: AbuseEvent[]
  eventsLoading: boolean
  eventsError: string | null
}

interface VisitorsActions {
  fetchVisitors: (params?: VisitorFilters) => Promise<void>
  fetchVisitor: (id: string) => Promise<void>
  clearSelected: () => void
  fetchEvents: () => Promise<void>
  ban: (id: string, payload: BanPayload) => Promise<MutationResult<AdminVisitor>>
  unban: (id: string) => Promise<MutationResult<AdminVisitor>>
  bulkRemove: (payload: BulkRemovePayload) => Promise<MutationResult<BulkRemoveResult>>
}

export const useVisitorsStore = create<VisitorsState & VisitorsActions>()((set, get) => {
  const applyVisitor = (updated: AdminVisitor) => {
    set((s) => ({
      visitors: s.visitors.map((v) => (v.id === updated.id ? { ...v, ...updated } : v)),
      selected: s.selected && s.selected.id === updated.id ? { ...s.selected, ...updated } : s.selected,
    }))
  }

  return {
    visitors: [],
    pagination: null,
    loading: false,
    error: null,
    lastParams: null,
    selected: null,
    selectedLoading: false,
    selectedError: null,
    events: [],
    eventsLoading: false,
    eventsError: null,

    fetchVisitors: async (params = {}) => {
      set({ loading: true, error: null, lastParams: params })
      try {
        const res = await roadmapAdminService.listVisitors(params)
        set({ visitors: res.data, pagination: res.pagination })
      } catch (err) {
        if (!isCancel(err)) set({ error: extractErrorMessage(err, "Failed to load visitors.") })
      } finally {
        set({ loading: false })
      }
    },

    fetchVisitor: async (id) => {
      set({ selectedLoading: true, selectedError: null, selected: null })
      try {
        const detail = await roadmapAdminService.getVisitor(id)
        set({ selected: detail })
      } catch (err) {
        if (!isCancel(err)) set({ selectedError: extractErrorMessage(err, "Failed to load the visitor.") })
      } finally {
        set({ selectedLoading: false })
      }
    },

    clearSelected: () => set({ selected: null, selectedError: null, selectedLoading: false }),

    fetchEvents: async () => {
      set({ eventsLoading: true, eventsError: null })
      try {
        const res = await roadmapAdminService.listAbuseEvents({ per_page: 30 })
        set({ events: res.data })
      } catch (err) {
        if (!isCancel(err)) set({ eventsError: extractErrorMessage(err, "Failed to load abuse events.") })
      } finally {
        set({ eventsLoading: false })
      }
    },

    ban: async (id, payload) => {
      const result = await attempt(() => roadmapAdminService.banVisitor(id, payload), "Failed to ban the visitor.")
      if (result.ok) {
        applyVisitor(result.data)
        // Removing content/votes changes the counters — refresh the open detail.
        if (get().selected?.id === id) await get().fetchVisitor(id)
      }
      return result
    },

    unban: async (id) => {
      const result = await attempt(() => roadmapAdminService.unbanVisitor(id), "Failed to unban the visitor.")
      if (result.ok) applyVisitor(result.data)
      return result
    },

    bulkRemove: async (payload) => {
      const result = await attempt(() => roadmapAdminService.bulkRemove(payload), "Bulk removal failed.")
      if (result.ok) {
        if (get().lastParams) await get().fetchVisitors(get().lastParams ?? {})
        await get().fetchEvents()
      }
      return result
    },
  }
})
