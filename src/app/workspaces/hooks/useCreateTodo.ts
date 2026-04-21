import { useWorkspaceStore } from "../store/workspaceStore"

// Hook for creating a new todo — thin wrapper around the store
export function useCreateTodo() {
  const createTodo = useWorkspaceStore((s) => s.createTodo)
  const submitting = useWorkspaceStore((s) => s.todoSubmitting)
  const submitError = useWorkspaceStore((s) => s.todoSubmitError)
  const clearSubmitError = useWorkspaceStore((s) => s.clearTodoSubmitError)

  return {
    createTodo,
    submitting,
    submitError,
    clearSubmitError,
  }
}
