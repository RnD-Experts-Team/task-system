// Hook for updating a task via PUT /tasks/{id}.
// Shares the submitting / submitError state from the tasks store.

import { useTasksStore } from "../store/taskStore"
import type { UpdateTaskPayload } from "../types"
import type { Task } from "../types"

export function useUpdateTask() {
  const updateTask = useTasksStore((s) => s.updateTask)
  const submitting = useTasksStore((s) => s.submitting)
  const submitError = useTasksStore((s) => s.submitError)
  const clearSubmitError = useTasksStore((s) => s.clearSubmitError)

  return {
    /** Call this with the task ID and changed fields; returns updated Task or null */
    updateTask: (id: number, payload: UpdateTaskPayload): Promise<Task | null> =>
      updateTask(id, payload),
    submitting,
    submitError,
    clearSubmitError,
  }
}
