// src/app/roadmap-admin/hooks/useChangelog.ts
import { useCallback, useEffect, useRef } from "react"
import { useChangelogStore } from "../store/changelogStore"
import type { ChangelogFilters } from "../types"

/** Params-keyed fetch of the changelog list. */
export function useChangelogList(params: ChangelogFilters = {}) {
  const entries = useChangelogStore((s) => s.entries)
  const pagination = useChangelogStore((s) => s.pagination)
  const loading = useChangelogStore((s) => s.loading)
  const error = useChangelogStore((s) => s.error)
  const fetchEntries = useChangelogStore((s) => s.fetchEntries)

  const paramsKey = JSON.stringify(params)
  const lastKey = useRef("")

  useEffect(() => {
    if (paramsKey !== lastKey.current) {
      lastKey.current = paramsKey
      void fetchEntries(JSON.parse(paramsKey) as ChangelogFilters)
    }
  }, [paramsKey, fetchEntries])

  const refetch = useCallback(() => fetchEntries(JSON.parse(paramsKey) as ChangelogFilters), [fetchEntries, paramsKey])
  return { entries, pagination, loading, error, refetch }
}

/** Loads one entry for the editor (nothing for /new). */
export function useChangelogEntry(id: number | null) {
  const entry = useChangelogStore((s) => s.entry)
  const loading = useChangelogStore((s) => s.entryLoading)
  const error = useChangelogStore((s) => s.entryError)
  const fetchEntry = useChangelogStore((s) => s.fetchEntry)
  const clearEntry = useChangelogStore((s) => s.clearEntry)

  useEffect(() => {
    if (id) void fetchEntry(id)
    else clearEntry()
    return () => clearEntry()
  }, [id, fetchEntry, clearEntry])

  const refetch = useCallback(() => (id ? fetchEntry(id) : Promise.resolve()), [id, fetchEntry])
  return { entry: entry && entry.id === id ? entry : null, loading, error, refetch }
}
