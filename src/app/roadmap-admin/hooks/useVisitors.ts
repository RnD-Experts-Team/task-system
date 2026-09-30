// src/app/roadmap-admin/hooks/useVisitors.ts
import { useCallback, useEffect, useRef } from "react"
import type { VisitorFilters } from "../services/roadmapAdminService"
import { useVisitorsStore } from "../store/visitorsStore"

/** Params-keyed fetch of the visitors list. */
export function useVisitors(params: VisitorFilters = {}) {
  const visitors = useVisitorsStore((s) => s.visitors)
  const pagination = useVisitorsStore((s) => s.pagination)
  const loading = useVisitorsStore((s) => s.loading)
  const error = useVisitorsStore((s) => s.error)
  const fetchVisitors = useVisitorsStore((s) => s.fetchVisitors)

  const paramsKey = JSON.stringify(params)
  const lastKey = useRef("")

  useEffect(() => {
    if (paramsKey !== lastKey.current) {
      lastKey.current = paramsKey
      void fetchVisitors(JSON.parse(paramsKey) as VisitorFilters)
    }
  }, [paramsKey, fetchVisitors])

  const refetch = useCallback(() => fetchVisitors(JSON.parse(paramsKey) as VisitorFilters), [fetchVisitors, paramsKey])
  return { visitors, pagination, loading, error, refetch }
}

/** Recent abuse events (fetched once on mount). */
export function useAbuseEvents() {
  const events = useVisitorsStore((s) => s.events)
  const loading = useVisitorsStore((s) => s.eventsLoading)
  const error = useVisitorsStore((s) => s.eventsError)
  const fetchEvents = useVisitorsStore((s) => s.fetchEvents)

  useEffect(() => {
    void fetchEvents()
  }, [fetchEvents])

  return { events, loading, error, refetch: fetchEvents }
}
