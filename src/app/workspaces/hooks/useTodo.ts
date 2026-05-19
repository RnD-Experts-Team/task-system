import { useEffect } from "react"
import { useWorkspaceStore } from "../store/workspaceStore"

// Hook to fetch a single todo by ID
// Returns the todo with subtodos; clears on unmount
export function useTodo(workspaceId: number | null, todoId: number | null) {
  const selectedTodo = useWorkspaceStore((s) => s.selectedTodo)
  const loading = useWorkspaceStore((s) => s.selectedTodoLoading)
  const error = useWorkspaceStore((s) => s.selectedTodoError)
  const fetchTodo = useWorkspaceStore((s) => s.fetchTodo)
  const clearSelectedTodo = useWorkspaceStore((s) => s.clearSelectedTodo)

  useEffect(() => {
    if (workspaceId !== null && todoId !== null) {
      fetchTodo(workspaceId, todoId)
    }
    return () => clearSelectedTodo()
  }, [workspaceId, todoId, fetchTodo, clearSelectedTodo])

  return {
    todo: selectedTodo,
    loading,
    error,
  }
}
