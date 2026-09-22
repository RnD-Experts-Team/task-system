import { useEffect, useRef, useState } from "react"
import { isCancel } from "axios"
import { workSessionService } from "../services/workSessionService"
import type { AssignableTask } from "../types"
import { extractErrorMessage } from "../utils/format"

// Debounce delay for the search term so the API isn't hit on every keystroke
const SEARCH_DEBOUNCE_MS = 300

/**
 * useAssignableTasks — local-state hook around GET /work-sessions/assignable-tasks.
 * Fetches once on mount (when `enabled`) and again whenever the debounced
 * search term changes. Ignores stale responses from earlier requests.
 *
 * Returns: tasks, loading, error, search, setSearch, refetch
 */
export function useAssignableTasks(enabled = true) {
  const [tasks, setTasks] = useState<AssignableTask[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  // Bumped by refetch() to force a new request with the same search term
  const [tick, setTick] = useState(0)
  // Incrementing request id lets us drop responses that arrive out of order
  const requestId = useRef(0)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (!enabled) return
    const current = ++requestId.current
    let active = true

    // Same pattern as useAllUsers: state updates happen inside the async loader
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await workSessionService.getAssignableTasks(debouncedSearch || undefined)
        if (active && current === requestId.current) setTasks(result)
      } catch (err) {
        if (active && current === requestId.current && !isCancel(err)) {
          setError(extractErrorMessage(err, "Failed to load tasks."))
        }
      } finally {
        if (active && current === requestId.current) setLoading(false)
      }
    }

    load()

    // Cleanup: discard results from a request that was superseded or unmounted
    return () => {
      active = false
    }
  }, [enabled, debouncedSearch, tick])

  return {
    tasks,
    loading,
    error,
    search,
    setSearch,
    /** Force a re-fetch with the current search term */
    refetch: () => setTick((t) => t + 1),
  }
}
