// src/app/roadmap-admin/hooks/useAnalytics.ts
// Params-keyed fetch of GET /analytics/summary.
import { useCallback, useEffect, useRef } from "react"
import { useAnalyticsStore, type AnalyticsParams } from "../store/analyticsStore"

export function useAnalytics(params: AnalyticsParams = {}) {
  const data = useAnalyticsStore((s) => s.data)
  const loading = useAnalyticsStore((s) => s.loading)
  const error = useAnalyticsStore((s) => s.error)
  const fetchAnalytics = useAnalyticsStore((s) => s.fetchAnalytics)

  const paramsKey = JSON.stringify(params)
  const lastKey = useRef("")

  useEffect(() => {
    if (paramsKey !== lastKey.current) {
      lastKey.current = paramsKey
      void fetchAnalytics(JSON.parse(paramsKey) as AnalyticsParams)
    }
  }, [paramsKey, fetchAnalytics])

  const refetch = useCallback(() => fetchAnalytics(JSON.parse(paramsKey) as AnalyticsParams), [fetchAnalytics, paramsKey])
  return { data, loading, error, refetch }
}
