import { useWorkspaceStore } from "../store/workspaceStore"

// Hook for updating an existing todo — thin wrapper around the store
export function useUpdateTodo() {
  const updateTodo = useWorkspaceStore((s) => s.updateTodo)
  const submitting = useWorkspaceStore((s) => s.todoSubmitting)
  const submitError = useWorkspaceStore((s) => s.todoSubmitError)
  const clearSubmitError = useWorkspaceStore((s) => s.clearTodoSubmitError)

  return {
    updateTodo,
    submitting,
    submitError,
    clearSubmitError,
  }
}
