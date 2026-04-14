import { useEffect } from "react"
import { useTasksStore } from "../store/taskStore"

/**
 * useTask — fetches a single task by ID on mount (or when the ID changes).
 *
 * Returns: selectedTask, selectedLoading, selectedError, clearSelectedError
 */
export function useTask(id: number | null) {
  const selectedTask = useTasksStore((s) => s.selectedTask)
  const selectedLoading = useTasksStore((s) => s.selectedLoading)
  const selectedError = useTasksStore((s) => s.selectedError)
  const fetchTask = useTasksStore((s) => s.fetchTask)
  const clearSelectedTask = useTasksStore((s) => s.clearSelectedTask)
  const clearSelectedError = useTasksStore((s) => s.clearSelectedError)

  useEffect(() => {
    if (id !== null) {
      fetchTask(id)
    }
    // Clear the selected task when the component that uses this hook unmounts
    return () => clearSelectedTask()
  }, [id, fetchTask, clearSelectedTask])

  return { task: selectedTask, loading: selectedLoading, error: selectedError, clearSelectedError }
}
