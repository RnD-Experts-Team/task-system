import { useEffect } from "react"
import { useWorkspaceStore } from "../store/workspaceStore"

// Hook to fetch and return todos for a workspace
// Triggers a fetch when workspaceId changes; clears on unmount
export function useTodos(workspaceId: number | null) {
  const todos = useWorkspaceStore((s) => s.todos)
  const loading = useWorkspaceStore((s) => s.todosLoading)
  const error = useWorkspaceStore((s) => s.todosError)
  const fetchTodos = useWorkspaceStore((s) => s.fetchTodos)
  const clearError = useWorkspaceStore((s) => s.clearTodosError)

  useEffect(() => {
    if (workspaceId !== null) {
      fetchTodos(workspaceId)
    }
  }, [workspaceId, fetchTodos])

  return {
    todos,
    loading,
    error,
    // Manual refetch for after create / delete operations
    refetch: () => workspaceId !== null && fetchTodos(workspaceId),
    clearError,
  }
}
