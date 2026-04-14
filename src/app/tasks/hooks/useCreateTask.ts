// Hook for creating a task via POST /tasks.
// Reads submitting / submitError from the shared tasks store.
// Returns clearSubmitError so the caller can reset errors on unmount.

import { useTasksStore } from "../store/taskStore"
import type { CreateTaskPayload } from "../types"
import type { Task } from "../types"

export function useCreateTask() {
  const createTask = useTasksStore((s) => s.createTask)
  const submitting = useTasksStore((s) => s.submitting)
  const submitError = useTasksStore((s) => s.submitError)
  const clearSubmitError = useTasksStore((s) => s.clearSubmitError)

  return {
    /** Call this with the form payload; returns the new Task or null on error */
    createTask: (payload: CreateTaskPayload): Promise<Task | null> =>
      createTask(payload),
    submitting,
    submitError,
    clearSubmitError,
  }
}
