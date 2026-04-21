import { useEffect, useRef } from "react"
import { useWorkspaceStore } from "../store/workspaceStore"

/**
 * Hook to fetch and access the list of workspaces.
 * Automatically fetches on mount and re-fetches when called again.
 */
export function useWorkspaces() {
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const loading = useWorkspaceStore((s) => s.loading)
  const error = useWorkspaceStore((s) => s.error)
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces)
  const clearError = useWorkspaceStore((s) => s.clearError)

  // Track whether we already fetched to avoid duplicate calls
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
      fetchWorkspaces()
    }
  }, [fetchWorkspaces])

  return {
    workspaces,
    loading,
    error,
    refetch: fetchWorkspaces,
    clearError,
  }
}
