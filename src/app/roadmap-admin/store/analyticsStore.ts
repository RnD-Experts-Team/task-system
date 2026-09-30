// src/app/roadmap-admin/store/analyticsStore.ts
import { create } from "zustand"
import { isCancel } from "axios"
import { roadmapAdminService } from "../services/roadmapAdminService"
import { extractErrorMessage } from "../utils/format"
import type { AnalyticsSummary } from "../types"

export interface AnalyticsParams {
  board_id?: number
  days?: number
}

interface AnalyticsState {
  data: AnalyticsSummary | null
  loading: boolean
  error: string | null
  lastParams: AnalyticsParams | null
}

interface AnalyticsActions {
  fetchAnalytics: (params?: AnalyticsParams) => Promise<void>
}

export const useAnalyticsStore = create<AnalyticsState & AnalyticsActions>()((set) => ({
  data: null,
  loading: false,
  error: null,
  lastParams: null,

  fetchAnalytics: async (params = {}) => {
    set({ loading: true, error: null, lastParams: params })
    try {
      const data = await roadmapAdminService.getAnalytics(params)
      set({ data })
    } catch (err) {
      if (!isCancel(err)) set({ error: extractErrorMessage(err, "Failed to load analytics.") })
    } finally {
      set({ loading: false })
    }
  },
}))
