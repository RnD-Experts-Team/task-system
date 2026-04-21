import { useWorkspaceStore } from "../store/workspaceStore"

// Hook for deleting a todo — thin wrapper around the store
export function useDeleteTodo() {
  const deleteTodo = useWorkspaceStore((s) => s.deleteTodo)
  const deleting = useWorkspaceStore((s) => s.todoSubmitting)
  const deleteError = useWorkspaceStore((s) => s.todoSubmitError)
  const clearDeleteError = useWorkspaceStore((s) => s.clearTodoSubmitError)

  return {
    deleteTodo,
    deleting,
    deleteError,
    clearDeleteError,
  }
}
