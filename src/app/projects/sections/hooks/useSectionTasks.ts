// Hook to fetch all tasks (with assignment data) for a given section.
// Calls GET /sections/{sectionId}/tasks-with-assignments so each task includes
// the assigned_users array with pivot percentage data.
//
// Follows the same cancel-safe pattern as useKanban / useSections.
// Exposes a `refetch` function so callers can reload data after mutations.

import { useCallback, useEffect, useState } from "react"
import { isCancel } from "axios"
import { sectionService } from "../section-service"
import type { SectionTask } from "../types"

export function useSectionTasks(sectionId: number | null) {
  const [tasks, setTasks] = useState<SectionTask[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // useCallback keeps the reference stable — safe to include in effect deps
  // and to pass to child components as a refetch callback.
  const fetchTasks = useCallback(async () => {
    if (sectionId === null) return

    setLoading(true)
    setError(null)

    try {
      // Use the richer endpoint that includes assigned_users with pivot data
      const data = await sectionService.getTasksWithAssignments(sectionId)
      setTasks(data)
    } catch (err) {
      // Only show an error for genuine failures — ignore axios cancel errors
      // (those happen when clean-up cancels an in-flight request on unmount).
      if (!isCancel(err)) {
        setError("Failed to load tasks.")
      }
    } finally {
      setLoading(false)
    }
  }, [sectionId])

  // Fetch on mount and whenever sectionId changes
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return {
    tasks,
    loading,
    error,
    /** Call this after a task mutation to reload the list without remounting */
    refetch: fetchTasks,
  }
}
