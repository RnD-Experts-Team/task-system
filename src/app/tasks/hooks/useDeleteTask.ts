// Hook for deleting a task via DELETE /tasks/{id}.
// Exposes deleting / deleteError aliased from the shared submitting / submitError store state.

import { useTasksStore } from "../store/taskStore"

export function useDeleteTask() {
  const deleteTask = useTasksStore((s) => s.deleteTask)
  // Reuse the shared submitting / submitError slices — only one mutation runs at a time
  const deleting = useTasksStore((s) => s.submitting)
  const deleteError = useTasksStore((s) => s.submitError)
  const clearDeleteError = useTasksStore((s) => s.clearSubmitError)

  return {
    /** Call this with the task ID; returns true on success, false on error */
    deleteTask: (id: number): Promise<boolean> => deleteTask(id),
    deleting,
    deleteError,
    clearDeleteError,
  }
}
